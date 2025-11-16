import { useAnimationFrame } from "motion/react"
import { useRef } from "react"
import { useCursorTrail } from "../hooks/useCursorTrail"

// Colors that look good on ochre
const initialBallColor = "#465946"

export const CursorTrail = ({ showFps = false }: { showFps?: boolean }) => {
  const jsonRef = useRef<HTMLPreElement>(null)
  const canvasRef = useCursorTrail({
    numBalls: 1200,
    initialBallColor,
    lerpFactor: 0.75,
  })

  useAnimationFrame((_t, delta) => {
    if (!showFps) return
    const fps = delta ? 1000 / delta : 0
    if (jsonRef.current) {
      jsonRef.current.textContent = `FPS: ${fps.toFixed(1)}`
    }
  })

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen z-10 pointer-events-none"
      />
      {showFps && (
        <pre
          className="fixed text-right top-0 right-0 bg-black/50 text-lime-500"
          ref={jsonRef}
        ></pre>
      )}
    </>
  )
}
