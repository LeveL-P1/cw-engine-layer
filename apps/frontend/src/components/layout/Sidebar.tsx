"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import {
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  PenTool,
} from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { useSession } from "@/context/session-context"

interface SidebarProps {
  collapsed?: boolean
  isMobile?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

export function Sidebar({
  collapsed = false,
  isMobile = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname()
  const { sessionId, sessionName, role, mode } = useSession()

  const navItems = [
    {
      label: "Whiteboard",
      shortLabel: "Board",
      href: `/whiteboard/${sessionId}`,
      icon: PenTool,
    },
    {
      label: "Analytics",
      shortLabel: "Stats",
      href: `/dashboard/${sessionId}`,
      icon: BarChart3,
    },
    {
      label: "Summary",
      shortLabel: "Wrap",
      href: `/summary/${sessionId}`,
      icon: FileText,
    },
  ]

  return (
    <aside
      className={clsx(
        "flex h-full flex-col border-r border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]/95 px-2.5 py-3 backdrop-blur",
        collapsed && !isMobile ? "w-[4.75rem]" : "w-56",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={clsx("min-w-0", collapsed && !isMobile && "sr-only")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            CW-Engine
          </p>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[var(--color-text-muted)]">
            {sessionName}
          </p>
        </div>

        {!isMobile && onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="shrink-0"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge role={role} size="sm">
          {collapsed && !isMobile ? role[0] : role}
        </Badge>
        <Badge mode={mode} size="sm">
          {collapsed && !isMobile ? mode[0] : mode}
        </Badge>
      </div>

      <Divider className="my-5" />

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={clsx(collapsed && !isMobile && "sr-only")}>
                {item.label}
              </span>
              {collapsed && !isMobile ? (
                <span className="sr-only">{item.shortLabel}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
