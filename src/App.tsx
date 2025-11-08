import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTime,
} from "motion/react"
import { type RefObject } from "react"
import "./App.css"
import { Grid } from "./components/AnimatedGrid"
import { WindowSizeProvider } from "./components/WindowSizeProvider"
import { useWindowSize } from "./hooks/useWindowSize"

// const DebugPanel = ({ rects }: { rects: Rect[] }) => {
//   const jsonRef = useRef<HTMLPreElement>(null)
//   useAnimationFrame(() => {
//     if (jsonRef.current) {
//       jsonRef.current.textContent = JSON.stringify(
//         rects.map((rect, index) => ({
//           [`square${index + 1}`]: {
//             top: rect.top.toFixed(2),
//             left: rect.left.toFixed(2),
//             bottom: rect.bottom.toFixed(2),
//             right: rect.right.toFixed(2),
//             centerX: rect.centerX.toFixed(2),
//             centerY: rect.centerY.toFixed(2),
//             width: rect.width.toFixed(2),
//             height: rect.height.toFixed(2),
//           },
//         })),
//         null,
//         2,
//       )
//     }
//   })
//   return (
//     <pre
//       ref={jsonRef}
//       className="absolute top-0 left-0 m-4 p-4 bg-white bg-opacity-80 text-xs z-20 rounded-md max-h-96 overflow-auto"
//     ></pre>
//   )
// }

const Square = ({ ref }: { ref: RefObject<HTMLDivElement | null> }) => {
  const t = useTime()
  const y = useMotionValue(0)
  const x = useMotionValue(0)

  const windowSize = useWindowSize()

  useAnimationFrame(() => {
    if (ref.current) {
      const amplitude = 20
      const frequency = 0.001
      const offsetX =
        (windowSize.width / 2 -
          (ref.current.offsetLeft + ref.current.offsetWidth / 2)) /
        (windowSize.width / 2)
      const offsetY =
        (windowSize.height / 2 -
          (ref.current.offsetTop + ref.current.offsetHeight / 2)) /
        (windowSize.height / 2)

      x.set(amplitude * Math.sin(frequency * t.get() + offsetX * Math.PI))
      y.set(amplitude * Math.cos(frequency * t.get() + offsetY * Math.PI))
    }
  })

  return (
    <motion.div
      style={{ y, x }}
      ref={ref}
      className="size-16 bg-blue-600"
    ></motion.div>
  )
}

function App() {
  // const squareOneRef = useRef<HTMLDivElement>(null)
  // const squareTwoRef = useRef<HTMLDivElement>(null)
  // const squareThreeRef = useRef<HTMLDivElement>(null)
  // const squareFourRef = useRef<HTMLDivElement>(null)
  //
  // const squareOneRect = useDomRect(squareOneRef)
  // const squareTwoRect = useDomRect(squareTwoRef)
  // const squareThreeRect = useDomRect(squareThreeRef)
  // const squareFourRect = useDomRect(squareFourRef)
  //
  // const draw = useCallback(
  //   (ctx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) => {
  //     const dpr = window.devicePixelRatio || 1
  //     const width = canvasElement.width / dpr
  //     const height = canvasElement.height / dpr
  //     ctx.clearRect(0, 0, width, height)
  //
  //     const centerX = width / 2
  //     const centerY = height / 2
  //
  //     const drawLineToSquare = (rect: ReturnType<typeof useDomRect>) => {
  //       ctx.beginPath()
  //       ctx.moveTo(centerX, centerY)
  //       ctx.lineTo(rect.centerX, rect.centerY)
  //       ctx.strokeStyle = "red"
  //       ctx.lineWidth = 2
  //       ctx.stroke()
  //     }
  //
  //     drawLineToSquare(squareOneRect)
  //     drawLineToSquare(squareTwoRect)
  //     drawLineToSquare(squareThreeRect)
  //     drawLineToSquare(squareFourRect)
  //   },
  //   [squareOneRect, squareTwoRect, squareThreeRect, squareFourRect],
  // )
  //
  // const canvasRef = useCanvas(draw)

  return (
    <WindowSizeProvider>
      <main className="relative w-full h-[150vh] flex items-center justify-center">
        {/* <canvas */}
        {/*   className="fixed inset-0 w-screen h-screen z-10 pointer-events-none" */}
        {/*   ref={canvasRef} */}
        {/* /> */}
        {/* <div className="grid gap-40 grid-cols-2 grid-rows-2 w-fit h-fit mx-auto"> */}
        {/*   <Square ref={squareOneRef} /> */}
        {/*   <Square ref={squareTwoRef} /> */}
        {/*   <Square ref={squareThreeRef} /> */}
        {/*   <Square ref={squareFourRef} /> */}
        {/* </div> */}
        <Grid />
      </main>
    </WindowSizeProvider>
  )
}

export default App
