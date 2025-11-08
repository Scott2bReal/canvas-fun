import { useContext } from "react"
import { WindowSizeContext } from "../context/WindowSizeContext"

export const useWindowSize = () => {
  const ctx = useContext(WindowSizeContext)
  if (!ctx) {
    throw new Error("useWindowSize must be used within a WindowSizeProvider")
  }
  return ctx
}
