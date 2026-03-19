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
  /** The authenticated user's id for this session */
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
  const [mode, setModeState] = useState(initialState.mode)
  const [modeStartedAt, setModeStartedAt] = useState(
    initialState.modeStartedAt
  )

  const setMode = (newMode: ModeType) => {
    setModeState(newMode)
    setModeStartedAt(Date.now())
  }

  // Establish the WebSocket connection once per session and wire
  // MODE_CHANGED events directly into this context's mode state.
  useEffect(() => {
    connectWebSocket(initialState.sessionId, initialState.userId)
    setModeListener((newMode) => {
      setMode(newMode as ModeType)
    })
    // setMode is intentionally omitted — setModeState from useState is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
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