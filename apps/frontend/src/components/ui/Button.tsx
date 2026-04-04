"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]"
      : variant === "secondary"
        ? "border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]"
        : variant === "danger"
          ? "bg-[var(--color-danger)] text-white hover:opacity-90"
          : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-primary)]"

  const sizeClass =
    size === "sm"
      ? "px-3 py-2 text-sm"
      : size === "lg"
        ? "px-5 py-3 text-sm"
        : "px-4 py-2.5 text-sm"

  return (
    <button
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        sizeClass,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
