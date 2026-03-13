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

export default function SessionSummaryPage() {
  const [sessionInfo, setSessionInfo] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    name: string
  }>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      )

      if (!res.ok) return

      const data = await res.json()
      if (!cancelled) {
        setMetrics(data.data)
      }
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
          <div className="(space-y-8">
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
          </div>
        </AppShell>
      </SessionProvider>
    )
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