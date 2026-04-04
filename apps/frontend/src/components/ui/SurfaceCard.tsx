"use client"

import type { ReactNode } from "react"
import clsx from "clsx"

interface SurfaceCardProps {
  children: ReactNode
  className?: string
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-panel)] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-soft)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  )
}
