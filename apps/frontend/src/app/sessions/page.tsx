"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/context/auth-context"
import { setStoredSession } from "@/lib/session-storage"
import { apiFetch } from "@/lib/api"
import type { RoleType } from "@/context/session-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const DEFAULT_SESSION_NAME = "Whiteboard Session"

function resolveJoinSessionId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    return ""
  }

  try {
    const parsedUrl = new URL(trimmed)
    const fromQuery = parsedUrl.searchParams.get("sessionId")
    return fromQuery?.trim() || trimmed
  } catch {
    return trimmed
  }
}

export default function SessionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [sessionName, setSessionName] = useState(DEFAULT_SESSION_NAME)
  const [joinSessionId, setJoinSessionId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedDisplayName = useMemo(() => {
    return displayName.trim() || user?.name || ""
  }, [displayName, user?.name])
  const resolvedSessionName = useMemo(() => {
    return sessionName.trim() || DEFAULT_SESSION_NAME
  }, [sessionName])
  const invitedSessionId = searchParams.get("sessionId")?.trim() ?? ""

  useEffect(() => {
    if (invitedSessionId) {
      setJoinSessionId(invitedSessionId)
    }
  }, [invitedSessionId])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.replace("/auth")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleStartSession = async () => {
    if (!user?.email) {
      setError("You must be logged in with a valid email to start a session.")
      return
    }

    if (!resolvedDisplayName) {
      setError("Please enter your display name before starting a session.")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const role: RoleType = "FACILITATOR"

      const createRes = await apiFetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: resolvedSessionName }),
      })

      if (!createRes.ok) {
        throw new Error("Failed to create session")
      }

      const created = await createRes.json()

      const joinRes = await apiFetch(`${API_URL}/api/sessions/${created.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resolvedDisplayName,
          role,
        }),
      })

      if (!joinRes.ok) {
        const joinError = await joinRes.json().catch(() => null)
        throw new Error(joinError?.message ?? "Failed to join session")
      }

      const joinPayload = await joinRes.json()

      setStoredSession({
        sessionId: created.id,
        userId: user.id,
        role: joinPayload.role ?? role,
        displayName: resolvedDisplayName,
        sessionName: joinPayload.sessionName ?? created.name ?? resolvedSessionName,
      })

      router.push(`/whiteboard/${created.id}`)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start a new session right now."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinSession = async () => {
    if (!user?.email) {
      setError("You must be logged in with a valid email to join a session.")
      return
    }

    if (!resolvedDisplayName) {
      setError("Please enter your display name before joining a session.")
      return
    }

    const sessionId = resolveJoinSessionId(joinSessionId)

    if (!sessionId) {
      setError("Please enter a session ID to join.")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const role: RoleType = "CONTRIBUTOR"

      const joinRes = await apiFetch(`${API_URL}/api/sessions/${sessionId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resolvedDisplayName,
          role,
        }),
      })

      if (!joinRes.ok) {
        const joinError = await joinRes.json().catch(() => null)
        throw new Error(joinError?.message ?? "Failed to join session")
      }

      const joinPayload = await joinRes.json()

      setStoredSession({
        sessionId,
        userId: user.id,
        role: joinPayload.role ?? role,
        displayName: resolvedDisplayName,
        sessionName: joinPayload.sessionName ?? DEFAULT_SESSION_NAME,
      })

      router.push(`/whiteboard/${sessionId}`)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to join the session right now."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                Start a governed whiteboard session
              </h1>
              <p className="text-sm text-zinc-400">
                Signed in as {user?.name ?? "user"}.
              </p>
              <p className="text-sm text-zinc-500">
                {invitedSessionId
                  ? "An invite link pre-filled the session for you. Enter your display name and join."
                  : "Create a new session or join an existing one with its invite link or ID."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Your display name</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={user?.name ?? "Enter your name"}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">New session name</label>
            <input
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={DEFAULT_SESSION_NAME}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Session invite or ID</label>
            <input
              value={joinSessionId}
              onChange={(event) => setJoinSessionId(event.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste an invite session ID"
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleStartSession}
              disabled={submitting || isLoggingOut}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Working..." : "Create Session"}
            </button>
            <button
              onClick={handleJoinSession}
              disabled={submitting || isLoggingOut}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 disabled:opacity-60"
            >
              {submitting ? "Working..." : "Join Session"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
