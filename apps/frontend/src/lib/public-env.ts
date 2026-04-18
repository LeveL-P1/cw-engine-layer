function readEnv(name: string, value: string | undefined, fallback?: string) {
  const resolvedValue = value?.trim() || fallback

  if (!resolvedValue) {
    throw new Error(
      `${name} is required. Add it to apps/frontend/.env.local and restart the frontend dev server.`,
    )
  }

  return resolvedValue
}

function readUrlEnv(
  name: string,
  value: string | undefined,
  fallback: string | undefined,
  protocols: string[],
) {
  const resolvedValue = readEnv(name, value, fallback)

  let parsed: URL
  try {
    parsed = new URL(resolvedValue)
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }

  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use one of these protocols: ${protocols.join(", ")}`)
  }

  return resolvedValue
}

const isProduction = process.env.NODE_ENV === "production"

// Next.js only exposes NEXT_PUBLIC_* values to client bundles when they are
// referenced statically. Keep these direct references here instead of using
// dynamic process.env[name] access.
const publicRuntimeEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  apiWsUrl: process.env.NEXT_PUBLIC_API_WS_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
}

export const publicEnv = {
  get apiUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_API_URL",
      publicRuntimeEnv.apiUrl,
      isProduction ? undefined : "http://localhost:4000",
      ["http:", "https:"],
    )
  },
  get apiWsUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_API_WS_URL",
      publicRuntimeEnv.apiWsUrl,
      isProduction ? undefined : "ws://localhost:4000",
      ["ws:", "wss:"],
    )
  },
  get supabaseUrl() {
    return readUrlEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      publicRuntimeEnv.supabaseUrl,
      undefined,
      ["http:", "https:"],
    )
  },
  get supabasePublishableKey() {
    return readEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      publicRuntimeEnv.supabasePublishableKey,
    )
  },
}
