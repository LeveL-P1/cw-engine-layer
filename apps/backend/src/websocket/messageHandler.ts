import { WebSocket } from "ws"
import { joinSession, broadcast } from "./connectionManager"
import { publishEvent } from "../event-bus/eventBus"
import { validateAction } from "../governance/governanceEngine"
import { assignRole } from "../governance/governanceEngine"

export async function handleMessage(ws: WebSocket, data: any) {
  switch (data.type) {


    case "JOIN_SESSION":
      joinSession(data.userId, data.sessionId, ws)

      // First user becomes facilitator
      assignRole(data.sessionId, data.userId, "FACILITATOR")

      break

    case "CANVAS_EVENT":

      const allowed = validateAction(data.sessionId, data.userId)

      if (!allowed) {
        return
      }

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
