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
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-xl border px-4 py-3 text-sm ${classes}`}
    >
      {message}
    </div>
  )
}
