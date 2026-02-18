/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

type PerUser = {
  userId: string
  edits: number
}

type Metrics = {
  totalEdits: number
  activeUsers: number
  dominanceRatio: number
  perUser: PerUser[]
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    let mounted = true

    const loadMetrics = async () => {
      const res = await fetch("http://localhost:4000/api/metrics/session-1")
      if (!res.ok) return

      const data = await res.json()
      if (mounted) {
        setMetrics(data.data)
      }
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!metrics) {
    return <div className="p-6">Loading metrics...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Session Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Edits" value={metrics.totalEdits} />
        <Card title="Active Users" value={metrics.activeUsers} />
        <Card
          title="Dominance Ratio"
          value={metrics.dominanceRatio.toFixed(2)}
        />
      </div>

      <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">

        <h2 className="text-lg font-semibold mb-4">
          Participation Breakdown
        </h2>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.perUser}>
            <XAxis dataKey="userId" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="edits" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl mt-2">{value}</p>
    </div>
  )
}
