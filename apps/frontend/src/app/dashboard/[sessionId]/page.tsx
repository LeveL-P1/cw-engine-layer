"use client"

import { connectWebSocket, setModeListener } from "@/lib/websocket"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"
import { getStoredSession } from "@/lib/session-storage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SessionStatePanel } from "@/components/ui/SessionStatePanel"
import {
  fetchSessionDetails,
} from "@/lib/session-api"
import { apiFetch } from "@/lib/api"
import { getSessionUiMessage, resolveSessionUiState } from "@/lib/session-ui"
import type {
  SessionDetails,
  SessionMetrics,
  SessionUIState,
  TimelinePoint,
} from "@/types/session"

type TransitionDto = {
  timestamp: string
  mode: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function emptyMetrics(): SessionMetrics {
  return {
    totalEdits: 0,
    activeUsers: 1,
    dominanceRatio: 0,
    perUser: [],
  }
}

export default function DashboardSessionPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const [loadedAt] = useState(() => Date.now())
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null)
  const [mode, setMode] = useState<string>("FREE")
  const [sessionInfo] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    displayName: string
    sessionName: string
  }>(() => getStoredSession())
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [modeTransitions, setModeTransitions] = useState<ModeTransition[]>([])
  const [uiState, setUiState] = useState<SessionUIState>("loading")
  const [uiMessage, setUiMessage] = useState<string | undefined>(undefined)

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

    connectWebSocket(sessionInfo.sessionId, sessionInfo.userId)

    const loadSession = async () => {
      try {
        const details = await fetchSessionDetails(sessionInfo.sessionId)
        if (mounted) {
          setSessionDetails(details)
          setMode(details.currentMode)
          setUiState("ready")
          setUiMessage(undefined)
        }
      } catch (error) {
        if (mounted) {
          setUiState(resolveSessionUiState(error))
          setUiMessage(
            getSessionUiMessage(
              error,
              "Unable to load session metadata for this dashboard.",
            ),
          )
        }
      }
    }

    const loadMetrics = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/metrics/${sessionInfo.sessionId}`)

        if (res.status === 404) {
          if (mounted) {
            setMetrics(emptyMetrics())
          }
          return
        }

        if (!res.ok) {
          throw new Error("Failed to load metrics")
        }

        const data = await res.json()
        if (mounted) {
          setMetrics(data.data)
        }
      } catch (error) {
        if (mounted) {
          if (resolveSessionUiState(error) === "unauthorized") {
            setUiState("unauthorized")
            setUiMessage(
              getSessionUiMessage(
                error,
                "Your auth session expired while loading dashboard metrics.",
              ),
            )
            return
          }
          setMetrics(emptyMetrics())
        }
      }
    }

    const loadMode = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/mode/${sessionInfo.sessionId}`)
        if (!res.ok) return

        const data = await res.json()
        if (mounted) {
          setMode(data.mode)
        }
      } catch (error) {
        if (mounted && resolveSessionUiState(error) === "unauthorized") {
          setUiState("unauthorized")
          setUiMessage(
            getSessionUiMessage(
              error,
              "You no longer have permission to view this session mode.",
            ),
          )
        }
      }
    }

    const loadTimeline = async () => {
      try {
        const res = await apiFetch(
          `${API_URL}/api/metrics/${sessionInfo.sessionId}/timeline`,
        )

        if (!res.ok) return

        const data = await res.json()
        if (mounted) {
          setTimeline(data.data)
        }
      } catch (error) {
        if (mounted) {
          if (resolveSessionUiState(error) === "unauthorized") {
            setUiState("unauthorized")
            setUiMessage(
              getSessionUiMessage(
                error,
                "You no longer have permission to view timeline analytics.",
              ),
            )
            return
          }
          setTimeline([])
        }
      }
    }

    const loadModeTransitions = async () => {
      try {
        const res = await apiFetch(
          `${API_URL}/api/metrics/${sessionInfo.sessionId}/mode-transitions`,
        )

        if (!res.ok) return

        const data = await res.json()

        if (mounted) {
          const mapped: ModeTransition[] = (data.data as TransitionDto[]).map(
            (transition) => ({
              time: new Date(transition.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              mode: transition.mode as "FREE" | "DECISION" | "LOCKED",
            }),
          )

          setModeTransitions(mapped)
        }
      } catch (error) {
        if (mounted) {
          if (resolveSessionUiState(error) === "unauthorized") {
            setUiState("unauthorized")
            setUiMessage(
              getSessionUiMessage(
                error,
                "You no longer have permission to view mode transitions.",
              ),
            )
            return
          }
          setModeTransitions([])
        }
      }
    }

    void loadSession()
    void loadMetrics()
    void loadMode()
    void loadTimeline()
    void loadModeTransitions()

    const interval = setInterval(() => {
      void loadSession()
      void loadMetrics()
    }, 5000)

    setModeListener((newMode) => {
      setMode(newMode)
    })

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [params.sessionId, router, sessionInfo])

  return (
    <ProtectedRoute>
      {!sessionInfo || sessionInfo.sessionId !== params.sessionId ? (
        <SessionStatePanel
          state="loading"
          message="Validating your active session and opening dashboard..."
        />
      ) : uiState !== "ready" ? (
        <SessionStatePanel
          state={uiState}
          message={uiMessage}
          actionHref={uiState === "unauthorized" ? "/auth" : "/sessions"}
          actionLabel={uiState === "unauthorized" ? "Go to Auth" : "Back to Sessions"}
        />
      ) : !metrics ? (
        <SessionStatePanel state="loading" message="Loading dashboard metrics..." />
      ) : (
        (() => {
          const activeUsers =
            sessionDetails?.participants.length
              ? sessionDetails.participants.map((participant) => ({
                  id: participant.id,
                  name: participant.name,
                  role: participant.role,
                }))
              : [
                  {
                    id: sessionInfo.userId,
                    name: sessionInfo.displayName,
                    role: sessionInfo.role,
                  },
                ]
          const currentUserRole =
            sessionDetails?.participants.find(
              (participant) => participant.id === sessionInfo.userId,
            )?.role ?? sessionInfo.role
          const sessionStartTime = sessionDetails
            ? new Date(sessionDetails.startTime).getTime()
            : loadedAt

          return (
        <SessionProvider
          initialState={{
            sessionId: sessionInfo.sessionId,
            userId: sessionInfo.userId,
            sessionName: sessionDetails?.name ?? sessionInfo.sessionName,
            role: currentUserRole,
            mode: sessionDetails?.currentMode ?? (mode as "FREE" | "DECISION" | "LOCKED"),
            dominanceRatio: metrics.dominanceRatio,
            activeUsers,
            sessionStartTime,
            modeStartedAt: loadedAt,
          }}
        >
          <AppShell>
            <div className="min-h-screen space-y-8 bg-gray-50 p-8 text-gray-900 transition-colors dark:bg-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Session Dashboard</h1>

                <div className="flex items-center gap-4">
                  <span className="font-semibold">Mode: {mode}</span>

                  <button
                    onClick={async () => {
                      const newMode = mode === "FREE" ? "LOCKED" : "FREE"

                      await apiFetch(`${API_URL}/api/mode/${sessionInfo.sessionId}`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          mode: newMode,
                        }),
                      })
                    }}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                  >
                    Toggle Mode
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card title="Total Edits" value={metrics.totalEdits} />
                <Card title="Active Users" value={metrics.activeUsers} />
                <Card
                  title="Dominance Ratio"
                  value={metrics.dominanceRatio.toFixed(2)}
                />
              </div>

              {timeline.length > 0 ? (
                <ActivityTimeline
                  data={timeline.map((point) => ({
                    time: new Date(point.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    edits: point.edits,
                  }))}
                  transitions={modeTransitions}
                />
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-white p-6 shadow-md dark:bg-gray-800">
                  <h2 className="text-lg font-semibold">No analytics yet</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Start drawing on the whiteboard and the session metrics will
                    appear here.
                  </p>
                </div>
              )}

              <div className="h-80 w-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold">
                  Participation Breakdown
                </h2>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.perUser}>
                    <XAxis dataKey="userId" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="edits" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AppShell>
        </SessionProvider>
          )
        })()
      )}
    </ProtectedRoute>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-3xl">{value}</p>
    </div>
  )
}
