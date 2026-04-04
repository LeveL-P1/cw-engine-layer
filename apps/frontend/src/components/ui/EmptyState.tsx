"use client"

import type { ReactNode } from "react"
import clsx from "clsx"

interface EmptyStateProps {
  title: string
  message: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-panel)] border border-dashed border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-6 text-[var(--color-text-primary)]",
        className,
      )}
    >
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
