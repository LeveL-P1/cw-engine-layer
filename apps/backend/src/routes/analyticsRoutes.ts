import { Router } from "express"
import { prisma } from "../lib/prisma"
import { getSessionMetrics } from "../telemetry/telemetryEngine"

const router = Router()

router.get("/metrics/:sessionId", async (req, res) => {
  const { sessionId } = req.params

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
  const userCounts = Array.from(liveMetrics.userEdits.values())
  const max = userCounts.length ? Math.max(...userCounts) : 0
  const dominanceRatio = total > 0 ? max / total : 0

  return res.json({
    source: "live",
    data: {
      totalEdits: total,
      activeUsers: liveMetrics.userEdits.size,
      dominanceRatio
    }
  })
})

export default router
