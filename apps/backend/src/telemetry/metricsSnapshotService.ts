import { getMode } from "../governance/governanceEngine"
import { prisma } from "../lib/prisma"
import { getSessionMetrics } from "./telemetryEngine"

export async function createSnapshot(sessionId: string) {
  const metrics = getSessionMetrics(sessionId)
  if (!metrics) return

  // Ensure session exists in DB before writing snapshot
  await prisma.session.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId, currentMode: getMode(sessionId) }
  })

  const total = metrics.totalEdits
  const userCounts = Array.from(metrics.userEdits.values())

  const max = userCounts.length > 0 ? Math.max(...userCounts) : 0
  const dominanceRatio = total > 0 ? max / total : 0

  await prisma.metricsSnapshot.create({
    data: {
      sessionId,
      totalEdits: total,
      activeUsers: metrics.userEdits.size,
      dominanceRatio,
      mode: getMode(sessionId),
      timestamp: new Date()
    }
  })
}
