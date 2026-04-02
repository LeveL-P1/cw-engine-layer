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
        "rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  )
}
