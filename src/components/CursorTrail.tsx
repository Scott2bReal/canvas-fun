import { useAnimationFrame } from "motion/react"
import { useRef } from "react"
import { proxy } from "valtio"
import { useCanvas } from "../hooks/useCanvas"
import { useConstant } from "../hooks/useConstant"
import { useCursor } from "../hooks/useCursor"
import { lerp } from "../utils/interpolation"

interface Coordinate {
  x: number
  y: number
}

interface UseCursorTrailOptions {
  numBalls: number
  lerpFactor?: number
  ballColor?: string
  ballRadius?: number
}

const useCursorTrail = ({
  numBalls,
  lerpFactor = 0.1,
  ballColor = "purple",
  ballRadius = 20,
}: UseCursorTrailOptions) => {
  const balls = useConstant(() =>
    Array.from({ length: numBalls }, () => proxy<Coordinate>({ x: 0, y: 0 })),
  )
  const ballTargets = useConstant(() =>
    Array.from({ length: numBalls }, () => proxy<Coordinate>({ x: 0, y: 0 })),
  )
  const cursor = useCursor()
  const updateBalls = () => {
    if (!cursor) return

    // Update the target position of the first ball to the cursor position
    ballTargets[0].x = cursor.x
    ballTargets[0].y = cursor.y

    // Update the positions of the balls based on their targets
    for (let i = 0; i < numBalls; i++) {
      const target = ballTargets[i]
      const ball = balls[i]

      // Lerp towards the target position
      ball.x = lerp(ball.x, target.x, lerpFactor)
      ball.y = lerp(ball.y, target.y, lerpFactor)

      // Update the target for the next ball to be the current ball's position
      if (i < numBalls - 1) {
        ballTargets[i + 1].x = ball.x
        ballTargets[i + 1].y = ball.y
      }
    }
  }
  return { balls, updateBalls, ballColor, ballRadius }
}

export const CursorTrail = () => {
  const { balls, updateBalls, ballColor, ballRadius } = useCursorTrail({
    numBalls: 2000,
    lerpFactor: 0.7,
    ballColor: "purple",
    ballRadius: 20,
  })

  const draw = (
    ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
  ) => {
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    updateBalls()

    ctx.fillStyle = ballColor
    let lastRadius = ballRadius
    for (let i = 0; i < balls.length; i++) {
      ctx.beginPath()
      const ball = balls[i]
      const radius = lastRadius * (1 - i / balls.length)
      lastRadius = radius
      ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
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
