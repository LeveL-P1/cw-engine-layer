"use client"

import type { ReactNode } from "react"
import clsx from "clsx"
import { SurfaceCard } from "@/components/ui/SurfaceCard"

interface SectionCardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <SurfaceCard className={clsx("overflow-hidden p-5", className)}>
      {title || description || action ? (
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </SurfaceCard>
  )
}
