import { mix } from "motion"
import { useReducedMotionConfig } from "motion/react"
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
  fillAnimationSpeeds?: [number, number]
}

interface RectFillState {
  progress: number
  isInside: boolean
  entryPoint: Coordinate
  exitPoint: Coordinate
}

const isBallInsideRect = (ball: Ball, rects?: Rect[]): boolean => {
  if (!rects || rects.length === 0) return false
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    if (
      ball.x + ball.radius >= rect.left &&
      ball.x - ball.radius <= rect.right &&
      ball.y + ball.radius >= rect.top &&
      ball.y - ball.radius <= rect.bottom
    ) {
      return true
    }
  }
  return false
}

const DEFAULT_BALL_COLOR = "#465946"

const useBalls = (options?: UseCursorTrailOptions) => {
  const {
    numBalls = 4000,
    lerpFactor = 0.85,
    initialBallColor = DEFAULT_BALL_COLOR,
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

  const updateBalls = useCallback(
    (fillRects?: Rect[]) => {
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
      const colorMixer = mix(
        initialBallColor,
        endBallColor ?? DEFAULT_BALL_COLOR,
      )

      // Update the positions of the balls based on their targets
      for (let i = 0; i < numBalls; i++) {
        const target = ballTargets[i]
        const ball = balls[i]
        const isBallInsideAFillRect = isBallInsideRect(ball, fillRects)
        const radius = isMoving.current
          ? lastRadius * (1 - i / numBalls)
          : lerp(ball.radius, 0, 0.1)
        lastRadius = radius
        ball.color = endBallColor
          ? colorMixer(hugeEaseOut(i / numBalls))
          : initialBallColor

        ball.x = lerp(ball.x, target.x, lerpFactor)
        ball.y = lerp(ball.y, target.y, lerpFactor)
        ball.radius = isBallInsideAFillRect ? 0 : radius

        if (i < numBalls - 1) {
          ballTargets[i + 1].x = ball.x
          ballTargets[i + 1].y = ball.y
        }
      }
    },
    [
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
    ],
  )

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
  const shouldReduceMotion = useReducedMotionConfig()
  const enterFillAnimationSpeed = options?.fillAnimationSpeeds?.[0] ?? 0.08
  const exitFillAnimationSpeed = options?.fillAnimationSpeeds?.[1] ?? 0.2

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

    updateBalls(fillTargetRects)

    // Draw and animate rect fills with growing circle
    if (fillTargetRects && fillTargetRects.length > 0) {
      fillTargetRects.forEach((rect) => {
        const isInside = isCursorInsideTargetRect(cursor, rect)

        // Initialize fill state if needed
        if (!rectFillStates.has(rect)) {
          rectFillStates.set(rect, {
            progress: 0,
            isInside: false,
            entryPoint: { x: rect.left, y: rect.bottom },
            exitPoint: { x: rect.left, y: rect.bottom },
          })
        }

        const fillState = rectFillStates.get(rect)!

        // Update fill progress and capture entry/exit points
        if (isInside && !fillState.isInside) {
          // Just entered - capture cursor position as entry point
          fillState.isInside = true
          fillState.entryPoint = { x: cursor.x, y: cursor.y }
        } else if (!isInside && fillState.isInside) {
          // Just exited - capture last cursor position as exit point
          fillState.isInside = false
          fillState.exitPoint = { x: cursor.x, y: cursor.y }
        }

        // Animate progress
        const targetProgress = fillState.isInside ? 1 : 0
        fillState.progress = lerp(
          fillState.progress,
          targetProgress,
          isInside ? enterFillAnimationSpeed : exitFillAnimationSpeed,
        )

        // Draw growing/shrinking circle fill
        if (fillState.progress > 0.01) {
          const fillColor = options?.initialBallColor || DEFAULT_BALL_COLOR

          // Use entry point when growing, exit point when shrinking
          const originX = fillState.isInside
            ? fillState.entryPoint.x
            : fillState.exitPoint.x
          const originY = fillState.isInside
            ? fillState.entryPoint.y
            : fillState.exitPoint.y

          // Calculate the radius needed to fill the entire rect from the origin point
          // Find the farthest corner from the origin
          const corners: Coordinate[] = [
            { x: rect.left, y: rect.top },
            { x: rect.right, y: rect.top },
            { x: rect.left, y: rect.bottom },
            { x: rect.right, y: rect.bottom },
          ]

          const maxRadius = Math.max(
            ...corners.map((corner) =>
              Math.sqrt((corner.x - originX) ** 2 + (corner.y - originY) ** 2),
            ),
          )

          const currentRadius = maxRadius * fillState.progress

          // Clip the circle to rect boundaries
          ctx.save()
          ctx.beginPath()
          ctx.rect(rect.left, rect.top, rect.width, rect.height)
          ctx.clip()

          // Draw the circle
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
