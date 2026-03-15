import { Router } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

router.post("/", async (req, res) => {
  const { name } = req.body ?? {}

  try {
    const session = await prisma.session.create({
      data: {
        currentMode: "FREE",
      },
    })

    return res.status(201).json({
      id: session.id,
      name: name ?? null,
      currentMode: session.currentMode,
      startTime: session.startTime,
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to create session" })
  }
})

router.post("/:sessionId/join", async (req, res) => {
  const { sessionId } = req.params
  const { user } = req

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId: user.sub,
      },
    })

    return res.status(201).json({
      id: participant.id,
      sessionId: participant.sessionId,
      userId: participant.userId,
      joinedAt: participant.joinedAt,
    })
  } catch {
    return res.status(500).json({ message: "Failed to join session" })
  }
})

export default router

