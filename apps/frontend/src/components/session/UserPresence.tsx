"use client"

import { useSession } from "@/context/session-context"
import clsx from "clsx"

function getRoleColor(role: string) {
  switch (role) {
    case "FACILITATOR":
      return "bg-sky-600"
    case "CONTRIBUTOR":
      return "bg-indigo-600"
    case "OBSERVER":
      return "bg-slate-600"
    default:
      return "bg-slate-700"
  }
}

export function UserPresence() {
  const { activeUsers } = useSession()

  const visibleUsers = activeUsers.slice(0, 5)
  const overflow = activeUsers.length - visibleUsers.length

  return (
    <div className="flex items-center gap-2">
      {visibleUsers.map((user) => {
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        return (
          <div
            key={user.id}
            title={`${user.name} (${user.role})`}
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-[var(--color-bg-surface)]",
              getRoleColor(
              user.role
              ),
            )}
          >
            {initials}
          </div>
        )
      })}

      {overflow > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-muted)] ring-2 ring-[var(--color-bg-surface)]">
          +{overflow}
        </div>
      )}
    </div>
  )
}
