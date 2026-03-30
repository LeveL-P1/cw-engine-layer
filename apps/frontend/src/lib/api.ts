import { supabase } from "@/lib/supabase"

export async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ?? null
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = await getAccessToken()

  if (!token) {
    throw new Error("No active auth session")
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)

  return fetch(input, {
    ...init,
    headers,
  })
}
