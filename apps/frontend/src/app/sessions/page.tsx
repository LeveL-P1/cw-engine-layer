"use client"

import { useEffect, useMemo, useState } from "react"
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

      const createRes = await apiFetch(`${API_URL}/api/sessions`, {
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.14),transparent_25%),linear-gradient(180deg,var(--color-bg-canvas)_0%,var(--color-bg-app)_100%)] px-4 py-10 text-[var(--color-text-primary)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <SurfaceCard className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
                  Session Lobby
                </p>
                <h1 className="text-3xl font-semibold">Start from the board, not from the admin UI</h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
                  Create a fresh whiteboard session or join an invite. Governance and analytics stay available later, but the board remains the first destination.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Signed in as {user?.name ?? "user"}
                </p>
                <Button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="secondary"
                >
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </Button>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Shared session identity
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  This display name is what other people will see beside your edits and presence on the board.
                </p>
              </div>
              <Input
                id="displayName"
                label="Your display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder={user?.name ?? "Enter your name"}
              />
            </div>
          </SurfaceCard>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-5 p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Create a new session</h2>
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  Best when you are facilitating a new class, interview, design review, or workshop.
                </p>
              </div>

              <Input
                id="sessionName"
                label="New session name"
                value={sessionName}
                onChange={(event) => setSessionName(event.target.value)}
                placeholder={DEFAULT_SESSION_NAME}
                helperText="Choose a name participants will recognize when they open the board."
              />

              {error ? <AlertMessage message={error} tone="error" /> : null}

              <Button
                onClick={handleStartSession}
                disabled={submitting || isLoggingOut}
                fullWidth
                size="lg"
              >
                {submitting ? "Working..." : "Create Session"}
              </Button>
            </SurfaceCard>

            <div className="space-y-6">
              <SurfaceCard className="space-y-5 p-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Join an existing session</h2>
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    Paste an invite link or session ID and head straight to the active board.
                  </p>
                </div>

                <Input
                  id="joinSessionId"
                  label="Session invite or ID"
                  value={joinSessionId}
                  onChange={(event) => setJoinSessionId(event.target.value)}
                  placeholder="Paste an invite session ID"
                  helperText={
                    invitedSessionId
                      ? "Invite link detected. Review your display name and join when ready."
                      : "Invite links can be pasted directly here."
                  }
                />

                <Button
                  onClick={handleJoinSession}
                  disabled={submitting || isLoggingOut}
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  {submitting ? "Working..." : "Join Session"}
                </Button>
              </SurfaceCard>

              <SurfaceCard className="p-6">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  What happens next
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  <p>1. The session opens on the whiteboard.</p>
                  <p>2. Navigation to analytics and summary stays fast and non-blocking.</p>
                  <p>3. Invite links bring people back into the same session flow.</p>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
