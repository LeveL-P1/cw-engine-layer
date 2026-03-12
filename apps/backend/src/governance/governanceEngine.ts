import { prisma } from "../lib/prisma"

export type Role = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"
export type Mode = "FREE" | "LOCKED" | "DECISION"

type SessionState = {
  mode: Mode
  roles: Map<string, Role>
}

const sessions = new Map<string, SessionState>()

function ensureSession(sessionId: string) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      mode: "FREE",
      roles: new Map()
    })
  }
}

export function assignRole(
  sessionId: string,
  userId: string,
  role: Role
) {
  ensureSession(sessionId)
  sessions.get(sessionId)!.roles.set(userId, role)
}

export function getRole(
  sessionId: string,
  userId: string
): Role {
  ensureSession(sessionId)
  return sessions.get(sessionId)!.roles.get(userId) || "CONTRIBUTOR"
}

export function hasFacilitator(sessionId: string): boolean {
  ensureSession(sessionId)
  const roles = sessions.get(sessionId)!.roles
  return Array.from(roles.values()).includes("FACILITATOR")
}

export async function setMode(sessionId: string, mode: Mode) {
  ensureSession(sessionId)
  sessions.get(sessionId)!.mode = mode

  // Sync to DB
  await prisma.session.update({
    where: { id: sessionId },
    data: { currentMode: mode }
  }).catch(() => {}) // Session may not exist in DB yet
}

export function getMode(sessionId: string): Mode {
  ensureSession(sessionId)
  return sessions.get(sessionId)!.mode
}

export function validateAction(
  sessionId: string,
  userId: string
): boolean {
  ensureSession(sessionId)

  const session = sessions.get(sessionId)!
  const role = getRole(sessionId, userId)

  // Observer never edits
  if (role === "OBSERVER") return false

  // Locked mode → only facilitator edits
  if (session.mode === "LOCKED" && role !== "FACILITATOR") {
    return false
  }

  // Decision mode → no drawing allowed
  if (session.mode === "DECISION") {
    return false
  }

  return true
}