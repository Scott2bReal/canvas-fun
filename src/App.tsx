import "./App.css"
import { CursorStoreProvider } from "./components/CursorStoreProvider"
import { CursorTrail } from "./components/CursorTrail"
import { WindowSizeProvider } from "./components/WindowSizeProvider"

function App() {
  return (
    <WindowSizeProvider>
      <CursorStoreProvider>
        <main className="relative w-full h-[150vh] flex items-center justify-center">
          <CursorTrail />
        </main>
      </CursorStoreProvider>
    </WindowSizeProvider>
  )
}

export default App
