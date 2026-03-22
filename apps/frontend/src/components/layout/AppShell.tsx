"use client"

import { ReactNode } from "react"
import { Sidebar } from "../layout/Sidebar"
import { Topbar } from "../layout/Topbar"
import { ModeControlPanel } from "../governance/ModeControlPanel"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen w-full flex bg-zinc-950 text-zinc-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-hidden bg-zinc-900 relative">
          {children}
        </main>
      </div>

      <aside className="w-64 bg-zinc-900 border-l border-zinc-800 p-6">
        <ModeControlPanel />
      </aside>
    </div>
  )
}