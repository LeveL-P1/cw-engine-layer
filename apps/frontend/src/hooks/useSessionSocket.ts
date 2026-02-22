"use client"

import { useEffect } from "react"
import { useSession, ModeType } from "@/context/session-context"

export function useSessionSocket() {
  const { sessionId, setMode } = useSession()

  useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:3001/ws?sessionId=${sessionId}`
    )

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "MODE_CHANGED") {
        setMode(data.mode as ModeType)
      }
    }

    socket.onerror = () => {
      console.error("WebSocket error")
    }

    return () => {
      socket.close()
    }
  }, [sessionId, setMode])
}