"use client"

import { useSession } from "@/context/session-context"
import clsx from "clsx"

interface CollaborationHealthIndicatorProps {
  compact?: boolean
}

export function CollaborationHealthIndicator({
  compact = false,
}: CollaborationHealthIndicatorProps) {
  const { dominanceRatio } = useSession()

  let label = "Balanced"
  let color = "bg-emerald-500"

  if (dominanceRatio > 0.7) {
    label = "Imbalanced"
    color = "bg-red-600"
  } else if (dominanceRatio > 0.5) {
    label = "Moderate"
    color = "bg-amber-500"
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]",
        compact && "border-none bg-transparent px-0 py-0",
      )}
    >
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}
