import type { ModeType, RoleType } from "@/context/session-context"

export type SessionUIState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "error"

export interface SessionParticipant {
  id: string
  participantId: string
  name: string
  role: RoleType
  joinedAt: string
}

export interface SessionDetails {
  id: string
  name: string | null
  currentMode: ModeType
  startTime: string
  endTime: string | null
  participantCount: number
  participants: SessionParticipant[]
}

export interface MetricsPerUser {
  userId: string
  edits: number
}

export interface SessionMetrics {
  totalEdits: number
  activeUsers: number
  dominanceRatio: number
  perUser: MetricsPerUser[]
}

export interface TimelinePoint {
  timestamp: string
  edits: number
}

export interface ModeTransitionPoint {
  timestamp: string
  mode: ModeType
}
