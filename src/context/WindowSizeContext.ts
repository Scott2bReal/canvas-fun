import { createContext } from "react"

export interface WindowSizeStore {
  width: number
  height: number
  aspectRatio: number
}

export const WindowSizeContext = createContext<WindowSizeStore | null>(null)
