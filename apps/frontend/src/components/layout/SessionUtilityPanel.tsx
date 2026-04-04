"use client"

import { ShieldCheck, Share2, Timer, Users } from "lucide-react"
import { useState } from "react"
import { useSession } from "@/context/session-context"
import { formatDuration, useTimer } from "@/hooks/useTimer"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

export function SessionUtilityPanel() {
  const { role, mode, sessionId, activeUsers, sessionStartTime } = useSession()
  const [inviteCopied, setInviteCopied] = useState(false)
  const sessionElapsed = useTimer(sessionStartTime)

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/sessions?sessionId=${sessionId}`
    await navigator.clipboard.writeText(inviteUrl)
    setInviteCopied(true)
    window.setTimeout(() => setInviteCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <SurfaceCard className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Session Controls
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Governance stays nearby without taking over the workspace.
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge role={role}>{role}</Badge>
          <Badge mode={mode}>{mode}</Badge>
        </div>

        <Divider className="my-4" />

        <div className="space-y-3">
          <Button type="button" fullWidth onClick={handleCopyInvite}>
            <Share2 className="h-4 w-4" />
            {inviteCopied ? "Invite Copied" : "Copy Invite Link"}
          </Button>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          Session Snapshot
        </p>
        <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--color-accent)]" />
              Active people
            </span>
            <span>{activeUsers.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <Timer className="h-4 w-4 text-[var(--color-accent)]" />
              Session time
            </span>
            <span>{formatDuration(sessionElapsed)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" />
              Active mode
            </span>
            <Badge mode={mode} size="sm">
              {mode}
            </Badge>
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}
