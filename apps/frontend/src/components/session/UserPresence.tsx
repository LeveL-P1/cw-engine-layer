"use client"

import { useSession } from "@/context/session-context"

function getRoleColor(role: string) {
  switch (role) {
    case "FACILITATOR":
      return "bg-blue-600"
    case "CONTRIBUTOR":
      return "bg-indigo-600"
    case "OBSERVER":
      return "bg-zinc-600"
    default:
      return "bg-zinc-700"
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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${getRoleColor(
              user.role
            )}`}
          >
            {initials}
          </div>
        )
      })}

      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs">
          +{overflow}
        </div>
      )}
    </div>
  )
}