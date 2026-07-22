import { type RoomStatus } from '@prisma/client';

import { type StatusReason, type StatusSource } from './room-status';

/**
 * Room-status domain event contract (Phase 3, pure).
 *
 * Emitted through the existing atomic outbox using the frozen envelope: the
 * columns carry `eventType`/`aggregateType`/`aggregateId`/`occurredAt`, while
 * `eventVersion` + `metadata` + this payload live in the JSON `payload`.
 * Dates in the payload are ISO-8601 strings so the event is stable across
 * serialization/replay and safe for future consumers (P4 relay, P11 analytics,
 * P13 audit).
 */

export const STATUS_EVENT_VERSION = 1 as const;

export const StatusAggregateType = {
  Room: 'Room',
} as const;

export type StatusAggregateType = (typeof StatusAggregateType)[keyof typeof StatusAggregateType];

export const StatusEventType = {
  RoomStatusChanged: 'room.status.changed',
} as const;

export type StatusEventType = (typeof StatusEventType)[keyof typeof StatusEventType];

/** Reference to the meeting that drove the status, when applicable. */
export interface RoomStatusMeetingRef {
  readonly meetingCacheId: string;
  /** ISO-8601 */
  readonly startTime: string;
  /** ISO-8601 */
  readonly endTime: string;
}

/** Payload for `room.status.changed` (version 1). */
export interface RoomStatusChangedPayload {
  readonly roomId: string;
  readonly previousStatus: RoomStatus;
  readonly currentStatus: RoomStatus;
  readonly reason: StatusReason;
  readonly source: StatusSource;
  /** ISO-8601 timestamp at which the new status took effect. */
  readonly effectiveAt: string;
  readonly meeting?: RoomStatusMeetingRef | null;
}
