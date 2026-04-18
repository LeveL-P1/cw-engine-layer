import { ApiError, apiFetch, getApiErrorMessage } from "@/lib/api"
import { publicEnv } from "@/lib/public-env"
import type { SessionDetails } from "@/types/session"

export async function fetchSessionDetails(
  sessionId: string,
): Promise<SessionDetails> {
  const response = await apiFetch(`${publicEnv.apiUrl}/api/sessions/${sessionId}`)

  if (!response.ok) {
    throw new ApiError(
      await getApiErrorMessage(response, "Failed to load session"),
      response.status,
    )
  }

  return response.json() as Promise<SessionDetails>
}
