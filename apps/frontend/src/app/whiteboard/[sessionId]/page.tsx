"use client"

import Whiteboard from "@/components/whiteboard/whiteboard"
import { SessionRoute } from "@/components/session/SessionRoute"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { SessionUtilityPanel } from "@/components/layout/SessionUtilityPanel"
import type { SessionRouteContext } from "@/types/session"

function WhiteboardWorkspace({ context }: { context: SessionRouteContext }) {
  return (
    <div className="relative h-full w-full">
      {context.isSessionRefreshing ? (
        <div className="absolute right-4 top-4 z-20">
          <InlineLoader label="Syncing session..." />
        </div>
      ) : null}

      <Whiteboard
        sessionId={context.sessionInfo.sessionId}
        userId={context.sessionInfo.userId}
      />
    </div>
  )
}

export default function WhiteboardSessionPage() {
  return (
    <SessionRoute
      variant="whiteboard"
      utilityPanel={<SessionUtilityPanel />}
    >
      {(context) => <WhiteboardWorkspace context={context} />}
    </SessionRoute>
  )
}
