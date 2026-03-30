import { WebSocket } from "ws"
import { joinSession, broadcast } from "./connectionManager"
import { publishEvent } from "../event-bus/eventBus"
import {
  getMode,
  getPersistedRole,
  hydrateSessionState,
  validateAction,
} from "../governance/governanceEngine"

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

      await hydrateSessionState(data.sessionId)
      const persistedRole = await getPersistedRole(data.sessionId, data.userId)

      if (!persistedRole) {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "User is not a participant in this session",
          }),
        )
        return
      }

      joinSession(data.userId, data.sessionId, ws)

      ws.send(
        JSON.stringify({
          type: "SESSION_STATE",
          sessionId: data.sessionId,
          role: persistedRole,
          mode: await getMode(data.sessionId),
        }),
      )

      break

    case "CANVAS_EVENT":
      if (!data.userId || !data.sessionId || !data.payload) {
        ws.send(JSON.stringify({ type: "ERROR", message: "Missing required fields" }))
        return
      }

      const allowed = await validateAction(data.sessionId, data.userId)

      if (!allowed) {
        return
      }

      void publishEvent({
        type: "CANVAS_EVENT",
        sessionId: data.sessionId,
        userId: data.userId,
        payload: data.payload,
        timestamp: Date.now(),
      })

      broadcast(data.sessionId, data)
      break
  }
}
