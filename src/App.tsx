import { CursorStoreProvider } from "./components/CursorStoreProvider"
import { CursorTrail } from "./components/CursorTrail"
import { WindowSizeProvider } from "./components/WindowSizeProvider"
import "./index.css"

function App() {
  return (
    <WindowSizeProvider>
      <CursorStoreProvider>
        <main className="relative flex flex-col justify-center items-center w-screen h-screen bg-ochre">
          <CursorTrail />
          {/* <PathingExample /> */}
        </main>
      </CursorStoreProvider>
    </WindowSizeProvider>
  )
}

export default App
