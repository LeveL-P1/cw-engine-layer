"use client"

import { Badge } from "@/components/ui/Badge"

export function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between">
      
      <div>
        <h2 className="text-lg font-semibold mb-6">
          Governed Whiteboard
        </h2>

        {/* Session Info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-400">Session</p>
            <p className="font-medium">Design Sprint</p>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Your Role</p>
            <Badge className="mt-1 bg-blue-600">FACILITATOR</Badge>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Current Mode</p>
            <Badge className="mt-1 bg-emerald-600">FREE</Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-10 space-y-3">
          <a href="/whiteboard" className="block text-sm hover:text-white text-zinc-400">
            Whiteboard
          </a>
          <a href="/dashboard" className="block text-sm hover:text-white text-zinc-400">
            Analytics
          </a>
          <a href="/summary" className="block text-sm hover:text-white text-zinc-400">
            Session Summary
          </a>
        </nav>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-500">
        Structured Collaboration System
      </div>
    </aside>
  )
}