import { ApiError } from "@/lib/api"
import type { SessionUIState } from "@/types/session"

export function resolveSessionUiState(error: unknown): SessionUIState {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return "unauthorized"
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (
      message.includes("no active auth session") ||
      message.includes("access") ||
      message.includes("unauthorized")
    ) {
      return "unauthorized"
    }
  }

  return "error"
}

export function getSessionUiMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallbackMessage
}
