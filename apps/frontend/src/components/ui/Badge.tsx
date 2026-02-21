"use client"

import { ReactNode } from "react"
import clsx from "clsx"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "role" | "mode" | "danger"
  size?: "sm" | "md"
  className?: string
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-md font-medium tracking-wide"

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  const variantStyles = {
    default: "bg-zinc-800 text-zinc-200",
    role: "bg-blue-600 text-white",
    mode: "bg-emerald-600 text-white",
    danger: "bg-red-600 text-white",
  }

  return (
    <span
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}