"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-accent)] text-white hover:opacity-90"
      : variant === "secondary"
        ? "border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
        : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"

  return (
    <button
      className={clsx(
        "rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
