import { MotionConfig } from "motion/react"
import { CursorStoreProvider } from "./components/CursorStoreProvider"
import { CursorTrail } from "./components/CursorTrail"
import { WindowSizeProvider } from "./components/WindowSizeProvider"
import "./styles/index.css"

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <WindowSizeProvider>
        <CursorStoreProvider>
          <main className="relative flex flex-col justify-center items-center w-screen h-screen bg-ochre">
            <CursorTrail />
          </main>
        </CursorStoreProvider>
      </WindowSizeProvider>
    </MotionConfig>
  )
}

export default App
