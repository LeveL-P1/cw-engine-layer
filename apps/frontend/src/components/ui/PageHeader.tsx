"use client"

import type { ReactNode } from "react"
import clsx from "clsx"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-muted)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
