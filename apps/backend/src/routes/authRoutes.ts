import { Router, Request, Response } from "express"
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  generateToken
} from "../services/authService"
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest
} from "../lib/validation"
import { prisma } from "../lib/prisma"

const router = Router()

/**
 * POST /auth/register
 * Register a new user with email and password
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(registerSchema, req.body)

    if (!validation.success) {
      return res.status(400).json({ message: validation.error })
    }

    const { email, name, password } = validation.data as any

    const result = await registerUser(email, name, password, "CONTRIBUTOR")

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        emailVerified: result.emailVerified
      },
      // Note: In production, send emailVerificationToken via email
      // For development, return it here for testing
      emailVerificationToken: process.env.NODE_ENV === "development" ? result.emailVerificationToken : undefined
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Registration failed" })
  }
})

/**
 * POST /auth/login
 * Login with email and password
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(loginSchema, req.body)

    if (!validation.success) {
      return res.status(400).json({ message: validation.error })
    }

    const { email, password } = validation.data as any

    const result = await loginUser(email, password)

    return res.json({
      message: "Login successful",
      token: result.token,
      user: result.user
    })
  } catch (error: any) {
    return res.status(401).json({ message: error.message || "Login failed" })
  }
})

/**
 * POST /auth/verify-email
 * Verify email with token sent to user
 */
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(verifyEmailSchema, req.body)

    if (!validation.success) {
      return res.status(400).json({ message: validation.error })
    }

    const { token } = validation.data as any

    const result = await verifyEmail(token)

    return res.json({
      message: "Email verified successfully",
      user: result,
      redirect: "/auth/login"
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Email verification failed" })
  }
})

/**
 * POST /auth/resend-verification
 * Resend email verification token
 */
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const result = await resendVerificationEmail(email)

    return res.json({
      message: "Verification email sent",
      // Note: In production, send emailVerificationToken via email
      emailVerificationToken: process.env.NODE_ENV === "development" ? result.emailVerificationToken : undefined
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Failed to resend verification email" })
  }
})

/**
 * POST /auth/forgot-password
 * Request password reset token
 */
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(forgotPasswordSchema, req.body)

    if (!validation.success) {
      return res.status(400).json({ message: validation.error })
    }

    const { email } = validation.data as any

    const result = await requestPasswordReset(email)

    return res.json({
      message: result.message,
      // Note: In production, send token via email
      resetToken: process.env.NODE_ENV === "development" ? result.token : undefined
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Password reset request failed" })
  }
})

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(resetPasswordSchema, req.body)

    if (!validation.success) {
      return res.status(400).json({ message: validation.error })
    }

    const { token, newPassword } = validation.data as any

    const result = await resetPassword(token, newPassword)

    return res.json({
      message: result.message,
      email: result.email,
      redirect: "/auth/login"
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Password reset failed" })
  }
})

/**
 * POST /auth/logout
 * Logout (invalidate token on client side)
 * Note: JWTs are stateless, so logout is just a client-side action
 */
router.post("/logout", (req: Request, res: Response) => {
  // In a real app, you might blacklist the token in Redis
  return res.json({ message: "Logged out successfully" })
})

/**
 * POST /auth/refresh
 * Refresh JWT token (optional for extended sessions)
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    // This endpoint expects the user to be authenticated (middleware)
    const user = (req as any).user

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Get fresh user data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub }
    })

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate new token
    const token = generateToken({
      sub: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    })

    return res.json({
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role
      }
    })
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Token refresh failed" })
  }
})

/**
 * POST /auth/dev-login (DEVELOPMENT ONLY)
 * Quick login for testing without email verification
 * Remove in production!
 */
if (process.env.NODE_ENV === "development") {
  router.post("/dev-login", async (req: Request, res: Response) => {
    try {
      const { name, role, email } = req.body

      if (!name || !role) {
        return res.status(400).json({ message: "name and role are required" })
      }

      const uniqueEmail = email || `dev-${Date.now()}@test.local`

      const user = await prisma.user.create({
        data: {
          name,
          role,
          email: uniqueEmail,
          emailVerified: true
        }
      })

      const token = generateToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      })

      return res.json({
        message: "Dev login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Dev login failed" })
    }
  })
}

export default router


