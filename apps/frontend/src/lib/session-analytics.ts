import type { SessionRouteContext, SessionMetrics } from "@/types/session"

export type TransitionDto = {
  timestamp: string
  mode: string
}

export function emptyMetrics(): SessionMetrics {
  return {
    totalEdits: 0,
    activeUsers: 1,
    dominanceRatio: 0,
    perUser: [],
  }
}

export function computeModeDurations(transitions: TransitionDto[]) {
  const sorted = [...transitions].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  )

  const durations = new Map<string, number>()

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index]
    const next = sorted[index + 1]

    const start = new Date(current.timestamp).getTime()
    const end = next ? new Date(next.timestamp).getTime() : Date.now()

    const deltaMs = Math.max(0, end - start)
    const existing = durations.get(current.mode) ?? 0

    durations.set(current.mode, existing + deltaMs)
  }

  return Array.from(durations.entries()).map(([mode, totalMs]) => ({
    mode,
    durationMinutes: totalMs / 60000,
  }))
}

export function resolveParticipantLabel(
  context: SessionRouteContext,
  userId: string,
) {
  const participant = context.sessionDetails?.participants.find(
    (entry) => entry.id === userId,
  )

  if (participant?.name) {
    return participant.name
  }

  return userId.slice(0, 8)
}
