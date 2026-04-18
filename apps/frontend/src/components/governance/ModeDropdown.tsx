"use client"

import { useState } from "react"
import { useSession, type ModeType } from "@/context/session-context"
import { apiFetch } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"

const modes: ModeType[] = ["FREE", "DECISION", "LOCKED"]

export function ModeDropdown() {
  const { role, mode, sessionId, setMode } = useSession()
  const [loading, setLoading] = useState(false)

  if (role !== "FACILITATOR") {
    return null
  }

  const handleChange = async (nextMode: ModeType) => {
    if (nextMode === mode) {
      return
    }

    if (
      (nextMode === "DECISION" || nextMode === "LOCKED") &&
      !window.confirm(`Switch to ${nextMode} mode? This will restrict collaboration.`)
    ) {
      return
    }

    try {
      setLoading(true)
      await apiFetch(`${publicEnv.apiUrl}/api/mode/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      })
      setMode(nextMode)
    } catch (error) {
      console.error("Mode change failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="session-mode" className="text-xs font-medium text-[var(--color-text-muted)]">
        Mode
      </label>
      <select
        id="session-mode"
        value={mode}
        disabled={loading}
        onChange={(event) => handleChange(event.target.value as ModeType)}
        className="cursor-pointer rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
      >
        {modes.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
    </div>
  )
}
