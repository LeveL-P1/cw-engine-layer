"use client"

import type { MetricsPerUser } from "@/types/session"

interface ParticipationBreakdownProps {
  data: MetricsPerUser[]
  title?: string
  chrome?: "card" | "plain"
  height?: number
}

function formatPercent(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`
}

export function ParticipationBreakdown({
  data,
  title = "Participation Breakdown",
  chrome = "card",
}: ParticipationBreakdownProps) {
  const sortedData = [...data].sort((left, right) => right.edits - left.edits)
  const totalEdits = sortedData.reduce((sum, entry) => sum + entry.edits, 0)
  const maxEdits = Math.max(...sortedData.map((entry) => entry.edits), 1)

  const chart = (
    <div className="space-y-3">
      {sortedData.map((entry, index) => {
        const share = totalEdits > 0 ? (entry.edits / totalEdits) * 100 : 0
        const barWidth = Math.max((entry.edits / maxEdits) * 100, entry.edits > 0 ? 6 : 0)

        return (
          <div
            key={entry.userId}
            className="grid gap-3 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.9fr)_auto]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-black/20 text-xs font-semibold text-[var(--color-accent)]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-[var(--color-text-primary)]">
                  {entry.userId}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {entry.edits} edit{entry.edits === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-chart-1),var(--color-chart-3))]"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm sm:justify-end">
              <span className="text-[var(--color-text-muted)] sm:hidden">
                Share
              </span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {formatPercent(share)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (chrome === "plain") {
    return <div className="h-full">{chart}</div>
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-soft)]">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {chart}
    </div>
  )
}
