"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AlertMessage } from "@/components/ui/AlertMessage"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StatePanel } from "@/components/ui/StatePanel"
import { SurfaceCard } from "@/components/ui/SurfaceCard"
import { useAuth } from "@/context/auth-context"
import { setStoredSession } from "@/lib/session-storage"
import { apiFetch, getApiErrorMessage } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"
import type { RoleType } from "@/context/session-context"

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

function SessionsContent() {
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

  if (!user) {
    return (
      <ProtectedRoute>
        <StatePanel
          title="Loading your lobby"
          message="Restoring your account before opening the session lobby..."
          loading
        />
      </ProtectedRoute>
    )
  }

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

      const createRes = await apiFetch(`${publicEnv.apiUrl}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: resolvedSessionName }),
      })

      if (!createRes.ok) {
        throw new Error(
          await getApiErrorMessage(createRes, "Failed to create session"),
        )
      }

      const created = await createRes.json()

      const joinRes = await apiFetch(`${publicEnv.apiUrl}/api/sessions/${created.id}/join`, {
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
        throw new Error(
          await getApiErrorMessage(joinRes, "Failed to join session"),
        )
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

      const joinRes = await apiFetch(`${publicEnv.apiUrl}/api/sessions/${sessionId}/join`, {
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
        throw new Error(
          await getApiErrorMessage(joinRes, "Failed to join session"),
        )
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
      <div className="min-h-screen px-4 py-10 text-[var(--color-text-primary)]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          <SurfaceCard className="p-6 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
                  Session Lobby
                </p>
                <h1 className="mt-2 text-2xl font-semibold">
                  Create or join a board quickly
                </h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                <span>Signed in as {user?.name ?? "user"}</span>
                <Button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="secondary"
                  size="sm"
                >
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                id="displayName"
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={user?.name ?? "Enter your name"}
              />
              <Input
                id="sessionName"
                label="New session name"
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder={DEFAULT_SESSION_NAME}
              />
            </div>

            <div className="mt-4">
              <Input
                id="joinSessionId"
                label="Invite link or session ID"
                value={joinSessionId}
                onChange={(event) => setJoinSessionId(event.target.value)}
                placeholder="Paste invite link or session ID"
                helperText={
                  invitedSessionId
                    ? "Invite detected. Review your name and join when ready."
                    : "Create a board or paste an invite to join one."
                }
              />
            </div>

            {error ? (
              <div className="mt-4">
                <AlertMessage message={error} tone="error" />
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleStartSession}
                disabled={submitting || isLoggingOut}
                fullWidth
              >
                {submitting ? "Working..." : "Create Session"}
              </Button>
              <Button
                onClick={handleJoinSession}
                disabled={submitting || isLoggingOut}
                variant="secondary"
                fullWidth
              >
                {submitting ? "Working..." : "Join Session"}
              </Button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <StatePanel
            title="Loading your lobby"
            message="Preparing session options..."
            loading
          />
        </ProtectedRoute>
      }
    >
      <SessionsContent />
    </Suspense>
  )
}
