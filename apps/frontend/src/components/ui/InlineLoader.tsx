"use client"

interface InlineLoaderProps {
  label: string
}

export function InlineLoader({ label }: InlineLoaderProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)] shadow-sm">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      <span>{label}</span>
    </div>
  )
}
