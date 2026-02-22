"use client"

import { ReactNode } from "react"
import clsx from "clsx"

type ModeType = "FREE" | "SILENT" | "DECISION" | "LOCKED"
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
    "inline-flex items-center rounded-md font-medium tracking-wide"

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  const modeStyles: Record<ModeType, string> = {
    FREE: "bg-emerald-600 text-white",
    SILENT: "bg-purple-600 text-white",
    DECISION: "bg-amber-500 text-black",
    LOCKED: "bg-red-600 text-white",
  }

  const roleStyles: Record<RoleType, string> = {
    FACILITATOR: "bg-blue-600 text-white",
    CONTRIBUTOR: "bg-indigo-600 text-white",
    OBSERVER: "bg-zinc-700 text-zinc-200",
  }

  const defaultStyle = "bg-zinc-800 text-zinc-200"

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