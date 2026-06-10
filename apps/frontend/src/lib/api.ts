import { supabase } from "@/lib/supabase"

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ?? null
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = await getAccessToken()

  if (!token) {
    throw new ApiError("No active auth session. Please sign in again.", 401)
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)

  try {
    return await fetch(input, {
      ...init,
      headers,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        "Could not reach the backend API. Start the backend locally, or if using Render free tier, open /health first and wait ~60 seconds for the server to wake up.",
        0,
      )
    }

    throw error
  }
}

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const payload = await response
    .json()
    .catch(() => null) as { message?: string } | null

  if (payload?.message) {
    return payload.message
  }

  if (response.status === 401) {
    return "Your auth session expired. Please sign in again."
  }

  if (response.status === 403) {
    return "You do not have access to this session."
  }

  if (response.status === 404) {
    return "Requested session data is unavailable."
  }

  return fallbackMessage
}
