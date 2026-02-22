/* eslint-disable react-hooks/purity */
"use client"

import { connectWebSocket, setModeListener } from "@/lib/websocket"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider } from "@/context/session-context"
import { ActivityTimeline } from "@/components/analytics/ActivityTimeline"
import type { ModeTransition } from "@/components/analytics/ActivityTimeline"

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

  const timelineData = [
    { time: "00:00", edits: 2 },
    { time: "02:00", edits: 5 },
    { time: "04:00", edits: 12 },
    { time: "06:00", edits: 7 },
    { time: "08:00", edits: 18 },
    { time: "10:00", edits: 9 },
  ]

  const transitions: ModeTransition[] = [
    { time: "02:00", mode: "FREE" },
    { time: "06:00", mode: "DECISION" },
    { time: "08:00", mode: "LOCKED" },
  ]
  
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [mode, setMode] = useState<string>("FREE")

  useEffect(() => {
    let mounted = true
    connectWebSocket("session-1", "user-1")

    // 🔹 Load metrics (polling)
    const loadMetrics = async () => {
      const res = await fetch("http://localhost:4000/api/metrics/session-1")
      if (!res.ok) return

      const data = await res.json()
      if (mounted) {
        setMetrics(data.data)
      }
    }

    // 🔹 Load initial mode once
    const loadMode = async () => {
      const res = await fetch("http://localhost:4000/api/mode/session-1")
      if (!res.ok) return

      const data = await res.json()
      if (mounted) {
        setMode(data.mode)
      }
    }

    loadMetrics()
    loadMode()

    const interval = setInterval(loadMetrics, 5000)

    // 🔹 Real-time mode listener
    setModeListener((newMode) => {
      setMode(newMode)
    })

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!metrics) {
    return <div className="p-6">Loading metrics...</div>
  }

  return (
    <SessionProvider
      initialState={{
        sessionId: "session-123",
        sessionName: "Design Sprint",
        role: "FACILITATOR",
        mode: "FREE",
        dominanceRatio: 0.62,
        activeUsers: [
          { id: "1", name: "Alice", role: "FACILITATOR" },
          { id: "2", name: "Bob", role: "CONTRIBUTOR" },
          { id: "3", name: "Charlie", role: "CONTRIBUTOR" },
          { id: "4", name: "Dana", role: "OBSERVER" },
          { id: "5", name: "Evan", role: "CONTRIBUTOR" },
          { id: "6", name: "Faye", role: "CONTRIBUTOR" },
        ],
        sessionStartTime: Date.now() - 1000 * 60 * 12,
        modeStartedAt: Date.now() - 1000 * 60 * 3,
      }}
    >
      <AppShell>

        <ActivityTimeline
          data={timelineData}
          transitions={transitions}
        />

        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors">

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Session Dashboard</h1>

            <div className="flex items-center gap-4">
              <span className="font-semibold">
                Mode: {mode}
              </span>

              <button
                onClick={async () => {
                  const newMode = mode === "FREE" ? "LOCKED" : "FREE"

                  await fetch("http://localhost:4000/api/mode/session-1", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mode: newMode,
                      userId: "user-1"   // TEMPORARY hardcoded
                    })
                  })
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Toggle Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card title="Total Edits" value={metrics.totalEdits} />
            <Card title="Active Users" value={metrics.activeUsers} />
            <Card
              title="Dominance Ratio"
              value={metrics.dominanceRatio.toFixed(2)}
            />
          </div>

          <div className="w-full h-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Participation Breakdown
            </h2>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.perUser}>
                <XAxis dataKey="userId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="edits" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AppShell>
    </SessionProvider >
  )
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl mt-2">{value}</p>
    </div>
  )
}
