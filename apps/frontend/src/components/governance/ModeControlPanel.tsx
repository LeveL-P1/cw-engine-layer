"use client"

import { useState } from "react"
import { useSession, ModeType } from "@/context/session-context"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

const modes: ModeType[] = ["FREE", "DECISION", "LOCKED"]
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export function ModeControlPanel() {
  const { role, mode, sessionId, activeUsers } = useSession()

  const [loading, setLoading] = useState(false)
  const [pendingMode, setPendingMode] = useState<ModeType | null>(null)

  if (role !== "FACILITATOR") {
    return (
      <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 text-sm text-[var(--color-text-muted)]">
        Facilitator mode controls appear here when you host the session.
      </div>
    )
  }

  const requiresConfirmation = (m: ModeType) =>
    m === "LOCKED" || m === "DECISION"

  const requestModeChange = async (newMode: ModeType) => {
    const facilitator = activeUsers.find((user) => user.role === "FACILITATOR")

    if (!facilitator) {
      console.error("No facilitator found in activeUsers; cannot change mode")
      return
    }

    try {
      setLoading(true)

      await apiFetch(`${API_URL}/api/mode/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: newMode,
        }),
      })

      // Wait for WebSocket MODE_CHANGED
    } catch (err) {
      console.error("Mode change failed", err)
    } finally {
      setLoading(false)
      setPendingMode(null)
    }
  }

  const handleClick = (newMode: ModeType) => {
    if (newMode === mode) return

    if (requiresConfirmation(newMode)) {
      setPendingMode(newMode)
    } else {
      requestModeChange(newMode)
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Governance mode
          </p>
          <Badge mode={mode} size="sm">
            {mode}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {modes.map((m) => (
            <Button
              key={m}
              type="button"
              onClick={() => handleClick(m)}
              disabled={loading || m === mode}
              variant={m === mode ? "primary" : "secondary"}
              className="justify-start"
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {pendingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <SurfaceCard className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Confirm Mode Change
            </h3>

            <p className="mb-6 mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
              Switching to <span className="font-medium text-[var(--color-text-primary)]">{pendingMode}</span> mode
              will restrict user interaction. Continue?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setPendingMode(null)}
                variant="ghost"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => requestModeChange(pendingMode)}
                variant="danger"
              >
                Confirm
              </Button>
            </div>
          </SurfaceCard>
        </div>
      )}
    </>
  )
}
