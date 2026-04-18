"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import clsx from "clsx"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { Sheet } from "@/components/ui/Sheet"

interface AppShellProps {
  children: ReactNode
  contentScrollable?: boolean
  variant?: "whiteboard" | "insights"
  headerActions?: ReactNode
  isSessionRefreshing?: boolean
}

const SIDEBAR_STORAGE_KEY = "cw-engine.sidebar-collapsed"

export function AppShell({
  children,
  contentScrollable = false,
  variant = "insights",
  headerActions,
  isSessionRefreshing = false,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
    } catch {
      return false
    }
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
    } catch {
      // Ignore storage errors.
    }
  }, [sidebarCollapsed])

  return (
    <div className="flex h-screen w-full bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} />
      </div>

      <Sheet
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        title="Session Navigation"
      >
        <Sidebar collapsed={false} isMobile onNavigate={() => setMobileSidebarOpen(false)} />
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          variant={variant}
          headerActions={headerActions}
          isSessionRefreshing={isSessionRefreshing}
          onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
        />

        <div className="flex min-h-0 flex-1">
          <main
            className={clsx(
              "min-w-0 flex-1",
              variant === "whiteboard"
                ? "bg-[var(--color-bg-canvas)]"
                : "bg-[linear-gradient(180deg,rgba(12,12,20,0.88)_0%,rgba(6,6,12,0.96)_100%)]",
              contentScrollable ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
