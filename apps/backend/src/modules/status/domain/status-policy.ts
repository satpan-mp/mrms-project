import { type RoomStatus } from '@prisma/client';

import { StatusReason, StatusSource } from './room-status';
import { RESERVED_HORIZON_MIN, STARTING_SOON_LEAD_MIN } from './status-config';
import { type MeetingWindow, OccupancyState, type StatusInputs } from './status-signals';

/**
 * Pure room-status policy (Phase 3).
 *
 * Completely pure: no NestJS, no Prisma runtime, no repositories/services, no
 * Clock (time arrives via `inputs.now`), no transactions/CLS, no events, no I/O.
 * `RoomStatus` is imported as a type only; status values are typed string
 * literals. This module holds the ONLY status decision logic.
 *
 * Precedence (highest wins): Override (placeholder) > Maintenance > Occupancy
 * (meeting in progress) > Starting Soon > Reserved > Available. Device is
 * intentionally excluded from status resolution.
 */

const AVAILABLE: RoomStatus = 'AVAILABLE';
const RESERVED: RoomStatus = 'RESERVED';
const STARTING_SOON: RoomStatus = 'STARTING_SOON';
const OCCUPIED: RoomStatus = 'OCCUPIED';
const MAINTENANCE: RoomStatus = 'MAINTENANCE';

/** The resolved status plus the reason/source and the driving meeting (if any). */
export interface StatusDecision {
  readonly status: RoomStatus;
  readonly reason: StatusReason;
  readonly source: StatusSource;
  readonly meeting: MeetingWindow | null;
}

/** Kind of transition, used only to guard manual writes. */
export type StatusTransitionKind = 'computed' | 'manual' | 'override';

/**
 * Resolve a room's effective status from already-gathered signals at `inputs.now`.
 * Deterministic and side-effect free.
 */
export function computeStatus(inputs: StatusInputs): StatusDecision {
  // 1. Override / emergency lock (placeholder — sources report inactive in P3).
  const override = inputs.override;
  if (override?.active && override.status !== undefined) {
    return {
      status: override.status,
      reason: StatusReason.ManualOverride,
      source: StatusSource.Override,
      meeting: null,
    };
  }

  // 2. Maintenance.
  if (inputs.maintenance.active) {
    return {
      status: MAINTENANCE,
      reason: StatusReason.MaintenanceActive,
      source: StatusSource.Maintenance,
      meeting: null,
    };
  }

  const now = inputs.now.getTime();
  const meetings = sortByStart(inputs.schedule.meetings);

  // 3. Occupancy: a meeting currently in progress, unless it has been released.
  const current = findCurrentMeeting(meetings, now);
  const currentFreed =
    current !== null &&
    inputs.occupancy.meetingCacheId === current.meetingCacheId &&
    (inputs.occupancy.state === OccupancyState.NoShow ||
      inputs.occupancy.state === OccupancyState.Released);

  if (current !== null && !currentFreed) {
    return {
      status: OCCUPIED,
      reason: StatusReason.MeetingInProgress,
      source: StatusSource.Schedule,
      meeting: current,
    };
  }

  // 4/5. Upcoming meeting → Starting Soon / Reserved.
  const upcoming = findNextUpcomingMeeting(meetings, now, currentFreed ? current : null);
  if (upcoming !== null) {
    const minutesUntilStart = (upcoming.startTime.getTime() - now) / 60_000;
    if (minutesUntilStart <= STARTING_SOON_LEAD_MIN) {
      return {
        status: STARTING_SOON,
        reason: StatusReason.MeetingStartingSoon,
        source: StatusSource.Schedule,
        meeting: upcoming,
      };
    }
    if (minutesUntilStart <= RESERVED_HORIZON_MIN) {
      return {
        status: RESERVED,
        reason: StatusReason.UpcomingReservation,
        source: StatusSource.Schedule,
        meeting: upcoming,
      };
    }
  }

  // 6. Available — distinguish a no-show release from a plain idle room.
  if (currentFreed) {
    return {
      status: AVAILABLE,
      reason: StatusReason.NoShowReleased,
      source: StatusSource.Occupancy,
      meeting: null,
    };
  }
  return {
    status: AVAILABLE,
    reason: StatusReason.NoUpcomingMeeting,
    source: StatusSource.System,
    meeting: null,
  };
}

/**
 * Guard for status transitions. Computed transitions (resolver output) and
 * override transitions are always allowed; manual writes may only toggle
 * MAINTENANCE (or be a no-op) — occupancy-derived statuses are never set by hand.
 */
export function isTransitionAllowed(
  from: RoomStatus,
  to: RoomStatus,
  kind: StatusTransitionKind,
): boolean {
  switch (kind) {
    case 'computed':
      return true;
    case 'override':
      return true;
    case 'manual':
      return to === MAINTENANCE || from === to;
    default:
      return false;
  }
}

function sortByStart(meetings: readonly MeetingWindow[]): MeetingWindow[] {
  return [...meetings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

function findCurrentMeeting(meetings: readonly MeetingWindow[], now: number): MeetingWindow | null {
  for (const meeting of meetings) {
    if (meeting.startTime.getTime() <= now && now < meeting.endTime.getTime()) {
      return meeting;
    }
  }
  return null;
}

function findNextUpcomingMeeting(
  meetings: readonly MeetingWindow[],
  now: number,
  exclude: MeetingWindow | null,
): MeetingWindow | null {
  for (const meeting of meetings) {
    if (exclude !== null && meeting.meetingCacheId === exclude.meetingCacheId) continue;
    if (meeting.startTime.getTime() > now) {
      return meeting;
    }
  }
  return null;
}
