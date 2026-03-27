"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Whiteboard from "@/components/whiteboard/whiteboard"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { getStoredSession } from "@/lib/session-storage"
import {
  fetchSessionDetails,
  type SessionDetailsDto,
} from "@/lib/session-api"

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
  const [sessionDetails, setSessionDetails] = useState<SessionDetailsDto | null>(null)

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
        }
      } catch {
        if (mounted) {
          router.replace("/sessions")
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
          Redirecting to sessions...
        </div>
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
          mode: "FREE",
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
