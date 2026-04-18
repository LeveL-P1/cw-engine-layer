/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAccessToken } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"

let socket: WebSocket | null = null
let modeHandler: ((mode: string) => void) | null = null
let canvasEventHandler: ((payload: any) => void) | null = null
let connectedSessionId: string | null = null
let connectedUserId: string | null = null

export function setModeListener(handler: (mode: string) => void) {
  modeHandler = handler
}

export function setCanvasEventHandler(handler: ((payload: any) => void) | null) {
  canvasEventHandler = handler
}

export function connectWebSocket(sessionId: string, userId: string) {
  const sameConnection =
    connectedSessionId === sessionId && connectedUserId === userId

  if (!sameConnection && socket) {
    socket.close()
    socket = null
  }

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  socket = new WebSocket(publicEnv.apiWsUrl)
  connectedSessionId = sessionId
  connectedUserId = userId

  socket.onopen = () => {
    void getAccessToken()
      .then((token) => {
        if (!token) {
          socket?.close()
          return
        }

        socket?.send(JSON.stringify({ type: "JOIN_SESSION", sessionId, token }))
      })
      .catch(() => {
        socket?.close()
      })
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      if ((data.type === "MODE_CHANGED" || data.type === "SESSION_STATE") && modeHandler) {
        modeHandler(data.mode)
      }

      if (data.type === "CANVAS_EVENT" && canvasEventHandler) {
        canvasEventHandler(data.payload)
      }
    } catch {
      // Ignore malformed messages.
    }
  }

  socket.onclose = () => {
    socket = null
    connectedSessionId = null
    connectedUserId = null
  }
}

export function sendEvent(event: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return
  }

  socket.send(JSON.stringify(event))
}
