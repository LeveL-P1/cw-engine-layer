"use client"

import { useEffect, useMemo, useState } from "react"
import { SessionRoute } from "@/components/session/SessionRoute"
import { EmptyState } from "@/components/ui/EmptyState"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { PageHeader } from "@/components/ui/PageHeader"
import { SectionCard } from "@/components/ui/SectionCard"
import { StatCard } from "@/components/ui/StatCard"
import { apiFetch } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"
import { resolveSessionUiState } from "@/lib/session-ui"
import {
  computeModeDurations,
  emptyMetrics,
  resolveParticipantLabel,
  type TransitionDto,
} from "@/lib/session-analytics"
import type { SessionMetrics, SessionRouteContext } from "@/types/session"

function DashboardContent({ context }: { context: SessionRouteContext }) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null)
  const [modeBreakdown, setModeBreakdown] = useState<
    { mode: string; durationMinutes: number }[]
  >([])
  const [isRefreshing, setIsRefreshing] = useState(true)
  const [hasFatalPageError, setHasFatalPageError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      if (!cancelled) {
        setIsRefreshing(true)
      }

      try {
        const metricsRes = await apiFetch(`${publicEnv.apiUrl}/api/metrics/${context.sessionInfo.sessionId}`)

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
            `${publicEnv.apiUrl}/api/metrics/${context.sessionInfo.sessionId}/mode-transitions`,
          )

          if (transitionsRes.ok) {
            const transitionsPayload = await transitionsRes.json()
            setModeBreakdown(
              computeModeDurations(transitionsPayload.data as TransitionDto[]),
            )
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

    void loadDashboard()

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
        title="Read the session without leaving the main workflow"
        description="This page now focuses on the session snapshot and collaboration summary, while detailed charts live in the summary view."
        actions={isRefreshing ? <InlineLoader label="Refreshing analytics..." /> : null}
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
          description="A simple narrative summary so facilitators and teams can skim what happened without digging into charts first."
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

export default function DashboardSessionPage() {
  return (
    <SessionRoute
      variant="insights"
      contentScrollable
    >
      {(context) => <DashboardContent context={context} />}
    </SessionRoute>
  )
}
