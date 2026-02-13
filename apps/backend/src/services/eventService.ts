import { SystemEvent } from "../event-bus/eventBus"
import { prisma } from "../lib/prisma"


export async function persistEvent(event: SystemEvent) {

  // Ensure session exists
  await prisma.session.upsert({
    where: { id: event.sessionId },
    update: {},
    create: {
      id: event.sessionId,
      currentMode: "FREE"
    }
  })

  await prisma.eventLog.create({
    data: {
      sessionId: event.sessionId,
      userId: event.userId,
      eventType: event.type,
      payload: event.payload,
      timestamp: new Date(event.timestamp)
    }
  })
}
