"use client"

import clsx from "clsx"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

type ModeType = "FREE" | "DECISION" | "LOCKED"

interface TimelinePoint {
  time: string
  edits: number
}

export type ModeTransition = {
  time: string
  mode: ModeType
}

interface Props {
  data: TimelinePoint[]
  transitions: ModeTransition[]
  title?: string
  chrome?: "card" | "plain"
  height?: number
}


function getModeColor(mode: ModeType) {
  switch (mode) {
    case "FREE":
      return "#10b981"
    case "DECISION":
      return "#f59e0b"
    case "LOCKED":
      return "#ef4444"
    default:
      return "#888"
  }
}

export function ActivityTimeline({
  data,
  transitions,
  title = "Activity Timeline with Mode Transitions",
  chrome = "card",
  height = 300,
}: Props) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis dataKey="time" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip />

        <Line
          type="monotone"
          dataKey="edits"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={false}
        />

        {transitions.map((t, index) => (
          <ReferenceLine
            key={index}
            x={t.time}
            stroke={getModeColor(t.mode)}
            strokeDasharray="3 3"
            label={{
              value: t.mode,
              position: "top",
              fill: getModeColor(t.mode),
              fontSize: 12,
            }}
          />
        ))}
      </LineChart>
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
    <div
      className={clsx(
        "rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-soft)]",
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {chart}
    </div>
  )
}
