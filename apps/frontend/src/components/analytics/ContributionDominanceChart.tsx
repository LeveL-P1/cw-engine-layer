"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ContributionDominanceChartProps {
  data: {
    user: string
    dominance: number
  }[]
  title?: string
  chrome?: "card" | "plain"
  height?: number
}

export function ContributionDominanceChart({
  data,
  title = "Contribution Dominance",
  chrome = "card",
  height = 320,
}: ContributionDominanceChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
      >
        <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          stroke="#9ea8cc"
        />
        <YAxis dataKey="user" type="category" width={120} stroke="#9ea8cc" />
        <Tooltip
          formatter={(value) => `${Number(value).toFixed(1)}%`}
          contentStyle={{
            background: "rgba(14, 16, 26, 0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            color: "#f7f8ff",
          }}
        />
        <Bar dataKey="dominance" fill="url(#dominanceGradient)" radius={[0, 8, 8, 0]} />
        <defs>
          <linearGradient id="dominanceGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-chart-4)" />
            <stop offset="100%" stopColor="var(--color-chart-2)" />
          </linearGradient>
        </defs>
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
