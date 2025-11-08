import { useContext } from "react"
import { GridContext } from "../context/GridContext"

export const useGridContext = () => {
  const ctx = useContext(GridContext)
  if (!ctx) {
    throw new Error("useGridContext must be used within a GridContextProvider")
  }
  return ctx
}
