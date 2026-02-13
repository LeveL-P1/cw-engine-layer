import { WebSocketServer, WebSocket } from "ws"
import { handleMessage } from "./messageHandler"

interface Client {
  userId: string
  sessionId: string
  socket: WebSocket
}

const sessions = new Map<string, Set<Client>>()

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (ws: WebSocket) => {

    ws.on("message", async (raw) => {
      const data = JSON.parse(raw.toString())
      await handleMessage(ws, data)
    })


    ws.on("close", () => {
      for (const [sessionId, clients] of sessions.entries()) {
        for (const client of clients) {
          if (client.socket === ws) {
            clients.delete(client)
          }
        }
        if (clients.size === 0) {
          sessions.delete(sessionId)
        }
      }
    })
  })
}

export function joinSession(userId: string, sessionId: string, socket: WebSocket) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Set())
  }

  sessions.get(sessionId)!.add({ userId, sessionId, socket })
}

export function broadcast(sessionId: string, message: any) {
  const clients = sessions.get(sessionId)
  if (!clients) return

  for (const client of clients) {
    client.socket.send(JSON.stringify(message))
  }
}
