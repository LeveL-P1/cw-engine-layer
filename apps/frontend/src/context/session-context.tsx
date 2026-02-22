"use client"

import {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react"

export type RoleType = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"
export type ModeType = "FREE" | "SILENT" | "DECISION" | "LOCKED"

interface SessionState {
  sessionId: string
  sessionName: string
  role: RoleType
  mode: ModeType
  activeUsers: ActiveUser[]
  sessionStartTime: number
  modeStartedAt: number
  dominanceRatio: number
}

interface ActiveUser {
  id: string
  name: string
  role: RoleType
}

interface SessionContextType extends SessionState {
  setMode: (mode: ModeType) => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState: SessionState
}) {
  const [mode, setModeState] = useState(initialState.mode)
  const [modeStartedAt, setModeStartedAt] = useState(
    initialState.modeStartedAt
  )

  const setMode = (newMode: ModeType) => {
    setModeState(newMode)
    setModeStartedAt(Date.now())
  }

  return (
    <SessionContext.Provider
      value={{
        ...initialState,
        mode,
        modeStartedAt,
        setMode,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within SessionProvider")
  }
  return context
}