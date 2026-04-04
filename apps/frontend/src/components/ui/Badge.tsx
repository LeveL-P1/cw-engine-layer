"use client"

import { ReactNode } from "react"
import clsx from "clsx"

type ModeType = "FREE" | "DECISION" | "LOCKED"
type RoleType = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"

interface BadgeProps {
  children: ReactNode
  variant?: "default"
  mode?: ModeType
  role?: RoleType
  size?: "sm" | "md"
  className?: string
}

export function Badge({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = "default",
  mode,
  role,
  size = "md",
  className,
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full font-medium tracking-wide"

  const sizeStyles = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  }

  const modeStyles: Record<ModeType, string> = {
    FREE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    DECISION: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    LOCKED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
  }

  const roleStyles: Record<RoleType, string> = {
    FACILITATOR: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
    CONTRIBUTOR: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200",
    OBSERVER: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
  }

  const defaultStyle = "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"

  return (
    <span
      className={clsx(
        base,
        sizeStyles[size],
        mode && modeStyles[mode],
        role && roleStyles[role],
        !mode && !role && defaultStyle,
        className
      )}
    >
      {children}
    </span>
  )
}
