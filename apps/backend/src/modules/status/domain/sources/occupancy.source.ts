import { type OccupancySignal } from '../status-signals';

/**
 * Occupancy source port (Phase 3).
 *
 * Provides the check-in disposition of the room's current meeting at a point in
 * time (checked-in / pending / no-show / released / none). Abstract-class DI
 * token. The Phase 9 check-in context provides the authoritative implementation.
 */
export abstract class RoomOccupancySource {
  abstract getOccupancy(roomId: string, at: Date): Promise<OccupancySignal>;
}
