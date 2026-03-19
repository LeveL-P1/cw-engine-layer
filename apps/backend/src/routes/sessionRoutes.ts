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

  const { userId, name, role } = req.body ?? {}

  const effectiveUserId = user?.sub ?? userId

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (!effectiveUserId) {
      return res.status(400).json({ message: "userId is required" })
    }

    if (!user && (!name || !role)) {
      return res.status(400).json({ message: "name and role are required" })
    }

    if (!user) {
      await prisma.user.upsert({
        where: { id: effectiveUserId },
        update: {
          name,
          role,
        },
        create: {
          id: effectiveUserId,
          name,
          role,
        },
      })
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId: effectiveUserId,
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

