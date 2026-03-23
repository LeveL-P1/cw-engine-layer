"use client"

import { useSession } from "@/context/session-context"
import { useTimer, formatDuration } from "@/hooks/useTimer"
import { Badge } from "@/components/ui/Badge"
import { ModeControlPanel } from "@/components/governance/ModeControlPanel"
import { CollaborationHealthIndicator } from "@/components/analytics/CollaborationHealthIndicator"
import { UserPresence } from "@/components/session/UserPresence"

export function Topbar() {
  const {
    mode,
    sessionStartTime,
    modeStartedAt,
  } = useSession()

  const sessionElapsed = useTimer(sessionStartTime)
  const modeElapsed = useTimer(modeStartedAt)

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">

      {/* need to debug or testing for 1st div */}

      <div>
        <h1 className="text-xl font-semibold">
          Session Dashboard
        </h1>
        <p className="text-xs text-zinc-400">
          Real-time governed collaboration
        </p>
      </div>

      <div className="flex items-center gap-6">

        {/* Mode Badge */}
        <Badge mode={mode}>{mode}</Badge>

        <ModeControlPanel />

        {/* Session Timer */}
        <div className="text-sm text-zinc-300">
          Session: {formatDuration(sessionElapsed)}
        </div>

        {/* Mode Duration */}
        <div className="text-xs text-zinc-500">
          Mode Duration: {formatDuration(modeElapsed)}
        </div>
      </div>

      <CollaborationHealthIndicator />

      <div className="flex items-center gap-6 text-zinc-400">
        <div className="flex items-center gap-2 text-sm">
          <UserPresence />
        </div>
      </div>

    </header>
  )
}
