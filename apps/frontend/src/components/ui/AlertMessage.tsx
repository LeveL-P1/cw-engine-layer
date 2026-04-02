"use client"

interface AlertMessageProps {
  message: string
  tone?: "error" | "success"
}

export function AlertMessage({
  message,
  tone = "error",
}: AlertMessageProps) {
  const classes =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/30 bg-red-500/10 text-red-300"

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  )
}
