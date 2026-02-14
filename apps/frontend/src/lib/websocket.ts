let socket: WebSocket | null = null

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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendEvent(event: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(event))
}
