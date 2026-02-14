/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEvent } from "@/lib/websocket"


export function handleCanvasChange(update: any, sessionId: string, userId: string) {

  if (!update.changes) return

  for (const change of Object.values(update.changes) as any[]) {

    // Shape Created
    if (change.type === "create") {
      sendEvent({
        type: "CANVAS_EVENT",
        sessionId,
        userId,
        payload: {
          action: "SHAPE_CREATED",
          shapeId: change.id
        }
      })
    }

    // Shape Deleted
    if (change.type === "delete") {
      sendEvent({
        type: "CANVAS_EVENT",
        sessionId,
        userId,
        payload: {
          action: "SHAPE_DELETED",
          shapeId: change.id
        }
      })
    }

    // Shape Updated (Movement finalization)
    if (change.type === "update") {
      sendEvent({
        type: "CANVAS_EVENT",
        sessionId,
        userId,
        payload: {
          action: "SHAPE_UPDATED",
          shapeId: change.id
        }
      })
    }
  }
}
