"use client"

export type StoredRole = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"

export interface StoredSession {
  sessionId: string
  userId: string
  role: StoredRole
  displayName: string
  sessionName: string
}

const STORAGE_KEY = "currentSession"

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession> & { name?: string }

    if (
      typeof parsed.sessionId !== "string" ||
      typeof parsed.userId !== "string" ||
      typeof parsed.role !== "string"
    ) {
      window.sessionStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      sessionId: parsed.sessionId,
      userId: parsed.userId,
      role: parsed.role as StoredRole,
      displayName:
        typeof parsed.displayName === "string"
          ? parsed.displayName
          : typeof parsed.name === "string"
            ? parsed.name
            : "",
      sessionName:
        typeof parsed.sessionName === "string"
          ? parsed.sessionName
          : "Whiteboard Session",
    }
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setStoredSession(session: StoredSession) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
}
