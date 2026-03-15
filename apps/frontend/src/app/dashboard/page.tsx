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
import { SessionProvider, type RoleType } from "@/context/session-context"
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

type TimelinePoint = {
  timestamp: string
  edits: number
}

type TransitionDto = {
  timestamp: string
  mode: string
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [mode, setMode] = useState<string>("FREE")
  const [sessionInfo, setSessionInfo] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    name: string
  }>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [modeTransitions, setModeTransitions] = useState<ModeTransition[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    const token = window.localStorage.getItem("authToken")

    if (!token) {
      setError("Not authenticated. Start a session from the whiteboard first.")
      return
    }

    const stored = window.sessionStorage.getItem("currentSession")

    if (!stored) {
      setError("No active session found. Start a session from the whiteboard.")
      return
    }

    try {
      const parsed = JSON.parse(stored) as {
        sessionId: string
        userId: string
        role: RoleType
        name: string
      }

      setSessionInfo(parsed)
    } catch {
      setError("Stored session information is invalid.")
    }
  }, [])

  useEffect(() => {
    if (!sessionInfo) return

    let mounted = true

    connectWebSocket(sessionInfo.sessionId, sessionInfo.userId)

    // 🔹 Load metrics (polling)
    const loadMetrics = async () => {
      const res = await fetch(
        `http://localhost:4000/api/metrics/${sessionInfo.sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
          },
        },
      )
      if (!res.ok) return

      const data = await res.json()
      if (mounted) {
        setMetrics(data.data)
      }
    }

    // 🔹 Load initial mode once
    const loadMode = async () => {
      const res = await fetch(
        `http://localhost:4000/api/mode/${sessionInfo.sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
          },
        },
      )
      if (!res.ok) return

      const data = await res.json()
      if (mounted) {
        setMode(data.mode)
      }
    }

    const loadTimeline = async () => {
      const res = await fetch(
        `http://localhost:4000/api/metrics/${sessionInfo.sessionId}/timeline`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
          },
        },
      )

      if (!res.ok) return

      const data = await res.json()

      if (mounted) {
        setTimeline(data.data)
      }
    }

    const loadModeTransitions = async () => {
      const res = await fetch(
        `http://localhost:4000/api/metrics/${sessionInfo.sessionId}/mode-transitions`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
          },
        },
      )

      if (!res.ok) return

      const data = await res.json()

      if (mounted) {
        const mapped: ModeTransition[] = (data.data as TransitionDto[]).map(
          (t) => ({
            time: new Date(t.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            mode: t.mode as "FREE" | "DECISION" | "LOCKED",
          }),
        )

        setModeTransitions(mapped)
      }
    }

    loadMetrics()
    loadMode()
    loadTimeline()
    loadModeTransitions()

    const interval = setInterval(loadMetrics, 5000)

    // 🔹 Real-time mode listener
    setModeListener((newMode) => {
      setMode(newMode)
    })

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [sessionInfo])

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!sessionInfo || !metrics) {
    return <div className="p-6">Loading dashboard...</div>
  }

  const now = Date.now()

  return (
    <SessionProvider
      initialState={{
        sessionId: sessionInfo.sessionId,
        sessionName: "Whiteboard Session",
        role: sessionInfo.role,
        mode: mode as "FREE" | "DECISION" | "LOCKED",
        dominanceRatio: metrics.dominanceRatio,
        activeUsers: [
          {
            id: sessionInfo.userId,
            name: sessionInfo.name,
            role: sessionInfo.role,
          },
        ],
        sessionStartTime: now,
        modeStartedAt: now,
      }}
    >
      <AppShell>
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

                  await fetch(
                    `http://localhost:4000/api/mode/${sessionInfo.sessionId}`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
                      },
                      body: JSON.stringify({
                        mode: newMode,
                      }),
                    },
                  )
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

          {timeline.length > 0 && (
            <ActivityTimeline
              data={timeline.map((point) => ({
                time: new Date(point.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                edits: point.edits,
              }))}
              transitions={modeTransitions}
            />
          )}

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
