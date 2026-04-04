"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { MetricsPerUser } from "@/types/session"

interface ParticipationBreakdownProps {
  data: MetricsPerUser[]
  title?: string
  chrome?: "card" | "plain"
  height?: number
}

export function ParticipationBreakdown({
  data,
  title = "Participation Breakdown",
  chrome = "card",
  height = 300,
}: ParticipationBreakdownProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis dataKey="userId" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip />
        <Bar dataKey="edits" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )

  if (chrome === "plain") {
    return (
      <div className="h-full">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
        {chart}
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-soft)]">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {chart}
    </div>
  )
}
