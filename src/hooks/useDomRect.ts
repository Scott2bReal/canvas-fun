import { useMotionValue, type MotionValue } from "motion/react"
import type { RefObject } from "react"
import { useEffect } from "react"

interface ElementRectMotionValues {
  x: MotionValue<number>
  y: MotionValue<number>
  width: MotionValue<number>
  height: MotionValue<number>
  top: MotionValue<number>
  right: MotionValue<number>
  bottom: MotionValue<number>
  left: MotionValue<number>
}

function useElementRect<T extends HTMLElement>(
  ref: RefObject<T | null>,
  trackScroll: boolean = false,
): ElementRectMotionValues {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const width = useMotionValue(0)
  const height = useMotionValue(0)
  const top = useMotionValue(0)
  const right = useMotionValue(0)
  const bottom = useMotionValue(0)
  const left = useMotionValue(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateRect = () => {
      const domRect = element.getBoundingClientRect()
      x.set(domRect.x)
      y.set(domRect.y)
      width.set(domRect.width)
      height.set(domRect.height)
      top.set(domRect.top)
      right.set(domRect.right)
      bottom.set(domRect.bottom)
      left.set(domRect.left)
    }

    // Initial measurement
    updateRect()

    // Use ResizeObserver for element size changes
    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(element)

    // Track scroll if needed (for viewport-relative coordinates)
    if (trackScroll) {
      window.addEventListener("scroll", updateRect, true)
    }

    return () => {
      resizeObserver.disconnect()
      if (trackScroll) {
        window.removeEventListener("scroll", updateRect, true)
      }
    }
  }, [ref, trackScroll, x, y, width, height, top, right, bottom, left])

  return { x, y, width, height, top, right, bottom, left }
}

export default useElementRect
