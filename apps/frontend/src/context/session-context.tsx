"use client"

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"
import { connectWebSocket, setModeListener } from "@/lib/websocket"

export type RoleType = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"
export type ModeType = "FREE" | "DECISION" | "LOCKED"

interface SessionState {
  sessionId: string
  userId: string
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
  const [modeOverride, setModeOverride] = useState<ModeType | null>(null)
  const [modeStartedAt, setModeStartedAt] = useState(
    initialState.modeStartedAt,
  )
  const mode = modeOverride ?? initialState.mode

  const setMode = (newMode: ModeType) => {
    setModeOverride(newMode)
    setModeStartedAt(Date.now())
  }

  useEffect(() => {
    connectWebSocket(initialState.sessionId, initialState.userId)
    setModeListener((newMode) => {
      setMode(newMode as ModeType)
    })
  }, [initialState.sessionId, initialState.userId])

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
