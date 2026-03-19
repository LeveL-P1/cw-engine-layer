/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendEvent } from "@/lib/websocket"

export function handleCanvasChange(update: any, sessionId: string, userId: string) {
  const { changes } = update
  const { added, updated, removed } = changes

  // Skip empty change sets (e.g. camera / selection movements)
  if (
    Object.keys(added).length === 0 &&
    Object.keys(updated).length === 0 &&
    Object.keys(removed).length === 0
  ) {
    return
  }

  sendEvent({
    type: "CANVAS_EVENT",
    sessionId,
    userId,
    payload: {
      action: "BOARD_MODIFIED",
      // added: Record<id, record>
      // updated: Record<id, [fromRecord, toRecord]>  (Tldraw tuple format)
      // removed: Record<id, record>
      changes: { added, updated, removed },
    },
  })
}
