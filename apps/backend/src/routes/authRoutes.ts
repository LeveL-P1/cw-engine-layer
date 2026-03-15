import { Router } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"

const router = Router()

router.post("/dev-login", async (req, res) => {
  const { name, role } = req.body ?? {}

  if (!name || !role) {
    return res.status(400).json({ message: "name and role are required" })
  }

  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ message: "JWT secret not configured" })
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        role,
      },
    })

    const token = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        role: user.role,
      },
      secret,
      { expiresIn: "12h" },
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return res.status(500).json({ message: "Failed to create user" })
  }
})

export default router

