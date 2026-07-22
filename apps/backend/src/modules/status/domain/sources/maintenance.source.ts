import { type MaintenanceSignal } from '../status-signals';

/**
 * Maintenance source port (Phase 3).
 *
 * Provides whether a room is currently under maintenance. Abstract-class DI
 * token; backed by the Room aggregate's maintenance flag. Not time-dependent.
 */
export abstract class RoomMaintenanceSource {
  abstract getMaintenance(roomId: string): Promise<MaintenanceSignal>;
}
