import { type RoomStatus } from '@prisma/client';

/**
 * Status signal contracts (Phase 3, pure).
 *
 * These interfaces are the ONLY inputs to the (future) pure status resolver.
 * Each signal is produced by a source port (schedule, occupancy/check-in,
 * maintenance, override, device) and carries already-fetched, transport-agnostic
 * data — no Prisma types beyond the frozen `RoomStatus` enum, no I/O.
 */

/** Check-in disposition of the room's current meeting. */
export const OccupancyState = {
  CheckedIn: 'checked_in',
  Pending: 'pending',
  NoShow: 'no_show',
  Released: 'released',
  None: 'none',
} as const;

export type OccupancyState = (typeof OccupancyState)[keyof typeof OccupancyState];

/** A single scheduled meeting window relevant to status resolution. */
export interface MeetingWindow {
  readonly meetingCacheId: string;
  readonly startTime: Date;
  readonly endTime: Date;
}

/** Schedule signal: the room's relevant (non-cancelled) meeting windows. */
export interface ScheduleSignal {
  readonly meetings: readonly MeetingWindow[];
}

/** Occupancy signal: check-in disposition for the current meeting, if any. */
export interface OccupancySignal {
  readonly meetingCacheId: string | null;
  readonly state: OccupancyState;
}

/** Maintenance signal: whether the room is under maintenance. */
export interface MaintenanceSignal {
  readonly active: boolean;
}

/**
 * Override / emergency-lock signal (reserved). Durable persistence arrives in a
 * future additive migration; until then implementations report `active: false`.
 */
export interface OverrideSignal {
  readonly active: boolean;
  readonly status?: RoomStatus;
  readonly reason?: string;
}

/**
 * Device health signal (reserved). Excluded from room-status resolution by design
 * (device health is surfaced by the device-monitoring context), but modelled here
 * for forward compatibility.
 */
export interface DeviceSignal {
  readonly online: boolean;
}

/** The complete, already-gathered input set for status resolution at `now`. */
export interface StatusInputs {
  readonly now: Date;
  readonly schedule: ScheduleSignal;
  readonly occupancy: OccupancySignal;
  readonly maintenance: MaintenanceSignal;
  readonly override?: OverrideSignal | null;
  readonly device?: DeviceSignal | null;
}
