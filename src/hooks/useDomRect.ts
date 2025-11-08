import { cancelFrame, frame } from "motion"
import { useEffect, type RefObject } from "react"
import { proxy } from "valtio"
import { useConstant } from "./useConstant"

export type Rect = {
  top: number
  left: number
  bottom: number
  right: number
  centerX: number
  centerY: number
  width: number
  height: number
}

const createEmpyRect = (): Rect => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  centerX: 0,
  centerY: 0,
  width: 0,
  height: 0,
})

export const useDomRect = (ref: RefObject<HTMLElement | null>) => {
  const rect = useConstant(() => {
    return proxy<Rect>(createEmpyRect())
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateRect = () => {
      const domRect = element.getBoundingClientRect()
      rect.top = domRect.top
      rect.left = domRect.left
      rect.bottom = domRect.bottom
      rect.right = domRect.right
      rect.width = domRect.width
      rect.height = domRect.height
      rect.centerX = domRect.left + domRect.width / 2
      rect.centerY = domRect.top + domRect.height / 2
    }

    frame.read(updateRect, true)
    return () => cancelFrame(updateRect)
  }, [ref, rect])

  return rect
}
