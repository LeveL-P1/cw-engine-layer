"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Whiteboard from "@/components/whiteboard/whiteboard"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SessionStatePanel } from "@/components/ui/SessionStatePanel"
import { getStoredSession } from "@/lib/session-storage"
import { getSessionUiMessage, resolveSessionUiState } from "@/lib/session-ui"
import {
  fetchSessionDetails,
} from "@/lib/session-api"
import type { SessionDetails, SessionUIState } from "@/types/session"

function getFallbackActiveUsers(sessionState: {
  userId: string
  displayName: string
  role: RoleType
}) {
  return [
    {
      id: sessionState.userId,
      name: sessionState.displayName,
      role: sessionState.role,
    },
  ]
}

export default function WhiteboardSessionPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const [loadedAt] = useState(() => Date.now())
  const [sessionState] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    displayName: string
    sessionName: string
  }>(() => getStoredSession())
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [uiState, setUiState] = useState<SessionUIState>("loading")
  const [uiMessage, setUiMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!sessionState || sessionState.sessionId !== params.sessionId) {
      router.replace("/sessions")
    }
  }, [params.sessionId, router, sessionState])

  useEffect(() => {
    if (!sessionState || sessionState.sessionId !== params.sessionId) {
      return
    }

    let mounted = true

    const loadSession = async () => {
      try {
        const details = await fetchSessionDetails(sessionState.sessionId)
        if (mounted) {
          setSessionDetails(details)
          setUiState("ready")
          setUiMessage(undefined)
        }
      } catch (error) {
        if (mounted) {
          setUiState(resolveSessionUiState(error))
          setUiMessage(
            getSessionUiMessage(
              error,
              "Unable to load this session. Please return to the sessions lobby.",
            ),
          )
        }
      }
    }

    void loadSession()
    const interval = window.setInterval(() => {
      void loadSession()
    }, 5000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [params.sessionId, router, sessionState])

  if (!sessionState || sessionState.sessionId !== params.sessionId) {
    return (
      <ProtectedRoute>
        <SessionStatePanel
          state="loading"
          message="Checking your session state and redirecting to the lobby..."
        />
      </ProtectedRoute>
    )
  }

  if (uiState !== "ready") {
    return (
      <ProtectedRoute>
        <SessionStatePanel
          state={uiState}
          message={uiMessage}
          actionHref={uiState === "unauthorized" ? "/auth" : "/sessions"}
          actionLabel={uiState === "unauthorized" ? "Go to Auth" : "Back to Sessions"}
        />
      </ProtectedRoute>
    )
  }

  const activeUsers =
    sessionDetails?.participants.length
      ? sessionDetails.participants.map((participant) => ({
          id: participant.id,
          name: participant.name,
          role: participant.role,
        }))
      : getFallbackActiveUsers(sessionState)
  const currentUserRole =
    sessionDetails?.participants.find(
      (participant) => participant.id === sessionState.userId,
    )?.role ?? sessionState.role
  const sessionStartTime = sessionDetails
    ? new Date(sessionDetails.startTime).getTime()
    : loadedAt

  return (
    <ProtectedRoute>
      <SessionProvider
        initialState={{
          sessionId: sessionState.sessionId,
          userId: sessionState.userId,
          sessionName: sessionDetails?.name ?? sessionState.sessionName,
          role: currentUserRole,
          mode: sessionDetails?.currentMode ?? "FREE",
          dominanceRatio: 0,
          activeUsers,
          sessionStartTime,
          modeStartedAt: loadedAt,
        }}
      >
        <AppShell>
          <Whiteboard
            sessionId={sessionState.sessionId}
            userId={sessionState.userId}
          />
        </AppShell>
      </SessionProvider>
    </ProtectedRoute>
  )
}
