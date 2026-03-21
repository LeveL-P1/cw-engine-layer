import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h'

export interface JwtPayload {
  sub: string  // user id
  email: string
  name: string
  role: string
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

/**
 * Generate email verification token
 */
export function generateEmailToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
  return { token, expiresAt }
}

/**
 * Register a new user with email and password
 */
export async function registerUser(email: string, name: string, password: string, role: string = 'CONTRIBUTOR') {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const password_hash = await hashPassword(password)
  const emailVerificationToken = generateEmailToken()

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password_hash,
      role,
      emailVerificationToken
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    emailVerificationToken // Return for email sending
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (!user.password_hash) {
    throw new Error('User account not set up for email/password login')
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash)

  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in')
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  // Generate JWT token
  const token = generateToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  })

  if (!user) {
    throw new Error('Invalid verification token')
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null
    }
  })

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    emailVerified: updatedUser.emailVerified
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    // Return success even if user doesn't exist (security best practice)
    return { message: 'If user exists, password reset email will be sent' }
  }

  const { token, expiresAt } = generatePasswordResetToken()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpires: expiresAt
    }
  })

  return {
    message: 'Password reset token generated',
    token, // Return for testing, don't do this in production
    email: user.email
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token }
  })

  if (!user) {
    throw new Error('Invalid password reset token')
  }

  if (!user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
    throw new Error('Password reset token has expired')
  }

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const password_hash = await hashPassword(newPassword)

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash,
      passwordResetToken: null,
      passwordResetTokenExpires: null
    }
  })

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    message: 'Password reset successfully'
  }
}

/**
 * Resend email verification token
 */
export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.emailVerified) {
    throw new Error('Email is already verified')
  }

  const emailVerificationToken = generateEmailToken()

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerificationToken }
  })

  return {
    email: user.email,
    emailVerificationToken // Return for email sending
  }
}
