import { Module } from '@nestjs/common';

import { FacilityRepository } from './domain/facility.repository';
import { FacilityService } from './domain/facility.service';
import { OrganizationRepository } from './domain/organization.repository';
import { RoomRepository } from './domain/room.repository';
import { RoomService } from './domain/room.service';
import { SiteRepository } from './domain/site.repository';
import { SiteService } from './domain/site.service';
import { PrismaFacilityRepository } from './infrastructure/prisma-facility.repository';
import { PrismaOrganizationRepository } from './infrastructure/prisma-organization.repository';
import { PrismaRoomRepository } from './infrastructure/prisma-room.repository';
import { PrismaSiteRepository } from './infrastructure/prisma-site.repository';

/**
 * Catalog bounded context (Phase 2 Core Domain Layer).
 *
 * Wires repository ports (abstract classes) to their Prisma implementations and
 * exposes the domain services. Dependencies flow inward: services depend on
 * ports; Prisma implementations depend on the ambient `TransactionHost` (from
 * the global `CommonModule`). No controllers/DTOs/HTTP — those arrive in Phase 7.
 */
@Module({
  providers: [
    { provide: OrganizationRepository, useClass: PrismaOrganizationRepository },
    { provide: SiteRepository, useClass: PrismaSiteRepository },
    { provide: FacilityRepository, useClass: PrismaFacilityRepository },
    { provide: RoomRepository, useClass: PrismaRoomRepository },
    SiteService,
    FacilityService,
    RoomService,
  ],
  exports: [SiteService, FacilityService, RoomService],
})
export class CatalogModule {}
