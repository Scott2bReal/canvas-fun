import { createContext } from "react"
import type { Rect } from "../hooks/useDomRect"

export const GridContext = createContext<{
  gridRects: Record<string, Rect>
} | null>(null)
