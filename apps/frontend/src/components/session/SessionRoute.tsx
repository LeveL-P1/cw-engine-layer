"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { fetchSessionDetails } from "@/lib/session-api"
import { getStoredSession } from "@/lib/session-storage"
import { getSessionUiMessage, resolveSessionUiState } from "@/lib/session-ui"
import { SessionStatePanel } from "@/components/ui/SessionStatePanel"
import type {
  SessionDetails,
  SessionRouteContext,
  SessionUIState,
} from "@/types/session"

interface SessionRouteProps {
  children: (context: SessionRouteContext) => ReactNode
  variant?: "whiteboard" | "insights"
  contentScrollable?: boolean
  headerActions?: ReactNode | ((context: SessionRouteContext) => ReactNode)
  refreshIntervalMs?: number
}

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

export function SessionRoute({
  children,
  variant = "insights",
  contentScrollable = false,
  headerActions,
  refreshIntervalMs = 10000,
}: SessionRouteProps) {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const [loadedAt] = useState(() => Date.now())
  const [sessionInfo] = useState(() => getStoredSession())
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [uiState, setUiState] = useState<SessionUIState>("loading")
  const [uiMessage, setUiMessage] = useState<string | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) {
      router.replace("/sessions")
    }
  }, [params.sessionId, router, sessionInfo])

  useEffect(() => {
    if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) {
      return
    }

    let mounted = true

    const loadSession = async () => {
      if (mounted) {
        setIsRefreshing(true)
      }

      try {
        const details = await fetchSessionDetails(sessionInfo.sessionId)
        if (!mounted) {
          return
        }

        setSessionDetails(details)
        setUiState("ready")
        setUiMessage(undefined)
      } catch (error) {
        if (!mounted) {
          return
        }

        setUiState(resolveSessionUiState(error))
        setUiMessage(
          getSessionUiMessage(
            error,
            "Unable to load this session. Please return to the sessions lobby.",
          ),
        )
      } finally {
        if (mounted) {
          setIsRefreshing(false)
        }
      }
    }

    void loadSession()
    const interval = window.setInterval(() => {
      void loadSession()
    }, refreshIntervalMs)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [params.sessionId, refreshIntervalMs, sessionInfo])

  const context = useMemo<SessionRouteContext | null>(() => {
    if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) {
      return null
    }

    const activeUsers =
      sessionDetails?.participants.length
        ? sessionDetails.participants.map((participant) => ({
            id: participant.id,
            name: participant.name,
            role: participant.role,
          }))
        : getFallbackActiveUsers(sessionInfo)

    const currentUserRole =
      sessionDetails?.participants.find(
        (participant) => participant.id === sessionInfo.userId,
      )?.role ?? sessionInfo.role

    return {
      sessionInfo,
      sessionDetails,
      sessionName: sessionDetails?.name ?? sessionInfo.sessionName,
      currentUserRole,
      activeUsers,
      sessionStartTime: sessionDetails
        ? new Date(sessionDetails.startTime).getTime()
        : loadedAt,
      modeStartedAt: loadedAt,
      isSessionRefreshing: isRefreshing,
    }
  }, [isRefreshing, loadedAt, params.sessionId, sessionDetails, sessionInfo])

  if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) {
    return (
      <ProtectedRoute>
        <SessionStatePanel
          state="loading"
          message="Checking your session state and redirecting to the lobby..."
        />
      </ProtectedRoute>
    )
  }

  if (uiState === "unauthorized" || uiState === "error") {
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

  if (!context) {
    return null
  }

  const resolvedHeaderActions =
    typeof headerActions === "function" ? headerActions(context) : headerActions

  return (
    <ProtectedRoute>
      <SessionProvider
        initialState={{
          sessionId: context.sessionInfo.sessionId,
          userId: context.sessionInfo.userId,
          sessionName: context.sessionName,
          role: context.currentUserRole,
          mode: context.sessionDetails?.currentMode ?? "FREE",
          dominanceRatio: 0,
          activeUsers: context.activeUsers,
          sessionStartTime: context.sessionStartTime,
          modeStartedAt: context.modeStartedAt,
        }}
      >
        <AppShell
          variant={variant}
          contentScrollable={contentScrollable}
          headerActions={resolvedHeaderActions}
          isSessionRefreshing={context.isSessionRefreshing}
        >
          {children(context)}
        </AppShell>
      </SessionProvider>
    </ProtectedRoute>
  )
}
