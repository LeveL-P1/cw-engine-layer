"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Whiteboard from "@/components/whiteboard/whiteboard"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { getStoredSession } from "@/lib/session-storage"

export default function WhiteboardSessionPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const [loadedAt] = useState(() => Date.now())
  const [sessionState] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    name: string
  }>(() => getStoredSession())

  useEffect(() => {
    if (!sessionState || sessionState.sessionId !== params.sessionId) {
      router.replace("/sessions")
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

  return (
    <ProtectedRoute>
      <SessionProvider
        initialState={{
          sessionId: sessionState.sessionId,
          userId: sessionState.userId,
          sessionName: "Whiteboard Session",
          role: sessionState.role,
          mode: "FREE",
          dominanceRatio: 0,
          activeUsers: [
            {
              id: sessionState.userId,
              name: sessionState.name,
              role: sessionState.role,
            },
          ],
          sessionStartTime: loadedAt,
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
