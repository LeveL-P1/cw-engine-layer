"use client"

import type { InputHTMLAttributes } from "react"
import clsx from "clsx"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

export function Input({ label, helperText, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={clsx(
          "w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-accent)_25%,transparent)]",
          className,
        )}
        {...props}
      />
      {helperText ? (
        <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
      ) : null}
    </div>
  )
}
