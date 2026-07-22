import { Injectable } from '@nestjs/common';

import { RoomRepository } from '../../catalog/domain/room.repository';
import { RoomMaintenanceSource } from '../domain/sources/maintenance.source';
import { type MaintenanceSignal } from '../domain/status-signals';

/**
 * Maintenance source backed by the Room aggregate's maintenance flag, read
 * through the catalog `RoomRepository` port (keeps `rooms` access within the
 * aggregate). A missing room reports no maintenance.
 */
@Injectable()
export class PrismaMaintenanceSource implements RoomMaintenanceSource {
  constructor(private readonly rooms: RoomRepository) {}

  async getMaintenance(roomId: string): Promise<MaintenanceSignal> {
    const room = await this.rooms.findById(roomId);
    return { active: room?.maintenance ?? false };
  }
}
