import { WebSocket } from "ws"
import { joinSession, broadcast } from "./connectionManager"
import { publishEvent } from "../event-bus/eventBus"
import { validateAction } from "../governance/governanceEngine"
import { assignRole, hasFacilitator } from "../governance/governanceEngine"

export async function handleMessage(ws: WebSocket, data: any) {
  if (!data || !data.type) {
    ws.send(JSON.stringify({ type: "ERROR", message: "Missing 'type' field" }))
    return
  }

  switch (data.type) {

    case "JOIN_SESSION":
      if (!data.userId || !data.sessionId) {
        ws.send(JSON.stringify({ type: "ERROR", message: "Missing userId or sessionId" }))
        return
      }

      joinSession(data.userId, data.sessionId, ws)

      // First user becomes facilitator, others become contributors
      if (!hasFacilitator(data.sessionId)) {
        assignRole(data.sessionId, data.userId, "FACILITATOR")
      } else {
        assignRole(data.sessionId, data.userId, "CONTRIBUTOR")
      }

      break

    case "CANVAS_EVENT":
      if (!data.userId || !data.sessionId || !data.payload) {
        ws.send(JSON.stringify({ type: "ERROR", message: "Missing required fields" }))
        return
      }

      const allowed = validateAction(data.sessionId, data.userId)

      if (!allowed) {
        return
      }

      await publishEvent({
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
