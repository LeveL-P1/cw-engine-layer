"use client"

import { useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import { SessionRoute } from "@/components/session/SessionRoute"
import { SessionUtilityPanel } from "@/components/layout/SessionUtilityPanel"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { PageHeader } from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/SectionCard"
import { StatCard } from "@/components/ui/StatCard"
import { apiFetch } from "@/lib/api"
import { resolveSessionUiState } from "@/lib/session-ui"
import type {
  SessionMetrics,
  SessionRouteContext,
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

function computeModeDurations(transitions: TransitionDto[]) {
  const sorted = [...transitions].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  )

  const durations = new Map<string, number>()

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index]
    const next = sorted[index + 1]

    const start = new Date(current.timestamp).getTime()
    const end = next ? new Date(next.timestamp).getTime() : Date.now()

    const deltaMs = Math.max(0, end - start)
    const existing = durations.get(current.mode) ?? 0

    durations.set(current.mode, existing + deltaMs)
  }

  return Array.from(durations.entries()).map(([mode, totalMs]) => ({
    mode,
    durationMinutes: totalMs / 60000,
  }))
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

function SummaryContent({ context }: { context: SessionRouteContext }) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null)
  const [modeBreakdown, setModeBreakdown] = useState<
    { mode: string; durationMinutes: number }[]
  >([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [hasFatalPageError, setHasFatalPageError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSummary = async () => {
      if (!cancelled) {
        setIsRefreshing(true)
      }

      try {
        const metricsRes = await apiFetch(`${API_URL}/api/metrics/${context.sessionInfo.sessionId}`)

        if (!cancelled) {
          if (metricsRes.status === 404) {
            setMetrics(emptyMetrics())
          } else if (metricsRes.ok) {
            const metricsPayload = await metricsRes.json()
            setMetrics(metricsPayload.data)
          } else {
            setMetrics(emptyMetrics())
          }

          const transitionsRes = await apiFetch(
            `${API_URL}/api/metrics/${context.sessionInfo.sessionId}/mode-transitions`,
          )

          if (transitionsRes.ok) {
            const transitionsPayload = await transitionsRes.json()
            setModeBreakdown(computeModeDurations(transitionsPayload.data))
          } else {
            setModeBreakdown([])
          }

          setHasFatalPageError(false)
        }
      } catch (error) {
        if (!cancelled) {
          if (resolveSessionUiState(error) === "unauthorized") {
            setHasFatalPageError(true)
          } else {
            setMetrics(emptyMetrics())
            setModeBreakdown([])
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
  const mostActiveUser = useMemo(() => {
    if (!resolvedMetrics.perUser.length) {
      return context.sessionInfo.displayName || "Unknown"
    }

    const entry = resolvedMetrics.perUser.reduce((left, right) =>
      right.edits > left.edits ? right : left,
    )

    return resolveParticipantLabel(context, entry.userId)
  }, [context, resolvedMetrics.perUser])
  const leadingMode = useMemo(() => {
    if (!modeBreakdown.length) {
      return null
    }

    return [...modeBreakdown].sort(
      (left, right) => right.durationMinutes - left.durationMinutes,
    )[0]
  }, [modeBreakdown])

  const summaryNarrative = [
    `${context.sessionName} captured ${resolvedMetrics.totalEdits} edits across ${resolvedMetrics.activeUsers} participant${resolvedMetrics.activeUsers === 1 ? "" : "s"}.`,
    resolvedMetrics.dominanceRatio > 0.7
      ? "Contribution was heavily concentrated, so facilitator check-ins may help balance the next session."
      : "Contribution stayed reasonably balanced, which is a healthy sign for collaborative discussion.",
    modeBreakdown.length
      ? `The group spent most of its guided time in ${leadingMode?.mode ?? "FREE"} mode.`
      : "Mode transitions have not accumulated enough data yet to tell a clear facilitation story.",
  ]

  function exportReport() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            sessionName: context.sessionName,
            totalEdits: resolvedMetrics.totalEdits,
            participants: resolvedMetrics.activeUsers,
            dominanceRatio: resolvedMetrics.dominanceRatio,
            mostActiveUser,
            modes: modeBreakdown,
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Session Summary"
        title="Wrap the session with a clear outcome snapshot"
        description="Use this page to review what happened, export a lightweight report, and make it easier for the next conversation to pick up where this one ended."
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Session" value={context.sessionName} />
        <StatCard label="Total Edits" value={resolvedMetrics.totalEdits} />
        <StatCard label="Participants" value={resolvedMetrics.activeUsers} />
        <StatCard
          label="Dominance Ratio"
          value={resolvedMetrics.dominanceRatio.toFixed(2)}
        />
        <StatCard label="Most Active" value={mostActiveUser} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Session story"
          description="A simple narrative summary so facilitators and teams can skim what happened without reading raw analytics."
        >
          <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            {summaryNarrative.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Mode distribution"
          description="How the session was paced across facilitation modes."
        >
          {modeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {modeBreakdown.map((entry) => (
                <div
                  key={entry.mode}
                  className="flex items-center justify-between rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {entry.mode}
                  </span>
                  <span>{entry.durationMinutes.toFixed(1)} min</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No mode breakdown yet"
              message="Once the session records more governance transitions, this section will summarize how facilitation moved over time."
            />
          )}
        </SectionCard>
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
