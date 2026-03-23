"use client"

import { AppShell } from "@/components/layout/AppShell"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getStoredSession } from "@/lib/session-storage"
import { ProtectedRoute } from "@/components/ProtectedRoute"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function emptyMetrics(): Metrics {
  return {
    totalEdits: 0,
    activeUsers: 1,
    dominanceRatio: 0,
    perUser: [],
  }
}

export default function SessionSummaryPage() {
  const router = useRouter()
  const params = useParams<{ sessionId: string }>()
  const [sessionInfo] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
    name: string
  }>(() => getStoredSession())
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [modeBreakdown, setModeBreakdown] = useState<
    { mode: string; durationMinutes: number }[]
  >([])
  const [loadedAt] = useState(() => Date.now())

  useEffect(() => {
    if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) {
      router.replace("/sessions")
    }
  }, [params.sessionId, router, sessionInfo])

  useEffect(() => {
    if (!sessionInfo || sessionInfo.sessionId !== params.sessionId) return

    let cancelled = false

    const loadMetrics = async () => {
      try {
        const res = await fetch(`${API_URL}/api/metrics/${sessionInfo.sessionId}`)

        if (res.status === 404) {
          if (!cancelled) {
            setMetrics(emptyMetrics())
          }
          return
        }

        if (!res.ok) {
          throw new Error("Failed to load summary metrics")
        }

        const data = await res.json()
        if (cancelled) return

        setMetrics(data.data)

        const transitionsRes = await fetch(
          `${API_URL}/api/metrics/${sessionInfo.sessionId}/mode-transitions`,
        )

        if (!transitionsRes.ok) return

        const transitionsData = await transitionsRes.json()
        const transitions = transitionsData.data as TransitionDto[]

        if (!transitions.length || cancelled) return

        setModeBreakdown(computeModeDurations(transitions))
      } catch {
        if (!cancelled) {
          setMetrics(emptyMetrics())
          setModeBreakdown([])
        }
      }
    }

    void loadMetrics()

    return () => {
      cancelled = true
    }
  }, [params.sessionId, sessionInfo])

  const sessionName = "Whiteboard Session"
  const totalEdits = metrics?.totalEdits ?? 0
  const dominanceRatio = metrics?.dominanceRatio ?? 0
  const participants = metrics?.activeUsers ?? 1
  const mostActiveUser =
    metrics && metrics.perUser.length > 0
      ? metrics.perUser.reduce((left, right) =>
          right.edits > left.edits ? right : left,
        ).userId
      : sessionInfo?.userId ?? "Unknown"

  function exportReport(data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "session-report.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute>
      {!sessionInfo || sessionInfo.sessionId !== params.sessionId || !metrics ? (
        <div className="p-6">Loading summary...</div>
      ) : (
        <SessionProvider
          initialState={{
            sessionId: sessionInfo.sessionId,
            userId: sessionInfo.userId,
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
            sessionStartTime: loadedAt,
            modeStartedAt: loadedAt,
          }}
        >
          <AppShell>
            <div className="space-y-8">
              <div>
                <h1 className="mb-2 text-2xl font-semibold">Session Summary</h1>
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
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Export Report
              </button>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <SummaryCard label="Session Name" value={sessionName} />
                <SummaryCard label="Total Edits" value={totalEdits} />
                <SummaryCard label="Participants" value={participants} />
                <SummaryCard
                  label="Dominance Ratio"
                  value={dominanceRatio.toFixed(2)}
                />
                <SummaryCard label="Most Active User" value={mostActiveUser} />
              </div>

              {modeBreakdown.length > 0 ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Mode Distribution</h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {modeBreakdown.map((entry) => (
                      <li key={entry.mode} className="flex justify-between">
                        <span>{entry.mode}</span>
                        <span>{entry.durationMinutes.toFixed(1)} min</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
                  No summary metrics yet. Draw on the board first, then revisit this
                  page.
                </div>
              )}
            </div>
          </AppShell>
        </SessionProvider>
      )}
    </ProtectedRoute>
  )
}

function computeModeDurations(transitions: TransitionDto[]) {
  const sorted = [...transitions].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  )

  const durations = new Map<string, number>()

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index]
    const next = sorted[index + 1]

    const start = new Date(current.timestamp).getTime()
    const end = next ? new Date(next.timestamp).getTime() : Date.now()

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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <p className="mb-2 text-xs text-zinc-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}
