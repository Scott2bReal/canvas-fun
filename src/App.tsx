import { CursorStoreProvider } from "./components/CursorStoreProvider"
import { CursorTrail } from "./components/CursorTrail"
import { WindowSizeProvider } from "./components/WindowSizeProvider"
import "./index.css"

function App() {
  return (
    <WindowSizeProvider>
      <CursorStoreProvider>
        <main className="relative w-full h-[150vh] flex items-center justify-center bg-ochre">
          <CursorTrail />
          {/* <PathingExample /> */}
        </main>
      </CursorStoreProvider>
    </WindowSizeProvider>
  )
}

export default App
