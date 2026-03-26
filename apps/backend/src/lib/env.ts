function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function requirePostgresUrl(name: string): string {
  const value = requireEnv(name)

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(
      `${name} must be a valid PostgreSQL connection string. Percent-encode special password characters before pasting the URL.`,
    )
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error(`${name} must use the postgres:// or postgresql:// protocol`)
  }

  return value
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return 4000
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT must be a positive integer")
  }

  return parsed
}

export const env = {
  databaseUrl: requirePostgresUrl("DATABASE_URL"),
  directUrl: process.env.DIRECT_URL?.trim()
    ? requirePostgresUrl("DIRECT_URL")
    : null,
  port: parsePort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN?.trim() || "http://localhost:3000",
}
