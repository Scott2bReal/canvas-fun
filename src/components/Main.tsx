import { useReducedMotionConfig } from "motion/react"
import { CursorTrail } from "./CursorTrail"

export const Main = () => {
  const shouldReduceMotion = useReducedMotionConfig()

  return (
    <main
      className={`${shouldReduceMotion ? "cursor-default" : "cursor-none"} relative flex flex-col justify-center items-center w-screen h-screen bg-ochre`}
    >
      <CursorTrail />
    </main>
  )
}
