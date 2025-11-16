import { createContext } from "react"
import type { Coordinate } from "../utils/types"

export const CursorContext = createContext<Coordinate | null>(null)
