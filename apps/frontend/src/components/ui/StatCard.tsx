"use client"

import { SurfaceCard } from "@/components/ui/SurfaceCard"

interface StatCardProps {
  label: string
  value: string | number
  helper?: string
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <SurfaceCard className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-3 min-w-0 break-words text-2xl font-semibold leading-tight text-[var(--color-text-primary)] md:text-3xl">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {helper}
        </p>
      ) : null}
    </SurfaceCard>
  )
}
