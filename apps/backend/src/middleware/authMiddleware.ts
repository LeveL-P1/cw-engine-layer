import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

type JwtPayload = {
  sub: string
  name: string
  role: string
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" })
  }

  const token = header.slice("Bearer ".length).trim()

  try {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" })
    }

    const decoded = jwt.verify(token, secret) as JwtPayload

    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

