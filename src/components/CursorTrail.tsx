import { AnimatePresence, motion, useAnimationFrame } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useCursorTrail } from "../hooks/useCursorTrail"
import { useDomRect } from "../hooks/useDomRect"

export const CursorTrail = ({ showFps = false }: { showFps?: boolean }) => {
  const jsonRef = useRef<HTMLPreElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const targetRect = useDomRect(targetRef)
  const anotherTargetRef = useRef<HTMLDivElement>(null)
  const anotherTargetRect = useDomRect(anotherTargetRef)
  const footerLinkRef = useRef<HTMLAnchorElement>(null)
  const footerLinkRect = useDomRect(footerLinkRef)
  const formButtonRef = useRef<HTMLButtonElement>(null)
  const formButtonRect = useDomRect(formButtonRef)

  const [numBalls, setNumBalls] = useState<number>(1000)
  const [lerpFactor, setLerpFactor] = useState<number>(0.85)
  const [ballSize, setBallSize] = useState<number>(10)

  const [showForm, setShowForm] = useState<boolean>(false)
  const toggleForm = () => setShowForm((prev) => !prev)

  const canvasRef = useCursorTrail(
    {
      numBalls,
      lerpFactor,
      initialBallRadius: ballSize,
    },
    [targetRect, anotherTargetRect, footerLinkRect, formButtonRect],
  )

  useAnimationFrame((_t, delta) => {
    if (!showFps) return
    const fps = delta ? 1000 / delta : 0
    if (jsonRef.current) {
      jsonRef.current.textContent = `FPS: ${fps.toFixed(1)}`
    }
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForm(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <>
      <AnimatePresence mode="popLayout">
        {showForm && (
          <motion.div
            className="fixed origin-top-left top-4 left-4 z-50 bg-medium-green pt-8 p-4 text-yellow flex flex-col gap-4"
            initial={{ scale: 0.0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.0, opacity: 0 }}
            transition={{
              ease: [0.63, 0, 0.17, 0.1],
              duration: 0.3,
            }}
          >
            <h2 className="font-italic font-bold text-yellow w-full text-center mt-4">
              Cursor Trail Controls
            </h2>
            <form className="mt-2 size-fit">
              <label className="flex flex-col">
                Number of Balls: {numBalls}
                <input
                  type="range"
                  min="1"
                  max="2000"
                  step="1"
                  value={numBalls}
                  className="accent-yellow text-brown"
                  onChange={(e) => setNumBalls(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col">
                Speed: {lerpFactor}
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.01"
                  value={lerpFactor}
                  onChange={(e) => setLerpFactor(Number(e.target.value))}
                  className="accent-yellow"
                />
              </label>
              <label className="flex flex-col">
                Ball Size: {ballSize}
                <input
                  type="range"
                  min="1"
                  max="32"
                  step="1"
                  value={ballSize}
                  onChange={(e) => setBallSize(Number(e.target.value))}
                  className="accent-yellow"
                />
              </label>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={formButtonRef}
        onClick={toggleForm}
        title={`${showForm ? "Close" : "Open"} controls`}
        className={`text-sm py-1 px-3 top-4 transition duration-300  ${showForm ? "border border-transparent" : "border border-medium-green"} left-4 z-50 ${showForm ? "text-yellow" : "text-dark-green hover:text-yellow"} fixed`}
      >
        {showForm ? "-" : "+"}
      </button>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen z-10 pointer-events-none"
      />
      <div className="flex md:flex-row flex-col gap-32 md:gap-64 items-center">
        <div
          ref={targetRef}
          className="size-32 md:size-64 border border-dark-green"
        ></div>
        <div
          ref={anotherTargetRef}
          className="size-32 md:size-64 border border-dark-green"
        ></div>
      </div>
      {showFps && (
        <pre
          className="fixed text-right top-0 right-0 bg-black/50 text-lime-500"
          ref={jsonRef}
        ></pre>
      )}
      <footer className="fixed bottom-4 w-full text-sm font-bold text-center z-50 text-medium-green">
        <a
          ref={footerLinkRef}
          href="https://github.com/Scott2bReal/canvas-fun"
          className="inline-block p-4 hover:text-light-orange"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
      </footer>
    </>
  )
}
