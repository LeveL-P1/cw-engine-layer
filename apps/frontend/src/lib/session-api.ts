import { ApiError, apiFetch, getApiErrorMessage } from "@/lib/api"
import type { SessionDetails } from "@/types/session"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function fetchSessionDetails(
  sessionId: string,
): Promise<SessionDetails> {
  const response = await apiFetch(`${API_URL}/api/sessions/${sessionId}`)

  if (!response.ok) {
    throw new ApiError(
      await getApiErrorMessage(response, "Failed to load session"),
      response.status,
    )
  }

  return response.json() as Promise<SessionDetails>
}
