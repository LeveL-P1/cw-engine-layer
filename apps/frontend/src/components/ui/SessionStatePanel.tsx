"use client"

import { StatePanel } from "@/components/ui/StatePanel"
import type { SessionUIState } from "@/types/session"

const defaults: Record<SessionUIState, { title: string; message: string }> = {
  loading: {
    title: "Loading session",
    message: "Preparing your session context...",
  },
  ready: {
    title: "Session ready",
    message: "",
  },
  empty: {
    title: "No data yet",
    message: "Start collaborating and data will appear here.",
  },
  unauthorized: {
    title: "Access denied",
    message: "You no longer have access to this session. Please sign in again.",
  },
  error: {
    title: "Something went wrong",
    message: "We could not load this session right now. Please retry from the lobby.",
  },
}

interface SessionStatePanelProps {
  state: SessionUIState
  message?: string
  actionHref?: string
  actionLabel?: string
}

export function SessionStatePanel({
  state,
  message,
  actionHref,
  actionLabel,
}: SessionStatePanelProps) {
  const fallback = defaults[state]
  const tone = state === "error" || state === "unauthorized" ? "danger" : "neutral"

  return (
    <StatePanel
      title={fallback.title}
      message={message ?? fallback.message}
      tone={tone}
      loading={state === "loading"}
      actionHref={actionHref}
      actionLabel={actionLabel}
    />
  )
}
