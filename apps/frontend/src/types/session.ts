import type { ModeType, RoleType } from "@/context/session-context"
import type { StoredSession } from "@/lib/session-storage"

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

export interface SessionRouteContext {
  sessionInfo: StoredSession
  sessionDetails: SessionDetails | null
  sessionName: string
  currentUserRole: RoleType
  activeUsers: {
    id: string
    name: string
    role: RoleType
  }[]
  sessionStartTime: number
  modeStartedAt: number
  isSessionRefreshing: boolean
}
