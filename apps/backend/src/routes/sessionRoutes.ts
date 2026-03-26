import { Router, type Request } from "express"
import { prisma } from "../lib/prisma"

const router = Router()

type JoinRequest = Request<
  { sessionId: string },
  unknown,
  {
    userId?: string
    email?: string
    name?: string
    role?: string
  }
> & {
  user?: {
    sub: string
    email?: string
  }
}

router.post("/", async (req, res) => {
  const { name } = req.body ?? {}

  try {
    const session = await prisma.session.create({
      data: {
        name: typeof name === "string" && name.trim().length > 0 ? name.trim() : null,
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
  const request = req as JoinRequest
  const { sessionId } = req.params
  const { user } = request

  const { userId, email, name, role } = request.body ?? {}

  const effectiveUserId = user?.sub ?? userId
  const effectiveEmail = user?.email ?? email

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

    if (!name || !role || !effectiveEmail) {
      return res.status(400).json({
        message: "email, name, and role are required",
      })
    }

    await prisma.user.upsert({
      where: { id: effectiveUserId },
      update: {
        email: effectiveEmail,
        name,
        role,
      },
      create: {
        id: effectiveUserId,
        email: effectiveEmail,
        name,
        role,
      },
    })

    const participant = await prisma.sessionParticipant.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId: effectiveUserId,
        },
      },
      update: {
        role,
      },
      create: {
        sessionId,
        userId: effectiveUserId,
        role,
      },
    })

    return res.status(201).json({
      id: participant.id,
      sessionId: participant.sessionId,
      userId: participant.userId,
      role: participant.role,
      joinedAt: participant.joinedAt,
    })
  } catch {
    return res.status(500).json({ message: "Failed to join session" })
  }
})

export default router

