import "./App.css"
import { useCanvas } from "./hooks/useCanvas"

const Square = () => {
  return <div className="size-16 bg-blue-600"></div>
}

function App() {
  const canvasRef = useCanvas(() => {
    console.log("drawing on canvas")
  })

  return (
    <main className="relative w-full h-screen flex items-center justify-center">
      <canvas
        className="fixed inset-0 w-screen h-screen z-10 pointer-events-none"
        ref={canvasRef}
      />
      <div className="grid gap-40 grid-cols-2 grid-rows-2 w-fit h-fit mx-auto">
        <Square />
        <Square />
        <Square />
        <Square />
      </div>
    </main>
  )
}

export default App
