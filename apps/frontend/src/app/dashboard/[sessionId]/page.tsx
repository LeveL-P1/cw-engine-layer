"use client"

import { connectWebSocket, setModeListener } from "@/lib/websocket"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import { AnalyticsChartCard } from "@/components/analytics/AnalyticsChartCard"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"
import { ParticipationBreakdown } from "@/components/analytics/ParticipationBreakdown"
import { getStoredSession } from "@/lib/session-storage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SessionStatePanel } from "@/components/ui/SessionStatePanel"
import { Button } from "@/components/ui/Button"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { SurfaceCard } from "@/components/ui/SurfaceCard"
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
  const [expandedChart, setExpandedChart] = useState<"timeline" | "breakdown">(
    "timeline",
  )

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
      ) : uiState === "unauthorized" || uiState === "error" ? (
        <SessionStatePanel
          state={uiState}
          message={uiMessage}
          actionHref={uiState === "unauthorized" ? "/auth" : "/sessions"}
          actionLabel={uiState === "unauthorized" ? "Go to Auth" : "Back to Sessions"}
        />
      ) : (
        (() => {
          const resolvedMetrics = metrics ?? emptyMetrics()
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
            dominanceRatio: resolvedMetrics.dominanceRatio,
            activeUsers,
            sessionStartTime,
            modeStartedAt: loadedAt,
          }}
        >
          <AppShell contentScrollable>
            <div className="space-y-8 bg-[var(--color-bg-canvas)] p-6 text-[var(--color-text-primary)] md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                    Session Analytics
                  </p>
                  <h1 className="text-3xl font-semibold">Session Dashboard</h1>
                </div>

                <div className="flex items-center gap-4">
                  {uiState === "loading" || !metrics ? (
                    <InlineLoader label="Refreshing analytics..." />
                  ) : null}
                  <span className="rounded-full border border-[var(--color-border-soft)] px-3 py-1 text-sm font-semibold">
                    Mode: {mode}
                  </span>

                  <Button
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
                  >
                    Toggle Mode
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card title="Total Edits" value={resolvedMetrics.totalEdits} />
                <Card title="Active Users" value={resolvedMetrics.activeUsers} />
                <Card
                  title="Dominance Ratio"
                  value={resolvedMetrics.dominanceRatio.toFixed(2)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <AnalyticsChartCard
                  title="Activity Timeline"
                  description="Track editing activity over time and see how governance mode changes affected the session."
                  expanded={expandedChart === "timeline"}
                  onToggle={() => setExpandedChart("timeline")}
                >
                  {timeline.length > 0 ? (
                    <ActivityTimeline
                      chrome="plain"
                      data={timeline.map((point) => ({
                        time: new Date(point.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        edits: point.edits,
                      }))}
                      transitions={modeTransitions}
                      height={320}
                    />
                  ) : (
                    <EmptyChartState message="Start drawing on the whiteboard to populate your activity timeline." />
                  )}
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Participation Breakdown"
                  description="Compare how much each participant contributed so facilitators can spot imbalance quickly."
                  expanded={expandedChart === "breakdown"}
                  onToggle={() => setExpandedChart("breakdown")}
                >
                  {resolvedMetrics.perUser.length > 0 ? (
                    <ParticipationBreakdown
                      chrome="plain"
                      data={resolvedMetrics.perUser}
                      height={320}
                    />
                  ) : (
                    <EmptyChartState message="Participant contribution bars will appear once edits are recorded." />
                  )}
                </AnalyticsChartCard>
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
    <SurfaceCard className="bg-[var(--color-bg-surface)] p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h2>
      <p className="mt-2 text-3xl text-[var(--color-text-primary)]">{value}</p>
    </SurfaceCard>
  )
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-5 text-sm text-[var(--color-text-muted)]">
      {message}
    </div>
  )
}
