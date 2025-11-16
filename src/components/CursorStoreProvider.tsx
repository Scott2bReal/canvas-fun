import type { ReactNode } from "react"
import { CursorContext } from "../context/CursorContext"
import { useCreateCursorStore } from "../hooks/useCursorStore"

export const CursorStoreProvider = ({ children }: { children: ReactNode }) => {
  const cursorStore = useCreateCursorStore()
  return (
    <CursorContext.Provider value={cursorStore}>
      {children}
    </CursorContext.Provider>
  )
}
