function readEnv(name: string, fallback?: string) {
  const value = process.env[name]?.trim() || fallback

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function readUrlEnv(name: string, fallback: string | undefined, protocols: string[]) {
  const value = readEnv(name, fallback)

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }

  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use one of these protocols: ${protocols.join(", ")}`)
  }

  return value
}

const isProduction = process.env.NODE_ENV === "production"

export const publicEnv = {
  get apiUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_API_URL",
      isProduction ? undefined : "http://localhost:4000",
      ["http:", "https:"],
    )
  },
  get apiWsUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_API_WS_URL",
      isProduction ? undefined : "ws://localhost:4000",
      ["ws:", "wss:"],
    )
  },
  get supabaseUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      undefined,
      ["http:", "https:"],
    )
  },
  get supabasePublishableKey() {
    return readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
  },
}
