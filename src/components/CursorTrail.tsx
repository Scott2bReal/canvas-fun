import { useAnimationFrame } from "motion/react"
import { useCallback, useRef } from "react"
import { proxy } from "valtio"
import { useCanvas } from "../hooks/useCanvas"
import { useConstant } from "../hooks/useConstant"
import { useCursor } from "../hooks/useCursor"
import { lerp } from "../utils/interpolation"

interface Coordinate {
  x: number
  y: number
}

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
}
interface UseCursorTrailOptions {
  numBalls: number
  lerpFactor?: number
  ballColor?: string
  initialBallRadius?: number
}

const useCursorTrail = ({
  numBalls,
  lerpFactor = 0.1,
  ballColor = "purple",
  initialBallRadius = 20,
}: UseCursorTrailOptions) => {
  const balls = useConstant(() =>
    Array.from({ length: numBalls }, () =>
      proxy<Ball>({ x: 0, y: 0, radius: initialBallRadius }),
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

    // Update the positions of the balls based on their targets
    for (let i = 0; i < numBalls; i++) {
      const target = ballTargets[i]
      const ball = balls[i]
      const radius = isMoving.current
        ? lastRadius * (1 - i / numBalls)
        : lerp(ball.radius, 0, 0.1)
      lastRadius = radius

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
  ])

  return { balls, updateBalls, ballColor, ballRadius: initialBallRadius }
}

export const CursorTrail = () => {
  const { balls, updateBalls, ballColor } = useCursorTrail({
    numBalls: 4000,
    lerpFactor: 0.85,
    ballColor: "purple",
    initialBallRadius: 10,
  })

  const cursor = useCursor()
  const draw = (
    ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
  ) => {
    if (!cursor.hasMoved) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    updateBalls()

    ctx.fillStyle = ballColor
    // let lastRadius = ballRadius

    for (let i = 0; i < balls.length; i++) {
      ctx.beginPath()
      const ball = balls[i]
      // const radius = lastRadius * (1 - i / balls.length)
      // lastRadius = radius
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const canvasRef = useCanvas(draw)
  const jsonRef = useRef<HTMLPreElement>(null)

  useAnimationFrame((_t, delta) => {
    const fps = delta ? 1000 / delta : 0
    if (jsonRef.current) {
      jsonRef.current.textContent = `FPS: ${fps.toFixed(1)}`
    }
  })

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen z-10 pointer-events-none border-purple-500 border"
      />
      <pre
        className="fixed text-right top-0 right-0 bg-black/50 text-lime-500"
        ref={jsonRef}
      ></pre>
    </>
  )
}
