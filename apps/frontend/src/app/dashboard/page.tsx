"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { getStoredSession } from "@/lib/session-storage"

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const storedSession = getStoredSession()
    if (!storedSession) {
      router.replace("/sessions")
      return
    }

    router.replace(`/dashboard/${storedSession.sessionId}`)
  }, [router])

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        Redirecting to dashboard...
      </div>
    </ProtectedRoute>
  )
}
