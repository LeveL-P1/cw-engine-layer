let socket: WebSocket | null = null
let modeHandler: ((mode: string) => void) | null = null

export function setModeListener(handler: (mode: string) => void) {
  modeHandler = handler
}

export function connectWebSocket(sessionId: string, userId: string) {
  socket = new WebSocket("ws://localhost:4000")

  socket.onopen = () => {
    socket?.send(
      JSON.stringify({
        type: "JOIN_SESSION",
        sessionId,
        userId
      })
    )
  }
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.type === "MODE_CHANGED" && modeHandler) {
      modeHandler(data.mode)
    }
  }

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendEvent(event: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(event))
}
