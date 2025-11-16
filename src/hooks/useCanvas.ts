import { useEffect, useRef } from "react"
import { useDomRect } from "./useDomRect"

class CanvasError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CanvasError"
  }
}

export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRect = useDomRect(canvasRef)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) throw new CanvasError("Canvas element not found")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new CanvasError("2D context not available")

    const dpr = window.devicePixelRatio || 1

    const resizeCanvas = () => {
      canvas.width = canvasRect.width * dpr
      canvas.height = canvasRect.height * dpr
    }

    resizeCanvas()

    let animationId: number
    const render = () => {
      resizeCanvas()
      animationId = requestAnimationFrame(render)
      draw(ctx, canvas)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [draw, canvasRect.width, canvasRect.height])

  return canvasRef
}
