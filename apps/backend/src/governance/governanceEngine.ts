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

export function setMode(sessionId: string, mode: Mode) {
  ensureSession(sessionId)
  sessions.get(sessionId)!.mode = mode
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