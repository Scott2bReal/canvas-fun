import { useEffect, useRef } from "react"

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) throw new CanvasError("Canvas element not found")

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new CanvasError("2D context not available")

    const dpr = window.devicePixelRatio || 1

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationId: number
    const render = () => {
      draw(ctx, canvas)
      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [draw])

  return canvasRef
}
