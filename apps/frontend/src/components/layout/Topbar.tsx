"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Menu } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useSession } from "@/context/session-context"
import { formatDuration, useTimer } from "@/hooks/useTimer"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { UserPresence } from "@/components/session/UserPresence"
import { ModeDropdown } from "@/components/governance/ModeDropdown"

interface TopbarProps {
  variant: "whiteboard" | "insights"
  headerActions?: ReactNode
  isSessionRefreshing: boolean
  onMobileSidebarOpen: () => void
}

export function Topbar({
  variant,
  headerActions,
  isSessionRefreshing,
  onMobileSidebarOpen,
}: TopbarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { sessionName, mode, sessionStartTime } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const sessionElapsed = useTimer(sessionStartTime)
  const pageDescription =
    variant === "whiteboard"
      ? "Live whiteboard workspace"
      : "Session insights and wrap-up"

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.replace("/auth")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="relative border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/95 px-3 py-2 backdrop-blur sm:px-4">
      {isSessionRefreshing ? (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2">
          <InlineLoader label="Syncing session..." />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMobileSidebarOpen}
            aria-label="Open session navigation"
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--color-text-primary)]">
              {sessionName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
              <span>{pageDescription}</span>
              <span>Session {formatDuration(sessionElapsed)}</span>
              <span>Signed in as {user?.name ?? "Session member"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge mode={mode} size="sm">
            {mode}
          </Badge>
          <ModeDropdown />
          <div className="hidden sm:block">
            <UserPresence />
          </div>
          {headerActions}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "..." : "Logout"}
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
        <UserPresence />
      </div>
    </header>
  )
}
