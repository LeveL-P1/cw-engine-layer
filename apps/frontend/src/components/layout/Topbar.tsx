"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/context/session-context"
import { useAuth } from "@/context/auth-context"
import { useTimer, formatDuration } from "@/hooks/useTimer"
import { Badge } from "@/components/ui/Badge"
import { ModeControlPanel } from "@/components/governance/ModeControlPanel"
import { CollaborationHealthIndicator } from "@/components/analytics/CollaborationHealthIndicator"
import { UserPresence } from "@/components/session/UserPresence"

export function Topbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const {
    sessionId,
    sessionName,
    mode,
    sessionStartTime,
    modeStartedAt,
  } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const sessionElapsed = useTimer(sessionStartTime)
  const modeElapsed = useTimer(modeStartedAt)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.replace("/auth")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/sessions?sessionId=${sessionId}`

    await navigator.clipboard.writeText(inviteUrl)
    setInviteCopied(true)
    window.setTimeout(() => setInviteCopied(false), 2000)
  }

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {sessionName}
        </h1>
        <p className="text-xs text-zinc-400">
          Real-time governed collaboration
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Badge mode={mode}>{mode}</Badge>

        <ModeControlPanel />

        <button
          type="button"
          onClick={handleCopyInvite}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
        >
          {inviteCopied ? "Invite copied" : "Copy Invite"}
        </button>

        <div className="text-sm text-zinc-300">
          Session: {formatDuration(sessionElapsed)}
        </div>

        <div className="text-xs text-zinc-500">
          Mode Duration: {formatDuration(modeElapsed)}
        </div>
      </div>

      <CollaborationHealthIndicator />

      <div className="flex items-center gap-4 text-zinc-400">
        <div className="text-right">
          <p className="text-sm text-zinc-200">{user?.name ?? "Signed in user"}</p>
          <p className="text-xs text-zinc-500">{user?.email ?? ""}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <UserPresence />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  )
}
