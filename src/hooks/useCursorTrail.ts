import { mix } from "motion"
import { useReducedMotion } from "motion/react"
import { useCallback, useRef, type RefObject } from "react"
import { proxy } from "valtio"
import { hugeEaseOut, lerp } from "../utils/interpolation"
import type { Coordinate } from "../utils/types"
import { useCanvas } from "./useCanvas"
import { useConstant } from "./useConstant"
import { useCursor } from "./useCursor"

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
  // ballColor?: string
  initialBallColor?: string
  endBallColor?: string
  initialBallRadius?: number
}

const useBalls = (options?: UseCursorTrailOptions) => {
  const {
    numBalls = 4000,
    lerpFactor = 0.85,
    // ballColor = "purple",
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
    const colorMixer = mix(initialBallColor, endBallColor)

    // Update the positions of the balls based on their targets
    for (let i = 0; i < numBalls; i++) {
      const target = ballTargets[i]
      const ball = balls[i]
      const radius = isMoving.current
        ? lastRadius * (1 - i / numBalls)
        : lerp(ball.radius, 0, 0.1)
      lastRadius = radius
      // weight towards the end color based on the ball's index
      ball.color = endBallColor
        ? colorMixer(hugeEaseOut(i / numBalls))
        : initialBallColor

      // Lerp towards the target position
      ball.x = lerp(ball.x, target.x, lerpFactor)
      ball.y = lerp(ball.y, target.y, lerpFactor)
      ball.radius = radius

      // Update the target for the next ball to be the current ball's position
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

/**
 * Creates a cursor trail effect using a canvas element.
 * @param {UseCursorTrailOptions} [options] - Configuration options for the cursor trail.
 * @returns {RefObject<HTMLCanvasElement | null>} - A ref object for the canvas element.
 */
export const useCursorTrail = (
  options?: UseCursorTrailOptions,
): RefObject<HTMLCanvasElement | null> => {
  const { balls, updateBalls } = useBalls(options)
  const shouldReduceMotion = useReducedMotion()

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
