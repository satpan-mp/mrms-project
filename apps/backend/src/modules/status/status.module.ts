import { Module } from '@nestjs/common';

import { CatalogModule } from '../catalog/catalog.module';

import { RoomStatusService } from './domain/room-status.service';
import { RoomMaintenanceSource } from './domain/sources/maintenance.source';
import { RoomOccupancySource } from './domain/sources/occupancy.source';
import { RoomOverrideSource } from './domain/sources/override.source';
import { RoomScheduleSource } from './domain/sources/schedule.source';
import { NoopOverrideSource } from './infrastructure/noop-override.source';
import { PrismaMaintenanceSource } from './infrastructure/prisma-maintenance.source';
import { PrismaOccupancySource } from './infrastructure/prisma-occupancy.source';
import { PrismaScheduleSource } from './infrastructure/prisma-schedule.source';

/**
 * Room Status Engine bounded context (Phase 3).
 *
 * Binds the status source ports (abstract classes) to their Phase 3
 * implementations and exposes `RoomStatusService`. Imports `CatalogModule` to
 * consume the exported `RoomRepository` port (room reads + status write, kept
 * within the Room aggregate). `OutboxWriter`, `Clock`, and `TransactionHost`
 * come from the global `CommonModule`. Device health is intentionally not bound
 * (excluded from status resolution).
 */
@Module({
  imports: [CatalogModule],
  providers: [
    { provide: RoomScheduleSource, useClass: PrismaScheduleSource },
    { provide: RoomOccupancySource, useClass: PrismaOccupancySource },
    { provide: RoomMaintenanceSource, useClass: PrismaMaintenanceSource },
    { provide: RoomOverrideSource, useClass: NoopOverrideSource },
    RoomStatusService,
  ],
  exports: [RoomStatusService],
})
export class StatusModule {}
