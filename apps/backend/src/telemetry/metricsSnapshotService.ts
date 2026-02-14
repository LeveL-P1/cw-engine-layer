import { prisma } from "../lib/prisma"
import { getSessionMetrics } from "./telemetryEngine"

export async function createSnapshot(sessionId: string) {
  const metrics = getSessionMetrics(sessionId)
  if (!metrics) {
    console.log("No metrics for session:", sessionId)
    return
  }

  const total = metrics.totalEdits
  const userCounts = Array.from(metrics.userEdits.values())
  const max = userCounts.length ? Math.max(...userCounts) : 0
  const dominanceRatio = total > 0 ? max / total : 0

  console.log("Saving snapshot:", {
    sessionId,
    total,
    dominanceRatio
  })

  await prisma.metricsSnapshot.create({
    data: {
      sessionId,
      totalEdits: total,
      activeUsers: metrics.userEdits.size,
      dominanceRatio,
      mode: "FREE"
    }
  })
}
