"use client"

import { useSession } from "@/context/session-context"

export function CollaborationHealthIndicator() {
  const { dominanceRatio } = useSession()

  let label = "Balanced"
  let color = "bg-emerald-600"

  if (dominanceRatio > 0.7) {
    label = "Imbalanced"
    color = "bg-red-600"
  } else if (dominanceRatio > 0.5) {
    label = "Moderate"
    color = "bg-amber-500"
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-zinc-300">{label}</span>
    </div>
  )
}