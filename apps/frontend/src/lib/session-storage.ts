"use client"

export type StoredRole = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"

export interface StoredSession {
  sessionId: string
  userId: string
  role: StoredRole
  name: string
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
    return JSON.parse(raw) as StoredSession
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
