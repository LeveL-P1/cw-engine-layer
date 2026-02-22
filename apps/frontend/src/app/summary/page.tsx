"use client"

import { AppShell } from "@/components/layout/AppShell"
import { useSession } from "@/context/session-context"

export default function SessionSummaryPage() {
    const {
        sessionName,
        dominanceRatio,
        activeUsers,
        sessionStartTime,
    } = useSession()

    const totalEdits = 142   // Replace with real API later
    const modeBreakdown = {
        FREE: "12m",
        DECISION: "5m",
        LOCKED: "3m",
    }

    const mostActiveUser = "Bob"

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
                            participants: activeUsers.length,
                            dominanceRatio,
                            mostActiveUser,
                            modeBreakdown,
                        })
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                >
                    Export Report
                </button>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                    <SummaryCard label="Session Name" value={sessionName} />
                    <SummaryCard label="Total Edits" value={totalEdits} />
                    <SummaryCard label="Participants" value={activeUsers.length} />
                    <SummaryCard label="Dominance Ratio" value={dominanceRatio.toFixed(2)} />
                    <SummaryCard label="Most Active User" value={mostActiveUser} />

                </div>

                {/* Mode Breakdown */}
                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-4">
                        Mode Distribution
                    </h3>

                    <ul className="space-y-2 text-sm text-zinc-300">
                        {Object.entries(modeBreakdown).map(([mode, duration]) => (
                            <li key={mode} className="flex justify-between">
                                <span>{mode}</span>
                                <span>{duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>


            </div>
        </AppShell>
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