"use client"

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

export function ActivityTimeline({ data, transitions }: Props) {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold mb-4">
        Activity Timeline with Mode Transitions
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="edits"
            stroke="#3b82f6"
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
    </div>
  )
}