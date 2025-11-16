import { useAnimationFrame } from "motion/react"
import { useRef } from "react"
import { useCursorTrail } from "../hooks/useCursorTrail"
import { useDomRect } from "../hooks/useDomRect"

const initialBallColor = "#465946"

export const CursorTrail = ({ showFps = false }: { showFps?: boolean }) => {
  const jsonRef = useRef<HTMLPreElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const targetRect = useDomRect(targetRef)
  const anotherTargetRef = useRef<HTMLDivElement>(null)
  const anotherTargetRect = useDomRect(anotherTargetRef)
  const footerRef = useRef<HTMLElement>(null)
  const footerRect = useDomRect(footerRef)

  const canvasRef = useCursorTrail(
    {
      numBalls: 1200,
      initialBallColor,
      lerpFactor: 0.75,
    },
    [targetRect, anotherTargetRect, footerRect],
  )

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
      <div className="flex gap-32 items-center">
        <div ref={targetRef} className="size-16 border border-dark-green"></div>
        <div
          ref={anotherTargetRef}
          className="size-40 border border-dark-green"
        ></div>
      </div>
      {showFps && (
        <pre
          className="fixed text-right top-0 right-0 bg-black/50 text-lime-500"
          ref={jsonRef}
        ></pre>
      )}
      <footer
        ref={footerRef}
        className="absolute hover:text-yellow bottom-4 text-sm text-medium-green z-50"
      >
        <a
          className="p-4 inline-block"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Scott2bReal/canvas-fun"
        >
          GitHub
        </a>
      </footer>
    </>
  )
}
