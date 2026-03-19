"use client"

import { useState } from "react"
import Whiteboard from "@/components/whiteboard/whiteboard"
import { SessionProvider, type RoleType } from "@/context/session-context"
import { AppShell } from "@/components/layout/AppShell"

export default function WhiteboardPage() {
  const [displayName, setDisplayName] = useState("")
  const [sessionState, setSessionState] = useState<null | {
    sessionId: string
    userId: string
    role: RoleType
  }>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartSession = async () => {
    if (!displayName.trim()) {
      setError("Please enter your name before starting a session.")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const role: RoleType = "FACILITATOR"
      const name = displayName.trim()

      let token: string | null = null
      let userId: string

      const authRes = await fetch("http://localhost:4000/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      })

      if (authRes.ok) {
        const authData = await authRes.json() as {
          token: string
          user: { id: string; name: string; role: RoleType }
        }

        token = authData.token
        userId = authData.user.id

        if (typeof window !== "undefined") {
          window.localStorage.setItem("authToken", token)
        }
      } else {
        userId = crypto.randomUUID()

        if (typeof window !== "undefined") {
          window.localStorage.removeItem("authToken")
        }
      }

      const createRes = await fetch("http://localhost:4000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: null }),
      })

      if (!createRes.ok) {
        throw new Error("Failed to create session")
      }

      const created = await createRes.json()

      const joinRes = await fetch(
        `http://localhost:4000/api/sessions/${created.id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            token
              ? {}
              : {
                userId,
                name,
                role,
              }
          ),
        }
      )

      if (!joinRes.ok) {
        throw new Error("Failed to join session")
      }

      const nextState = {
        sessionId: created.id,
        userId,
        role,
        name: displayName.trim(),
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "currentSession",
          JSON.stringify(nextState),
        )
      }

      setSessionState(nextState)
    } catch (e) {
      setError("Unable to start a new session right now.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!sessionState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="w-full max-w-md space-y-6 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <h1 className="text-2xl font-semibold">
            Start a governed whiteboard session
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your name to create a new facilitated session.
          </p>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Your name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleStartSession}
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? "Starting..." : "Start Session"}
          </button>
        </div>
      </div>
    )
  }

  const now = Date.now()

  return (
    <SessionProvider
      initialState={{
        sessionId: sessionState.sessionId,
        sessionName: "Whiteboard Session",
        role: sessionState.role,
        mode: "FREE",
        dominanceRatio: 0,
        activeUsers: [
          {
            id: sessionState.userId,
            name: displayName.trim(),
            role: sessionState.role,
          },
        ],
        sessionStartTime: now,
        modeStartedAt: now,
      }}
    >
      <AppShell>
        <Whiteboard
          sessionId={sessionState.sessionId}
          userId={sessionState.userId}
        />
      </AppShell>
    </SessionProvider>
  )
}

