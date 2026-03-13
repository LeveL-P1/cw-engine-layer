"use client"

import { useState } from "react"
import { useSession, ModeType } from "@/context/session-context"

const modes: ModeType[] = ["FREE", "DECISION", "LOCKED"]

export function ModeControlPanel() {
  const { role, mode, sessionId } = useSession()

  const [loading, setLoading] = useState(false)
  const [pendingMode, setPendingMode] = useState<ModeType | null>(null)

  if (role !== "FACILITATOR") return null

  const requiresConfirmation = (m: ModeType) =>
    m === "LOCKED" || m === "DECISION"

  const requestModeChange = async (newMode: ModeType) => {
    try {
      setLoading(true)

      await fetch("http://localhost:3001/api/session/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mode: newMode }),
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
      <div className="flex items-center gap-2">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => handleClick(m)}
            disabled={loading || m === mode}
            className={`px-3 py-1 rounded-md text-xs font-medium
              ${m === mode
                ? "bg-zinc-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
              }
            `}
          >
            {m}
          </button>
        ))}
      </div>

      {pendingMode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg w-96 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-3">
              Confirm Mode Change
            </h3>

            <p className="text-sm text-zinc-400 mb-6">
              Switching to <span className="font-medium">{pendingMode}</span> mode
              will restrict user interaction. Continue?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingMode(null)}
                className="px-4 py-2 text-sm bg-zinc-800 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={() => requestModeChange(pendingMode)}
                className="px-4 py-2 text-sm bg-red-600 rounded-md text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}