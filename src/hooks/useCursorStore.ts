import { useCallback, useEffect } from "react"
import { proxy } from "valtio"
import type { Coordinate } from "../utils/types"
import { useConstant } from "./useConstant"

const createCursor = (): Coordinate =>
  proxy({
    x: 0,
    y: 0,
  })

export const useCreateCursorStore = () => {
  const cursorStore = useConstant(() => {
    return proxy(createCursor())
  })

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      cursorStore.x = event.clientX
      cursorStore.y = event.clientY
    },
    [cursorStore],
  )

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  })

  return cursorStore
}
