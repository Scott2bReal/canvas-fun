import { MotionConfig } from "motion/react"
import { CursorStoreProvider } from "./components/CursorStoreProvider"
import { Main } from "./components/Main"
import { WindowSizeProvider } from "./components/WindowSizeProvider"

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <WindowSizeProvider>
        <CursorStoreProvider>
          <Main />
        </CursorStoreProvider>
      </WindowSizeProvider>
    </MotionConfig>
  )
}

export default App
