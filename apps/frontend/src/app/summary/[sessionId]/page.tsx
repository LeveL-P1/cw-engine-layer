"use client"

import { useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import { AnalyticsChartCard } from "@/components/analytics/AnalyticsChartCard"
import { ContributionDominanceChart } from "@/components/analytics/ContributionDominanceChart"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"
import { ParticipationBreakdown } from "@/components/analytics/ParticipationBreakdown"
import { SessionUtilityPanel } from "@/components/layout/SessionUtilityPanel"
import { SessionRoute } from "@/components/session/SessionRoute"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { PageHeader } from "@/components/ui/PageHeader"
import { apiFetch } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"
import { resolveSessionUiState } from "@/lib/session-ui"
import {
  emptyMetrics,
  resolveParticipantLabel,
  type TransitionDto,
} from "@/lib/session-analytics"
import type {
  SessionMetrics,
  SessionRouteContext,
  TimelinePoint,
} from "@/types/session"

function SummaryContent({ context }: { context: SessionRouteContext }) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [modeTransitions, setModeTransitions] = useState<ModeTransition[]>([])
  const [expandedCharts, setExpandedCharts] = useState({
    timeline: true,
    breakdown: true,
    dominance: true,
  })
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [hasFatalPageError, setHasFatalPageError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSummary = async () => {
      if (!cancelled) {
        setIsRefreshing(true)
      }

      try {
        const [metricsRes, timelineRes, transitionsRes] = await Promise.all([
          apiFetch(`${publicEnv.apiUrl}/api/metrics/${context.sessionInfo.sessionId}`),
          apiFetch(`${publicEnv.apiUrl}/api/metrics/${context.sessionInfo.sessionId}/timeline`),
          apiFetch(
            `${publicEnv.apiUrl}/api/metrics/${context.sessionInfo.sessionId}/mode-transitions`,
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

    void loadSummary()

    return () => {
      cancelled = true
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
  const dominanceData = useMemo(() => {
    const total = resolvedMetrics.perUser.reduce(
      (sum, entry) => sum + entry.edits,
      0,
    )

    return resolvedMetrics.perUser.map((entry) => ({
      user: resolveParticipantLabel(context, entry.userId),
      dominance: total > 0 ? (entry.edits / total) * 100 : 0,
    }))
  }, [context, resolvedMetrics.perUser])

  function exportReport() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            sessionName: context.sessionName,
            totalEdits: resolvedMetrics.totalEdits,
            participants: resolvedMetrics.activeUsers,
            dominanceRatio: resolvedMetrics.dominanceRatio,
            charts: {
              timeline,
              contributions: resolvedMetrics.perUser,
            },
          },
          null,
          2,
        ),
      ],
      {
        type: "application/json",
      },
    )

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "session-report.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (hasFatalPageError) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Summary is temporarily unavailable"
          message="Your session still exists, but this summary needs a fresh authorized reload from the session lobby."
        />
      </div>
    )
  }

  const toggleChart = (key: "timeline" | "breakdown" | "dominance") => {
    setExpandedCharts((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Session Summary"
        title="Export and review the detailed session charts"
        description="The summary view now focuses on detailed chart exploration, while analytics holds the compact session snapshot."
        actions={
          <>
            {isRefreshing ? <InlineLoader label="Refreshing summary..." /> : null}
            <Button type="button" onClick={exportReport}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <AnalyticsChartCard
          title="Activity Timeline"
          description="Track how whiteboard activity rises and dips throughout the session."
          expanded={expandedCharts.timeline}
          onToggle={() => toggleChart("timeline")}
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
          description="See how much each person contributed during the session."
          expanded={expandedCharts.breakdown}
          onToggle={() => toggleChart("breakdown")}
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
              message="Once the board has edits from participants, this chart will show contribution spread."
            />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Contribution Dominance"
          description="A horizontal view of how strongly each participant dominated total board activity. This uses edit-share as the dominance signal."
          expanded={expandedCharts.dominance}
          onToggle={() => toggleChart("dominance")}
        >
          {dominanceData.length > 0 ? (
            <ContributionDominanceChart
              chrome="plain"
              data={dominanceData}
              height={340}
            />
          ) : (
            <EmptyState
              title="No dominance data yet"
              message="Once contribution data exists, this chart will visualize each user's share of overall board activity."
            />
          )}
        </AnalyticsChartCard>
      </div>
    </div>
  )
}

export default function SessionSummaryPage() {
  return (
    <SessionRoute
      variant="insights"
      contentScrollable
      utilityPanel={<SessionUtilityPanel />}
    >
      {(context) => <SummaryContent context={context} />}
    </SessionRoute>
  )
}
