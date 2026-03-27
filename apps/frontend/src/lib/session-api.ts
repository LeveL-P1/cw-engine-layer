import type { RoleType } from "@/context/session-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export interface SessionParticipantDto {
  id: string
  participantId: string
  name: string
  role: RoleType
  joinedAt: string
}

export interface SessionDetailsDto {
  id: string
  name: string | null
  currentMode: string
  startTime: string
  endTime: string | null
  participantCount: number
  participants: SessionParticipantDto[]
}

export async function fetchSessionDetails(
  sessionId: string,
): Promise<SessionDetailsDto> {
  const response = await fetch(`${API_URL}/api/sessions/${sessionId}`)

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    throw new Error(errorPayload?.message ?? "Failed to load session")
  }

  return response.json() as Promise<SessionDetailsDto>
}
