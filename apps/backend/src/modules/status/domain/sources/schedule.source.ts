import { type ScheduleSignal } from '../status-signals';

/**
 * Schedule source port (Phase 3).
 *
 * Provides the room's relevant (non-cancelled) meeting windows around a point in
 * time. Abstract-class DI token — bound to a concrete implementation later.
 * Backed by the calendar/meeting-cache read model; later phases may replace the
 * implementation without changing this contract.
 */
export abstract class RoomScheduleSource {
  abstract getSchedule(roomId: string, at: Date): Promise<ScheduleSignal>;
}
