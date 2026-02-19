import { Router } from "express"
import { prisma } from "../lib/prisma"
import { getSessionMetrics } from "../telemetry/telemetryEngine"
import { setMode, getMode } from "../governance/governanceEngine"
import { broadcast } from "../websocket/connectionManager"

const router = Router()

router.get("/metrics/:sessionId", async (req, res) => {
  const { sessionId } = req.params

  // Try DB snapshot first
  const latestSnapshot = await prisma.metricsSnapshot.findFirst({
    where: { sessionId },
    orderBy: { timestamp: "desc" }
  })

  if (latestSnapshot) {
    const liveMetrics = getSessionMetrics(sessionId)

    const perUser = liveMetrics
      ? Array.from(liveMetrics.userEdits.entries()).map(
        ([userId, count]) => ({
          userId,
          edits: count
        })
      )
      : []

    return res.json({
      source: "snapshot",
      data: {
        ...latestSnapshot,
        perUser
      }
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

router.get("/mode/:sessionId", (req, res) => {
  const { sessionId } = req.params
  const mode = getMode(sessionId)
  res.json({ mode })
})


router.post("/mode/:sessionId", (req, res) => {
  const { sessionId } = req.params
  const { mode } = req.body

  if (!["FREE", "LOCKED"].includes(mode)) {
    return res.status(400).json({ message: "Invalid mode" })
  }

  setMode(sessionId, mode)

  broadcast(sessionId, {
    type: "MODE_CHANGED",
    sessionId,
    mode
  })

  res.json({ message: "Mode updated", mode })
})


export default router
