import type { MotionValue } from "motion"
import { useAnimationFrame, useMotionValue } from "motion/react"
import { lerp } from "../utils/interpolation"

const EPSILON = 0.0001

export const useLerpedMotionValue = (
  target: MotionValue<number>,
  lerpFactor: number,
): MotionValue<number> => {

  useAnimationFrame(() => {
    const current = motionValue.get()
    const target = motionValue.get()
    const delta = target - current

    if (Math.abs(delta) < EPSILON) {
      motionValue.set(target)
      return
    }

    const newValue = lerp(current, target, lerpFactor)
    motionValue.set(newValue)
  })

  return motionValue
}
