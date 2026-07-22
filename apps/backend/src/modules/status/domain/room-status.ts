import { type RoomStatus } from '@prisma/client';

/**
 * Status domain vocabulary (Phase 3, pure).
 *
 * The persisted status value is the frozen Prisma `RoomStatus` enum
 * (`AVAILABLE | OCCUPIED | STARTING_SOON | MAINTENANCE | RESERVED`) — re-exported
 * here as a type for convenience. This module adds only the descriptive vocabulary
 * that accompanies a computed status: WHY it holds (`StatusReason`) and WHICH
 * signal drove it (`StatusSource`). No policy/logic lives here (see StatusPolicy,
 * a later step). Values follow the project's `as const` + union convention.
 */

/** Convenience re-export of the frozen persisted status enum type. */
export type { RoomStatus };

/** Why the engine resolved a room to its current status. */
export const StatusReason = {
  MeetingInProgress: 'meeting_in_progress',
  MeetingStartingSoon: 'meeting_starting_soon',
  UpcomingReservation: 'upcoming_reservation',
  NoUpcomingMeeting: 'no_upcoming_meeting',
  MaintenanceActive: 'maintenance_active',
  ManualOverride: 'manual_override',
  NoShowReleased: 'no_show_released',
} as const;

export type StatusReason = (typeof StatusReason)[keyof typeof StatusReason];

/** Which signal source had precedence when resolving the status. */
export const StatusSource = {
  Schedule: 'schedule',
  Occupancy: 'occupancy',
  Maintenance: 'maintenance',
  Override: 'override',
  Device: 'device',
  System: 'system',
} as const;

export type StatusSource = (typeof StatusSource)[keyof typeof StatusSource];
