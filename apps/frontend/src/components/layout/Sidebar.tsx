"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { Badge } from "@/components/ui/Badge"
import { useSession } from "@/context/session-context"

export function Sidebar() {
  const pathname = usePathname()
  const { sessionId, sessionName, role, mode } = useSession()

  const navItems = [
    { label: "Whiteboard", href: `/whiteboard/${sessionId}` },
    { label: "Analytics", href: `/dashboard/${sessionId}` },
    { label: "Session Summary", href: `/summary/${sessionId}` },
  ]

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-6">
          Governed Whiteboard
        </h2>
        <p className="font-medium">{sessionName}</p>

        <Badge role={role}>{role}</Badge>

        <Badge mode={mode}>{mode}</Badge>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="text-xs text-zinc-500">
        Structured Collaboration System
      </div>
    </aside>
  )
}
