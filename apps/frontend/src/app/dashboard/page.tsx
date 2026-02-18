"use client"

import { useEffect, useState } from "react"

type Metrics = {
    totalEdits: number
    activeUsers: number
    dominanceRatio: number
}

export default function Dashboard() {

    const [metrics, setMetrics] = useState<Metrics | null>(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function fetchMetrics() {
        const res = await fetch("http://localhost:4000/api/metrics/session-1")
        if (!res.ok) return
        const data = await res.json()
        setMetrics(data.data)
    }

    useEffect(() => {
        const controller = new AbortController()

        const loadMetrics = async () => {
            try {
                const res = await fetch(
                    "http://localhost:4000/api/metrics/session-1",
                    { signal: controller.signal }
                )

                if (!res.ok) return

                const data = await res.json()
                setMetrics(data.data)

            } catch {
                // ignore abort errors
            }
        }

        loadMetrics()
        const interval = setInterval(loadMetrics, 5000)

        return () => {
            controller.abort()
            clearInterval(interval)
        }
    }, [])


    if (!metrics) {
        return <div className="p-6">Loading metrics...</div>
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Session Dashboard</h1>

            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold">Total Edits</h2>
                    <p className="text-3xl mt-2">{metrics.totalEdits}</p>
                </div>

                <div className="p-6 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold">Active Users</h2>
                    <p className="text-3xl mt-2">{metrics.activeUsers}</p>
                </div>

                <div className="p-6 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold">Dominance Ratio</h2>
                    <p className="text-3xl mt-2">
                        {metrics.dominanceRatio.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    )
}
