import { useAnimationFrame } from "motion/react"
import { useCallback, useRef } from "react"
import { proxy } from "valtio"
import { useCanvas } from "../hooks/useCanvas"
import { useConstant } from "../hooks/useConstant"
import { lerp } from "../utils/interpolation"
import type { Coordinate } from "../utils/types"

const MAX_T = 7
const LERP_FACTOR = 0.1

// const EPSILON = 1e-6
// export function lerp(min: number, max: number, t: number) {
//   const result = min + (max - min) * t
//   if (Math.abs(max - min) < EPSILON) {
//     return min // Avoid division by zero, return min if max and min are effectively equal
//   }
//   return result
// }

export const PathingExample = () => {
  const t = useConstant(() => proxy({ value: 0 }))
  const currentPosition = useConstant(() => proxy<Coordinate>({ x: 0, y: 0 }))

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const dpr = window.devicePixelRatio || 1
      // ctx.setTransform(dpr, 0, 0, dpr, 0H 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const p0: Coordinate = { x: canvas.width * 0.25, y: canvas.height * 0.25 }
      const p1: Coordinate = { x: canvas.width * 0.75, y: canvas.height * 0.75 }

      currentPosition.x = lerp(p0.x, p1.x, t.value)
      currentPosition.y = lerp(p0.y, p1.y, t.value)

      ctx.fillStyle = "purple"
      ctx.beginPath()
      ctx.arc(currentPosition.x, currentPosition.y, 20, 0, Math.PI * 2)
      ctx.fill()
    },
    [t, currentPosition],
  )

  const jsonRef = useRef<HTMLPreElement>(null)

  useAnimationFrame((time) => {
    const timeInSeconds = time * 0.001
    t.value = Math.abs(Math.sin((timeInSeconds / MAX_T) * Math.PI))

    jsonRef.current!.textContent = `t: ${t.value.toFixed(3)}`
  })

  const canvasRef = useCanvas(draw)

  return (
    <div>
      <pre
        ref={jsonRef}
        className="bg-black/80 fixed top-0 right-0 text-lime-500 z-50 text-right"
      ></pre>
      <canvas
        className="fixed top-0 left-0 w-screen h-screen border border-purple-500 pointer-events-none"
        ref={canvasRef}
      />
    </div>
  )
}
