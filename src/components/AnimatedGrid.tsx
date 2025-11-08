import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { proxy, useSnapshot } from "valtio"
import { GridContext } from "../context/GridContext"
import { useCanvas } from "../hooks/useCanvas"
import { useConstant } from "../hooks/useConstant"
import { useDomRect, type Rect } from "../hooks/useDomRect"
import { useGridContext } from "../hooks/useGridContext"

const Square = ({ number }: { number: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const expand = () => setIsExpanded(!isExpanded)

  const ref = useRef<HTMLDivElement | null>(null)
  const rect = useDomRect(ref)

  const { gridRects } = useGridContext()

  useEffect(() => {
    gridRects[`square${number}`] = rect
    console.log(gridRects)

    return () => {
      delete gridRects[`square${number}`]
    }
  }, [gridRects, rect, number])

  return (
    <div className="flex flex-col">
      <motion.div
        ref={ref}
        layout
        onClick={() => expand()}
        className="h-16 w-32 bg-blue-500"
      ></motion.div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            exit={{
              height: 0,
              opacity: 0,
              transition: { delay: 0.2, duration: 0.2 },
            }}
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 64 * 2,
              opacity: 1,
            }}
            className="w-32 h-16 flex items-center justify-center bg-green-500 origin-top"
          >
            <motion.span
              layout
              className="text-white font-bold"
              variants={{
                hidden: {
                  scale: 0.5,
                  opacity: 0,
                  transition: { duration: 0.2 },
                },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.2 },
                },
              }}
              animate={isExpanded ? "visible" : "hidden"}
              initial="hidden"
            >
              :)
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const GridInner = () => {
  const { gridRects } = useGridContext()
  const gridRectsSnap = useSnapshot(gridRects)

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) => {
      const dpr = window.devicePixelRatio || 1
      const width = canvasElement.width / dpr
      const height = canvasElement.height / dpr
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      const drawLineToSquare = (rect: ReturnType<typeof useDomRect>) => {
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)

        ctx.lineTo(rect.centerX, rect.centerY)

        ctx.strokeStyle = "red"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      Object.values(gridRectsSnap).forEach((rect) => {
        drawLineToSquare(rect)
      })
    },
    [gridRectsSnap],
  )

  const canvasRef = useCanvas(draw)

  return (
    <>
      <div className="grid relative grid-cols-2 z-0 w-fit mx-auto gap-x-24 gap-y-4 mt-20 items-start">
        <canvas
          ref={canvasRef}
          className="absolute top-0 z-10 left-0 w-full h-full pointer-events-none border border-lime-500"
        />
        {[...Array(8)].map((_, i) => (
          <Square number={i} key={i}></Square>
        ))}
      </div>
    </>
  )
}

const createDefaultGridRects = () => proxy<Record<string, Rect>>({})
export const Grid = () => {
  const gridRects = useConstant(() => createDefaultGridRects())

  return (
    <GridContext.Provider
      value={{
        gridRects,
      }}
    >
      <MotionConfig reducedMotion="user">
        <GridInner />
      </MotionConfig>
    </GridContext.Provider>
  )
}
