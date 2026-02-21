"use client"

import { ReactNode } from "react"
import { Sidebar } from "../layout/Sidebar"
import { Topbar } from "../layout/Topbar"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen w-full flex bg-zinc-950 text-zinc-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Topbar */}
        <Topbar />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  )
}