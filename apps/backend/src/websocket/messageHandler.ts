import { WebSocket } from "ws"
import { joinSession, broadcast } from "./connectionManager"
import { publishEvent } from "../event-bus/eventBus"

export async function handleMessage(ws: WebSocket, data: any) {
  switch (data.type) {

    case "JOIN_SESSION":
      joinSession(data.userId, data.sessionId, ws)
      break

    case "CANVAS_EVENT":
      publishEvent({
        type: "CANVAS_EVENT",
        sessionId: data.sessionId,
        userId: data.userId,
        payload: data.payload,
        timestamp: Date.now()
      })

      broadcast(data.sessionId, data)
      break
  }
}
