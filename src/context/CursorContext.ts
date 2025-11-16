import { createContext } from "react"
import { useCreateCursorStore } from "../hooks/useCursorStore"

export const CursorContext = createContext<ReturnType<
  typeof useCreateCursorStore
> | null>(null)
