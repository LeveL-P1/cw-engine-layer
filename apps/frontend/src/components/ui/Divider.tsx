"use client"

import clsx from "clsx"

interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("h-px w-full bg-[var(--color-border-soft)]", className)}
    />
  )
}
