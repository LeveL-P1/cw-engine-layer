/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEvent } from "@/lib/websocket"

export function handleCanvasChange(update: any, sessionId: string, userId: string) {
  const event = {
    type: "CANVAS_EVENT",
    sessionId,
    userId,
    payload: update
  }

  sendEvent(event)
}
