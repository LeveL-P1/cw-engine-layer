import { WebSocket } from "ws"
import { joinSession, broadcast } from "./connectionManager"
import { publishEvent } from "../event-bus/eventBus"

export function handleMessage(ws: WebSocket, data: any) {

  switch (data.type) {

    case "JOIN_SESSION":
      joinSession(data.userId, data.sessionId, ws)
      break

    case "CANVAS_EVENT":
      publishEvent(data)
      broadcast(data.sessionId, data)
      break

    default:
      console.log("Unknown message type:", data.type)
  }
}
