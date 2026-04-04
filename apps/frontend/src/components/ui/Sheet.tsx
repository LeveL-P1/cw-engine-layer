"use client"

import type { ReactNode } from "react"
import clsx from "clsx"

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  side?: "left" | "right"
  children: ReactNode
}

export function Sheet({
  open,
  onClose,
  title,
  side = "left",
  children,
}: SheetProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        className={clsx(
          "absolute top-0 h-full w-[min(88vw,22rem)] border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-panel)] backdrop-blur transition-transform",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          side === "left"
            ? open
              ? "translate-x-0"
              : "-translate-x-full"
            : open
              ? "translate-x-0"
              : "translate-x-full",
        )}
      >
        {title ? (
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              {title}
            </p>
          </div>
        ) : null}
        {children}
      </aside>
    </div>
  )
}
