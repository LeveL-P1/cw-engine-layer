"use client"

import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { useEffect, useState } from "react"

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

type TransitionDto = {
  timestamp: string
  mode: string
}

export default function SessionSummaryPage() {
  const [sessionInfo, setSessionInfo] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    name: string
  }>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modeBreakdown, setModeBreakdown] = useState<
    { mode: string; durationMinutes: number }[]
  >([])

  useEffect(() => {
    if (typeof window === "undefined") return

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

    let cancelled = false

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
      if (cancelled) return

      setMetrics(data.data)

      const transitionsRes = await fetch(
        `http://localhost:4000/api/metrics/${sessionInfo.sessionId}/mode-transitions`,
        {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem("authToken") ?? ""}`,
          },
        },
      )

      if (!transitionsRes.ok) return

      const transitionsData = await transitionsRes.json()
      const transitions = transitionsData.data as TransitionDto[]

      if (!transitions.length || cancelled) return

      const breakdown = computeModeDurations(transitions)

      setModeBreakdown(breakdown)
    }

    loadMetrics()

    return () => {
      cancelled = true
    }
  }, [sessionInfo])

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!sessionInfo || !metrics) {
    return <div className="p-6">Loading summary...</div>
  }

  const sessionName = "Whiteboard Session"
  const totalEdits = metrics.totalEdits
  const dominanceRatio = metrics.dominanceRatio
  const participants = metrics.activeUsers
  const mostActiveUser =
    metrics.perUser.length > 0
      ? metrics.perUser.reduce((a, b) => (b.edits > a.edits ? b : a)).userId
      : sessionInfo.userId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function exportReport(data: any) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "session-report.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <SessionProvider
      initialState={{
        sessionId: sessionInfo.sessionId,
        sessionName,
        role: sessionInfo.role,
        mode: "FREE",
        dominanceRatio,
        activeUsers: [
          {
            id: sessionInfo.userId,
            name: sessionInfo.name,
            role: sessionInfo.role,
          },
        ],
        sessionStartTime: Date.now(),
        modeStartedAt: Date.now(),
      }}
    >
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              Session Summary
            </h1>
            <p className="text-sm text-zinc-400">
              Analytical overview of collaboration performance
            </p>
          </div>
          <button
            onClick={() =>
              exportReport({
                sessionName,
                totalEdits,
                participants,
                dominanceRatio,
                mostActiveUser,
                modes: modeBreakdown,
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            Export Report
          </button>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <SummaryCard label="Session Name" value={sessionName} />
            <SummaryCard label="Total Edits" value={totalEdits} />
            <SummaryCard label="Participants" value={participants} />
            <SummaryCard
              label="Dominance Ratio"
              value={dominanceRatio.toFixed(2)}
            />
            <SummaryCard label="Most Active User" value={mostActiveUser} />
          </div>

          {modeBreakdown.length > 0 && (
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h3 className="text-lg font-semibold mb-4">
                Mode Distribution
              </h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {modeBreakdown.map((entry) => (
                  <li
                    key={entry.mode}
                    className="flex justify-between"
                  >
                    <span>{entry.mode}</span>
                    <span>{entry.durationMinutes.toFixed(1)} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AppShell>
    </SessionProvider>
  )
}

function computeModeDurations(transitions: TransitionDto[]) {
  const sorted = [...transitions].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  const durations = new Map<string, number>()

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    const start = new Date(current.timestamp).getTime()
    const end = next
      ? new Date(next.timestamp).getTime()
      : Date.now()

    const deltaMs = Math.max(0, end - start)
    const existing = durations.get(current.mode) ?? 0

    durations.set(current.mode, existing + deltaMs)
  }

  return Array.from(durations.entries()).map(([mode, totalMs]) => ({
    mode,
    durationMinutes: totalMs / 60000,
  }))
}

function SummaryCard({
    label,
    value,
}: {
    label: string
    value: string | number
}) {
    return (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-2">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
        </div>
    )
}