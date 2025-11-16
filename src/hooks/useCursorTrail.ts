import { mix } from "motion"
import { useReducedMotion } from "motion/react"
import { useCallback, useRef, type RefObject } from "react"
import { proxy } from "valtio"
import { hugeEaseOut, lerp } from "../utils/interpolation"
import type { Coordinate } from "../utils/types"
import { useCanvas } from "./useCanvas"
import { useConstant } from "./useConstant"
import { useCursor } from "./useCursor"
import type { Rect } from "./useDomRect"

const useDetectCursorMovement = () => {
  const cursor = useCursor()
  const lastCursorPos = useConstant(() => proxy<Coordinate>({ x: 0, y: 0 }))
  const isMoving = useConstant(() =>
    proxy<{ current: boolean }>({ current: false }),
  )
  const velocitySquared = useConstant(() =>
    proxy<{ current: number }>({ current: 0 }),
  )
  const moveThreshold = 0.1
  const movementTimeout = useRef<number | null>(null)

  return {
    isMoving,
    velocitySquared,
    updateCursorMovement: () => {
      const dx = cursor.x - lastCursorPos.x
      const dy = cursor.y - lastCursorPos.y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared > moveThreshold * moveThreshold) {
        isMoving.current = true
        lastCursorPos.x = cursor.x
        lastCursorPos.y = cursor.y

        if (movementTimeout.current) {
          clearTimeout(movementTimeout.current)
        }
        movementTimeout.current = window.setTimeout(() => {
          isMoving.current = false
        }, 100)
      }
    },
  }
}

interface Ball extends Coordinate {
  radius: number
  color: string
}

interface UseCursorTrailOptions {
  numBalls?: number
  lerpFactor?: number
  initialBallColor?: string
  endBallColor?: string
  initialBallRadius?: number
  fillAnimationSpeed?: number
}

interface RectFillState {
  progress: number
  isInside: boolean
}

const useBalls = (options?: UseCursorTrailOptions) => {
  const {
    numBalls = 4000,
    lerpFactor = 0.85,
    initialBallColor = "rgba(128, 0, 128, 1)",
    endBallColor,
    initialBallRadius = 10,
  } = options ?? {}

  const balls: Ball[] = useConstant(() =>
    Array.from({ length: numBalls }, () =>
      proxy<Ball>({
        x: 0,
        y: 0,
        radius: initialBallRadius,
        color: initialBallColor,
      }),
    ),
  )
  const ballTargets = useConstant(() =>
    Array.from({ length: numBalls }, () => proxy<Coordinate>({ x: 0, y: 0 })),
  )

  const cursor = useCursor()
  const { isMoving, updateCursorMovement } = useDetectCursorMovement()

  const updateBalls = useCallback(() => {
    if (!cursor) return

    updateCursorMovement()

    if (cursor.hasMoved && balls[0].x === 0 && balls[0].y === 0) {
      // Initialize all balls to the cursor position on first move
      for (let i = 0; i < numBalls; i++) {
        balls[i].x = cursor.x
        balls[i].y = cursor.y
        ballTargets[i].x = cursor.x
        ballTargets[i].y = cursor.y
      }
    }

    // Update the target position of the first ball to the cursor position
    ballTargets[0].x = cursor.x
    ballTargets[0].y = cursor.y

    let lastRadius = initialBallRadius
    const colorMixer = mix(initialBallColor, endBallColor ?? "")

    // Update the positions of the balls based on their targets
    for (let i = 0; i < numBalls; i++) {
      const target = ballTargets[i]
      const ball = balls[i]
      const radius = isMoving.current
        ? lastRadius * (1 - i / numBalls)
        : lerp(ball.radius, 0, 0.1)
      lastRadius = radius
      ball.color = endBallColor
        ? colorMixer(hugeEaseOut(i / numBalls))
        : initialBallColor

      ball.x = lerp(ball.x, target.x, lerpFactor)
      ball.y = lerp(ball.y, target.y, lerpFactor)
      ball.radius = radius

      if (i < numBalls - 1) {
        ballTargets[i + 1].x = ball.x
        ballTargets[i + 1].y = ball.y
      }
    }
  }, [
    balls,
    ballTargets,
    cursor,
    lerpFactor,
    numBalls,
    updateCursorMovement,
    initialBallRadius,
    isMoving,
    initialBallColor,
    endBallColor,
  ])

  return {
    balls,
    updateBalls,
    ballRadius: initialBallRadius,
  }
}

const isCursorInsideTargetRect = (
  cursor: ReturnType<typeof useCursor>,
  rect: Rect,
): boolean => {
  if (!cursor || !rect) return false
  return (
    cursor.x >= rect.left &&
    cursor.x <= rect.right &&
    cursor.y >= rect.top &&
    cursor.y <= rect.bottom
  )
}

/**
 * Creates a cursor trail effect using a canvas element with animated rect filling.
 * @param {UseCursorTrailOptions} [options] - Configuration options for the cursor trail.
 * @param {Rect[]} [fillTargetRects] - Array of rectangles to fill when cursor enters.
 * @returns {RefObject<HTMLCanvasElement | null>} - A ref object for the canvas element.
 */
export const useCursorTrail = (
  options?: UseCursorTrailOptions,
  fillTargetRects?: Rect[],
): RefObject<HTMLCanvasElement | null> => {
  const { balls, updateBalls } = useBalls(options)
  const shouldReduceMotion = useReducedMotion()
  const fillAnimationSpeed = options?.fillAnimationSpeed ?? 0.08

  // Track fill state for each rect
  const rectFillStates = useConstant(() => new Map<Rect, RectFillState>())

  const cursor = useCursor()

  const draw = (
    ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
  ) => {
    if (!cursor.hasMoved || shouldReduceMotion) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    updateBalls()

    // Draw and animate rect fills with growing circle
    if (fillTargetRects && fillTargetRects.length > 0) {
      fillTargetRects.forEach((rect) => {
        const isInside = isCursorInsideTargetRect(cursor, rect)

        // Initialize fill state if needed
        if (!rectFillStates.has(rect)) {
          rectFillStates.set(rect, { progress: 0, isInside: false })
        }

        const fillState = rectFillStates.get(rect)!

        // Update fill progress
        if (isInside && !fillState.isInside) {
          // Just entered
          fillState.isInside = true
        } else if (!isInside && fillState.isInside) {
          // Just exited
          fillState.isInside = false
        }

        // Animate progress
        const targetProgress = fillState.isInside ? 1 : 0
        fillState.progress = lerp(
          fillState.progress,
          targetProgress,
          fillAnimationSpeed,
        )

        // Draw growing circle fill from lower left
        if (fillState.progress > 0.01) {
          const fillColor = options?.initialBallColor || "rgba(128, 0, 128, 0)"

          // Calculate circle origin (lower left corner)
          const originX = rect.left
          const originY = rect.bottom

          // Calculate the radius needed to fill the entire rect from lower left
          // This is the distance to the farthest corner (top right)
          const maxRadius = Math.sqrt(rect.width ** 2 + rect.height ** 2)
          const currentRadius = maxRadius * fillState.progress

          // Use clipping to constrain circle to rect bounds
          ctx.save()
          ctx.beginPath()
          ctx.rect(rect.left, rect.top, rect.width, rect.height)
          ctx.clip()

          // Draw the growing circle
          ctx.fillStyle = fillColor
          ctx.beginPath()
          ctx.arc(originX, originY, currentRadius, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        }
      })
    }

    // Draw balls on top
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i]
      ctx.fillStyle = ball.color
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const canvasRef = useCanvas(draw)
  return canvasRef
}
