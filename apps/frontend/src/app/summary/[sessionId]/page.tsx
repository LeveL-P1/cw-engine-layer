"use client"

import { useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import { AnalyticsChartCard } from "@/components/analytics/AnalyticsChartCard"
import { ContributionDominanceChart } from "@/components/analytics/ContributionDominanceChart"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"
import { ParticipationBreakdown } from "@/components/analytics/ParticipationBreakdown"
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

  function downloadReport(content: string, filename: string, type: string) {
    const blob = new Blob(
      [content],
      { type },
    )

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function getReportPayload() {
    return {
      sessionName: context.sessionName,
      totalEdits: resolvedMetrics.totalEdits,
      participants: resolvedMetrics.activeUsers,
      dominanceRatio: resolvedMetrics.dominanceRatio,
      timeline,
      modeTransitions,
      contributions: participationData.map((entry) => {
        const share =
          resolvedMetrics.totalEdits > 0
            ? (entry.edits / resolvedMetrics.totalEdits) * 100
            : 0

        return {
          user: entry.userId,
          edits: entry.edits,
          sharePercent: Number(share.toFixed(1)),
        }
      }),
      dominance: dominanceData.map((entry) => ({
        user: entry.user,
        dominancePercent: Number(entry.dominance.toFixed(1)),
      })),
    }
  }

  function exportJsonReport() {
    downloadReport(
      JSON.stringify(getReportPayload(), null, 2),
      "session-report.json",
      "application/json",
    )
  }

  function exportMarkdownReport() {
    const payload = getReportPayload()
    const topContributor = payload.dominance[0]
    const contributionRows = payload.contributions.length
      ? payload.contributions
          .map(
            (entry, index) =>
              `| ${index + 1} | ${entry.user} | ${entry.edits} | ${entry.sharePercent}% |`,
          )
          .join("\n")
      : "| - | No contribution data yet | - | - |"
    const timelineRows = payload.timeline.length
      ? payload.timeline
          .map(
            (point) =>
              `| ${new Date(point.timestamp).toLocaleString()} | ${point.edits} |`,
          )
          .join("\n")
      : "| - | No timeline data yet |"
    const modeRows = payload.modeTransitions.length
      ? payload.modeTransitions
          .map((transition) => `| ${transition.time} | ${transition.mode} |`)
          .join("\n")
      : "| - | No mode transitions yet |"

    const markdown = `# ${payload.sessionName} Session Report

## Overview

| Metric | Value |
| --- | --- |
| Total edits | ${payload.totalEdits} |
| Active participants | ${payload.participants} |
| Dominance ratio | ${payload.dominanceRatio.toFixed(2)} |
| Top contributor | ${topContributor ? `${topContributor.user} (${topContributor.dominancePercent}%)` : "No activity yet"} |

## Participation Ranking

| Rank | Participant | Edits | Share |
| --- | --- | ---: | ---: |
${contributionRows}

## Dominance Balance

The top contributor accounts for ${topContributor ? `${topContributor.dominancePercent}%` : "0%"} of recorded board activity.

## Activity Timeline

| Time | Edits |
| --- | ---: |
${timelineRows}

## Mode Transitions

| Time | Mode |
| --- | --- |
${modeRows}
`

    downloadReport(markdown, "session-report.md", "text/markdown")
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
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={exportMarkdownReport}>
                <Download className="h-4 w-4" />
                Export MD
              </Button>
              <Button type="button" variant="secondary" onClick={exportJsonReport}>
                Export JSON
              </Button>
            </div>
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
          title="Participation Ranking"
          description="A ranked contribution view that compares edits, share, and relative activity without crowding the chart."
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
          title="Dominance Balance"
          description="A concentration meter that shows whether activity was balanced or led heavily by one participant."
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
    >
      {(context) => <SummaryContent context={context} />}
    </SessionRoute>
  )
}
