"use client"

import Link from "next/link"
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        {state === "loading" ? (
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        ) : null}
        <h1 className="text-2xl font-semibold">{fallback.title}</h1>
        <p className="mt-3 text-sm text-zinc-400">{message ?? fallback.message}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-6 inline-flex rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
