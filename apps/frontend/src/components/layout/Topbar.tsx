"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useSession } from "@/context/session-context"
import { formatDuration, useTimer } from "@/hooks/useTimer"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { InlineLoader } from "@/components/ui/InlineLoader"
import { UserPresence } from "@/components/session/UserPresence"

interface TopbarProps {
  variant: "whiteboard" | "insights"
  headerActions?: ReactNode
  hasUtilityPanel: boolean
  isSessionRefreshing: boolean
  sidebarCollapsed: boolean
  onDesktopSidebarToggle: () => void
  onMobileSidebarOpen: () => void
  onUtilityOpen: () => void
}

export function Topbar({
  variant,
  headerActions,
  hasUtilityPanel,
  isSessionRefreshing,
  sidebarCollapsed,
  onDesktopSidebarToggle,
  onMobileSidebarOpen,
  onUtilityOpen,
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
    <header className="border-b border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/95 px-3 py-3 backdrop-blur sm:px-4 lg:px-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMobileSidebarOpen}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDesktopSidebarToggle}
              className="hidden lg:inline-flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[var(--color-text-primary)]">
                {sessionName}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {pageDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge mode={mode}>{mode}</Badge>
            <div className="hidden sm:block">
              <UserPresence />
            </div>
            {headerActions}
            {hasUtilityPanel ? (
              <Button type="button" variant="secondary" size="sm" onClick={onUtilityOpen} className="xl:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Controls
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
          <div className="flex flex-wrap items-center gap-3">
            <span>Session time {formatDuration(sessionElapsed)}</span>
            <span className="hidden sm:inline">
              Signed in as {user?.name ?? "Session member"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="sm:hidden">
              <UserPresence />
            </div>
            {isSessionRefreshing ? <InlineLoader label="Syncing session..." /> : null}
          </div>
        </div>
      </div>
    </header>
  )
}
