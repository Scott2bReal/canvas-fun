import { useLayoutEffect } from "react"
import { proxy } from "valtio"
import {
  type WindowSizeStore,
  WindowSizeContext,
} from "../context/WindowSizeContext"
import { useConstant } from "../hooks/useConstant"

export const WindowSizeProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const windowSizeStore = useConstant<WindowSizeStore>(() =>
    proxy({
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
    }),
  )

  useLayoutEffect(() => {
    const handleResize = () => {
      windowSizeStore.width = window.innerWidth
      windowSizeStore.height = window.innerHeight
      windowSizeStore.aspectRatio =
        windowSizeStore.width / windowSizeStore.height
    }

    window.addEventListener("resize", handleResize)

    // Set initial values
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [windowSizeStore])

  return (
    <WindowSizeContext.Provider value={windowSizeStore}>
      {children}
    </WindowSizeContext.Provider>
  )
}
