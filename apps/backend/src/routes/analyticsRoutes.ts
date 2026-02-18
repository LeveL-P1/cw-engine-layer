import { Router } from "express"
import { prisma } from "../lib/prisma"
import { getSessionMetrics } from "../telemetry/telemetryEngine"

const router = Router()

router.get("/metrics/:sessionId", async (req, res) => {
  const { sessionId } = req.params

  // Try DB snapshot first
  const latestSnapshot = await prisma.metricsSnapshot.findFirst({
    where: { sessionId },
    orderBy: { timestamp: "desc" }
  })

  if (latestSnapshot) {
    return res.json({
      source: "snapshot",
      data: latestSnapshot
    })
  }

  // Fallback to live in-memory metrics
  const liveMetrics = getSessionMetrics(sessionId)

  if (!liveMetrics) {
    return res.status(404).json({ message: "No metrics found" })
  }

  const total = liveMetrics.totalEdits
  const userEntries = Array.from(liveMetrics.userEdits.entries())

  const max = userEntries.length
    ? Math.max(...userEntries.map(([_, count]) => count))
    : 0

  const dominanceRatio = total > 0 ? max / total : 0

  return res.json({
    source: "live",
    data: {
      totalEdits: total,
      activeUsers: liveMetrics.userEdits.size,
      dominanceRatio,
      perUser: userEntries.map(([userId, count]) => ({
        userId,
        edits: count
      }))
    }
  })
})

export default router
