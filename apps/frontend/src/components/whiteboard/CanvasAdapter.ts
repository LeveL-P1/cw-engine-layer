/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEvent } from "@/lib/websocket"

export function handleCanvasChange(update: any, sessionId: string, userId: string) {

  // For now emit one semantic event per change batch
  sendEvent({
    type: "CANVAS_EVENT",
    sessionId,
    userId,
    payload: {
      action: "BOARD_MODIFIED"
    }
  })
}
