"use client"

import Link from "next/link"

interface StatePanelProps {
  title: string
  message: string
  tone?: "neutral" | "danger"
  loading?: boolean
  actionHref?: string
  actionLabel?: string
}

export function StatePanel({
  title,
  message,
  tone = "neutral",
  loading = false,
  actionHref,
  actionLabel,
}: StatePanelProps) {
  const accentClass =
    tone === "danger"
      ? "border-red-500/30 bg-red-500/10 text-[var(--color-text-primary)]"
      : "border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-canvas)] px-4 text-[var(--color-text-primary)]">
      <div
        className={`w-full max-w-md rounded-[var(--radius-panel)] border p-8 shadow-[var(--shadow-panel)] backdrop-blur ${accentClass}`}
      >
        {loading ? (
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
        ) : null}
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-6 inline-flex rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
