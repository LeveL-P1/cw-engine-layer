"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalyticsChartCard } from "@/components/analytics/AnalyticsChartCard"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"
import { ParticipationBreakdown } from "@/components/analytics/ParticipationBreakdown"
import { SessionUtilityPanel } from "@/components/layout/SessionUtilityPanel"
import { SessionRoute } from "@/components/session/SessionRoute"
import { EmptyState } from "@/components/ui/EmptyState"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { apiFetch } from "@/lib/api"
import { resolveSessionUiState } from "@/lib/session-ui"
import type {
  SessionMetrics,
  SessionRouteContext,
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

function resolveParticipantLabel(
  context: SessionRouteContext,
  userId: string,
) {
  const participant = context.sessionDetails?.participants.find(
    (entry) => entry.id === userId,
  )

  if (participant?.name) {
    return participant.name
  }

  return userId.slice(0, 8)
}

function DashboardContent({ context }: { context: SessionRouteContext }) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [modeTransitions, setModeTransitions] = useState<ModeTransition[]>([])
  const [expandedChart, setExpandedChart] = useState<"timeline" | "breakdown">(
    "timeline",
  )
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [hasFatalPageError, setHasFatalPageError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadAnalytics = async () => {
      if (!cancelled) {
        setIsRefreshing(true)
      }

      try {
        const [metricsRes, timelineRes, transitionsRes] = await Promise.all([
          apiFetch(`${API_URL}/api/metrics/${context.sessionInfo.sessionId}`),
          apiFetch(`${API_URL}/api/metrics/${context.sessionInfo.sessionId}/timeline`),
          apiFetch(
            `${API_URL}/api/metrics/${context.sessionInfo.sessionId}/mode-transitions`,
          ),
        ])

        if (!cancelled) {
          if (metricsRes.status === 404) {
            setMetrics(emptyMetrics())
          } else if (metricsRes.ok) {
            const metricsPayload = await metricsRes.json()
            setMetrics(metricsPayload.data)
          } else {
            setMetrics(emptyMetrics())
          }

          if (timelineRes.ok) {
            const timelinePayload = await timelineRes.json()
            setTimeline(timelinePayload.data)
          } else {
            setTimeline([])
          }

          if (transitionsRes.ok) {
            const transitionsPayload = await transitionsRes.json()
            setModeTransitions(
              (transitionsPayload.data as TransitionDto[]).map((transition) => ({
                time: new Date(transition.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                mode: transition.mode as "FREE" | "DECISION" | "LOCKED",
              })),
            )
          } else {
            setModeTransitions([])
          }

          setHasFatalPageError(false)
        }
      } catch (error) {
        if (!cancelled) {
          if (resolveSessionUiState(error) === "unauthorized") {
            setHasFatalPageError(true)
          } else {
            setMetrics(emptyMetrics())
            setTimeline([])
            setModeTransitions([])
          }
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false)
        }
      }
    }

    void loadAnalytics()
    const interval = window.setInterval(() => {
      void loadAnalytics()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [context.sessionInfo.sessionId])

  const resolvedMetrics = metrics ?? emptyMetrics()
  const participationData = useMemo(
    () =>
      resolvedMetrics.perUser.map((entry) => ({
        ...entry,
        userId: resolveParticipantLabel(context, entry.userId),
      })),
    [context, resolvedMetrics.perUser],
  )

  if (hasFatalPageError) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Analytics are temporarily unavailable"
          message="Your session is still available, but this analytics view needs a fresh authorized refresh from the lobby."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Session Analytics"
        title="Track participation without interrupting the board"
        description="Review activity patterns, contribution balance, and collaboration signals while keeping the whiteboard as the main place work happens."
        actions={isRefreshing ? <InlineLoader label="Refreshing analytics..." /> : null}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Edits"
          value={resolvedMetrics.totalEdits}
          helper="The total number of recorded whiteboard changes in this session."
        />
        <StatCard
          label="Active People"
          value={resolvedMetrics.activeUsers}
          helper="Participants who have joined or contributed during the current session."
        />
        <StatCard
          label="Dominance Ratio"
          value={resolvedMetrics.dominanceRatio.toFixed(2)}
          helper="Higher numbers can signal that one person is driving most of the board activity."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          title="Activity Timeline"
          description="See how editing activity rises and dips as the session evolves."
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
            <EmptyState
              title="No timeline yet"
              message="Start drawing or collaborating on the board and the activity timeline will fill in here."
            />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Participation Breakdown"
          description="Compare how much each person contributed, especially useful for classes, interviews, and facilitated workshops."
          expanded={expandedChart === "breakdown"}
          onToggle={() => setExpandedChart("breakdown")}
        >
          {participationData.length > 0 ? (
            <ParticipationBreakdown
              chrome="plain"
              data={participationData}
              height={320}
            />
          ) : (
            <EmptyState
              title="No contribution data yet"
              message="Once the board has edits from participants, this chart will help you spot balance and over-dominance quickly."
            />
          )}
        </AnalyticsChartCard>
      </div>
    </div>
  )
}

export default function DashboardSessionPage() {
  return (
    <SessionRoute
      variant="insights"
      contentScrollable
      utilityPanel={<SessionUtilityPanel />}
    >
      {(context) => <DashboardContent context={context} />}
    </SessionRoute>
  )
}
