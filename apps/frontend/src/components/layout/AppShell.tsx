"use client"

import { ReactNode } from "react"
import { Sidebar } from "../layout/Sidebar"
import { Topbar } from "../layout/Topbar"
import clsx from "clsx"

interface AppShellProps {
  children: ReactNode
  contentScrollable?: boolean
}

export function AppShell({
  children,
  contentScrollable = false,
}: AppShellProps) {
  return (
    <div className="h-screen w-full flex bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main
          className={clsx(
            "flex-1 bg-zinc-900 relative",
            contentScrollable ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
