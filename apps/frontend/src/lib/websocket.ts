/* eslint-disable @typescript-eslint/no-explicit-any */
let socket: WebSocket | null = null
let modeHandler: ((mode: string) => void) | null = null
let canvasEventHandler: ((payload: any) => void) | null = null
const WS_URL = process.env.NEXT_PUBLIC_API_WS_URL ?? "ws://localhost:4000"

export function setModeListener(handler: (mode: string) => void) {
  modeHandler = handler
}

/**
 * Register a handler for incoming CANVAS_EVENT messages from remote peers.
 * Pass null to unregister (e.g. on component unmount).
 */
export function setCanvasEventHandler(handler: ((payload: any) => void) | null) {
  canvasEventHandler = handler
}

export function connectWebSocket(sessionId: string, userId: string) {
  // Prevent duplicate connections — reuse if already open or connecting
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    socket?.send(
      JSON.stringify({ type: "JOIN_SESSION", sessionId, userId }),
    )
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === "MODE_CHANGED" && modeHandler) {
        modeHandler(data.mode)
      }

      // Forward canvas events from other users to the registered handler
      if (data.type === "CANVAS_EVENT" && canvasEventHandler) {
        canvasEventHandler(data.payload)
      }
    } catch {
      // ignore malformed messages
    }
  }

  socket.onclose = () => {
    // Clear the ref so the next connectWebSocket call creates a fresh socket
    socket = null
  }
}

export function sendEvent(event: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(event))
}
