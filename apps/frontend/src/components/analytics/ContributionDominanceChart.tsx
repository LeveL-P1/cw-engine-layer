"use client"

interface ContributionDominanceChartProps {
  data: {
    user: string
    dominance: number
  }[]
  title?: string
  chrome?: "card" | "plain"
  height?: number
}

function getDominanceState(topShare: number) {
  if (topShare >= 70) {
    return {
      label: "Dominated",
      message: "One person is carrying most of the board activity.",
      toneClass: "text-rose-300",
      fillClass: "bg-[linear-gradient(90deg,#fb7185,#f97316)]",
    }
  }

  if (topShare >= 45) {
    return {
      label: "Watch balance",
      message: "The session is useful, but one voice is starting to lead heavily.",
      toneClass: "text-amber-200",
      fillClass: "bg-[linear-gradient(90deg,#facc15,#22d3ee)]",
    }
  }

  return {
    label: "Balanced",
    message: "Activity is spread across participants in a healthy range.",
    toneClass: "text-emerald-200",
    fillClass: "bg-[linear-gradient(90deg,#34d399,#22d3ee)]",
  }
}

function formatPercent(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`
}

export function ContributionDominanceChart({
  data,
  title = "Contribution Dominance",
  chrome = "card",
}: ContributionDominanceChartProps) {
  const sortedData = [...data].sort((left, right) => right.dominance - left.dominance)
  const topContributor = sortedData[0]
  const topShare = topContributor?.dominance ?? 0
  const restShare = Math.max(100 - topShare, 0)
  const state = getDominanceState(topShare)

  const chart = (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Dominance status
          </p>
          <p className={`mt-3 text-3xl font-semibold ${state.toneClass}`}>
            {state.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {state.message}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Top contributor
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-[var(--color-text-primary)]">
                {topContributor?.user ?? "No activity yet"}
              </p>
            </div>
            <p className="shrink-0 text-2xl font-semibold text-[var(--color-text-primary)]">
              {formatPercent(topShare)}
            </p>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full ${state.fillClass}`}
              style={{ width: `${Math.min(topShare, 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
            <span>Top person</span>
            <span>Everyone else: {formatPercent(restShare)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {sortedData.slice(0, 3).map((entry, index) => (
          <div
            key={entry.user}
            className="rounded-lg border border-[var(--color-border-soft)] bg-black/15 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Rank {index + 1}
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-[var(--color-text-primary)]">
              {entry.user}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {formatPercent(entry.dominance)} of edits
            </p>
          </div>
        ))}
      </div>
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
