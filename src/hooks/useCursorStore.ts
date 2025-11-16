import { useCallback, useEffect } from "react"
import { proxy } from "valtio"
import type { Coordinate } from "../utils/types"
import { useConstant } from "./useConstant"

const createCursor = (): Coordinate & { hasMoved: boolean } =>
  proxy({
    x: 0,
    y: 0,
    hasMoved: false,
  })

export const useCreateCursorStore = () => {
  const cursorStore = useConstant(() => {
    return proxy(createCursor())
  })

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!cursorStore.hasMoved) {
        cursorStore.hasMoved = true
      }
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
