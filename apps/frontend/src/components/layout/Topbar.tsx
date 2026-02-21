"use client"

import { Bell, Users } from "lucide-react"

export function Topbar() {
  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      
      <div>
        <h1 className="text-xl font-semibold">
          Session Dashboard
        </h1>
        <p className="text-xs text-zinc-400">
          Real-time governed collaboration
        </p>
      </div>

      <div className="flex items-center gap-6 text-zinc-400">
        <div className="flex items-center gap-2 text-sm">
          <Users size={16} />
          <span>5 Active</span>
        </div>

        <Bell size={18} />
      </div>
    </header>
  )
}