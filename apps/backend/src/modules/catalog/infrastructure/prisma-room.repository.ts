import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, type Room, type RoomStatus } from '@prisma/client';

import { buildPage, type Page } from '../../../common/pagination/page';
import { toSkipTake, type PageRequest } from '../../../common/pagination/page-request';
import { BaseRepository } from '../../../common/persistence/base-repository';
import { buildOrderBy } from '../../../common/persistence/query.util';
import {
  type CreateRoomInput,
  type RoomFilter,
  RoomRepository,
  type RoomWithFacilities,
  type UpdateRoomInput,
} from '../domain/room.repository';
import { type FindByIdOptions } from '../domain/site.repository';

const DEFAULT_SORT = [{ field: 'name', direction: 'asc' as const }];

/** Prisma implementation of the Room aggregate repository (owns RoomFacility links). */
@Injectable()
export class PrismaRoomRepository extends BaseRepository implements RoomRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async findById(id: string, options?: FindByIdOptions): Promise<Room | null> {
    return this.client.room.findFirst({
      where: { id, ...(options?.includeDeleted ? { deletedAt: undefined } : {}) },
    });
  }

  async findWithFacilities(id: string): Promise<RoomWithFacilities | null> {
    // Single query with an explicit include (no N+1); excludes soft-deleted facilities.
    const room = await this.client.room.findFirst({
      where: { id },
      include: {
        facilities: {
          where: { facility: { deletedAt: null } },
          include: { facility: true },
        },
      },
    });
    if (!room) return null;
    const { facilities, ...rest } = room;
    return { ...rest, facilities: facilities.map((link) => link.facility) };
  }

  async findByDisplayUrl(displayUrl: string): Promise<Room | null> {
    return this.client.room.findFirst({ where: { displayUrl } });
  }

  async list(filter: RoomFilter, page: PageRequest): Promise<Page<Room>> {
    const where = this.buildWhere(filter);
    const orderBy = buildOrderBy(page.sort, DEFAULT_SORT) as Prisma.RoomOrderByWithRelationInput[];
    const { skip, take } = toSkipTake(page);

    const totalItems = await this.client.room.count({ where });
    const items = await this.client.room.findMany({ where, orderBy, skip, take });
    return buildPage(items, totalItems, page);
  }

  async create(input: CreateRoomInput): Promise<Room> {
    return this.client.room.create({
      data: {
        siteId: input.siteId,
        organizationId: input.organizationId,
        name: input.name,
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.displayUrl !== undefined ? { displayUrl: input.displayUrl } : {}),
        ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
        ...(input.calendarProviderId !== undefined
          ? { calendarProviderId: input.calendarProviderId }
          : {}),
        ...(input.externalResourceId !== undefined
          ? { externalResourceId: input.externalResourceId }
          : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  }

  async update(id: string, input: UpdateRoomInput): Promise<Room> {
    return this.client.room.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.displayUrl !== undefined ? { displayUrl: input.displayUrl } : {}),
        ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
        ...(input.calendarProviderId !== undefined
          ? { calendarProviderId: input.calendarProviderId }
          : {}),
        ...(input.externalResourceId !== undefined
          ? { externalResourceId: input.externalResourceId }
          : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.maintenance !== undefined ? { maintenance: input.maintenance } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    // Canonical soft-delete: set deletedAt via update (extension override remains
    // a defensive guard). The room's RoomFacility links are intentionally left
    // intact (shallow, non-cascading soft delete).
    await this.client.room.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async setStatus(roomId: string, status: RoomStatus, statusChangedAt: Date): Promise<void> {
    // Mechanical: persist only status + statusChangedAt on the ambient client.
    await this.client.room.update({ where: { id: roomId }, data: { status, statusChangedAt } });
  }

  async setFacilities(roomId: string, facilityIds: readonly string[]): Promise<void> {
    // Replace the full link set within the ambient transaction. RoomFacility has
    // no deletedAt, so deleteMany is a genuine (hard) delete of the links.
    await this.client.roomFacility.deleteMany({ where: { roomId } });
    if (facilityIds.length > 0) {
      await this.client.roomFacility.createMany({
        data: facilityIds.map((facilityId) => ({ roomId, facilityId })),
        skipDuplicates: true,
      });
    }
  }

  private buildWhere(filter: RoomFilter): Prisma.RoomWhereInput {
    const where: Prisma.RoomWhereInput = {};
    if (filter.siteId !== undefined) where.siteId = filter.siteId;
    if (filter.organizationId !== undefined) where.organizationId = filter.organizationId;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.active !== undefined) where.active = filter.active;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { location: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
