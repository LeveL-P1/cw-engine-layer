"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/Button"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

interface AnalyticsChartCardProps {
  title: string
  description: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}

export function AnalyticsChartCard({
  title,
  description,
  expanded,
  onToggle,
  children,
}: AnalyticsChartCardProps) {
  return (
    <SurfaceCard className="overflow-hidden bg-[var(--color-bg-surface)]">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {title}
          </p>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
        <Button variant="secondary" onClick={onToggle}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {expanded ? (
        <div className="border-t border-[var(--color-border-soft)] px-5 pb-5 pt-4">
          {children}
        </div>
      ) : (
        <div className="border-t border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-5 py-4 text-sm text-[var(--color-text-muted)]">
          Expand this card to view the full chart.
        </div>
      )}
    </SurfaceCard>
  )
}
