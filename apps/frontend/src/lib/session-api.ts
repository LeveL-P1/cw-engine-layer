import { apiFetch } from "@/lib/api"
import type { SessionDetails } from "@/types/session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function fetchSessionDetails(
  sessionId: string,
): Promise<SessionDetails> {
  const response = await apiFetch(`${API_URL}/api/sessions/${sessionId}`)

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    throw new Error(errorPayload?.message ?? "Failed to load session")
  }

  return response.json() as Promise<SessionDetails>
}
