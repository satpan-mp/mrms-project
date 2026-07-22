import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { type Room } from '@prisma/client';

import {
  ConflictError,
  type DomainError,
  NotFoundError,
  ValidationError,
} from '../../../common/errors/domain-error';
import { OutboxWriter } from '../../../common/events/outbox-writer';
import { type Page } from '../../../common/pagination/page';
import {
  normalizePageRequest,
  type PageRequestInput,
} from '../../../common/pagination/page-request';
import { validateSort } from '../../../common/pagination/sort';
import { err, ok, type Result } from '../../../common/result/result';

import { CATALOG_EVENT_VERSION, CatalogAggregateType, CatalogEventType } from './catalog-events';
import { FacilityRepository } from './facility.repository';
import {
  type CreateRoomInput,
  type RoomFilter,
  ROOM_SORTABLE_FIELDS,
  RoomRepository,
  type RoomWithFacilities,
  type UpdateRoomInput,
} from './room.repository';
import { SiteRepository } from './site.repository';

/**
 * Room domain service (Room aggregate; coordinates RoomFacility links).
 *
 * Mutations run in a transaction with validate-before-write and atomic outbox
 * emission. Facility links are replaced through the Room aggregate, never a
 * standalone RoomFacility service.
 */
@Injectable()
export class RoomService {
  constructor(
    private readonly rooms: RoomRepository,
    private readonly sites: SiteRepository,
    private readonly facilities: FacilityRepository,
    private readonly outbox: OutboxWriter,
  ) {}

  async getById(id: string): Promise<Result<Room, DomainError>> {
    const room = await this.rooms.findById(id);
    if (!room) {
      return err(new NotFoundError('catalog.room.not_found', `Room ${id} was not found.`, { id }));
    }
    return ok(room);
  }

  async getWithFacilities(id: string): Promise<Result<RoomWithFacilities, DomainError>> {
    const room = await this.rooms.findWithFacilities(id);
    if (!room) {
      return err(new NotFoundError('catalog.room.not_found', `Room ${id} was not found.`, { id }));
    }
    return ok(room);
  }

  async list(
    filter: RoomFilter,
    page?: PageRequestInput,
  ): Promise<Result<Page<Room>, DomainError>> {
    const request = normalizePageRequest(page);
    const sortError = validateSort(request.sort, ROOM_SORTABLE_FIELDS);
    if (sortError) return err(sortError);
    return ok(await this.rooms.list(filter, request));
  }

  @Transactional()
  async create(
    input: CreateRoomInput,
    facilityIds: readonly string[] = [],
  ): Promise<Result<Room, DomainError>> {
    const site = await this.sites.findById(input.siteId);
    if (!site) {
      return err(
        new NotFoundError('catalog.site.not_found', `Site ${input.siteId} was not found.`, {
          siteId: input.siteId,
        }),
      );
    }
    if (site.organizationId !== input.organizationId) {
      return err(
        new ValidationError(
          'catalog.room.organization_mismatch',
          'Room organization does not match the site organization.',
          { siteId: input.siteId, organizationId: input.organizationId },
        ),
      );
    }
    if (input.displayUrl) {
      const duplicate = await this.rooms.findByDisplayUrl(input.displayUrl);
      if (duplicate) {
        return err(
          new ConflictError('catalog.room.display_url_conflict', 'Display URL already in use.', {
            displayUrl: input.displayUrl,
          }),
        );
      }
    }
    const facilityError = await this.ensureFacilitiesExist(facilityIds);
    if (facilityError) return err(facilityError);

    const room = await this.rooms.create(input);
    if (facilityIds.length > 0) {
      await this.rooms.setFacilities(room.id, facilityIds);
    }
    await this.outbox.write({
      eventType: CatalogEventType.RoomCreated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Room,
      aggregateId: room.id,
      payload: {
        roomId: room.id,
        siteId: room.siteId,
        organizationId: room.organizationId,
        name: room.name,
        facilityIds: [...facilityIds],
      },
    });
    return ok(room);
  }

  @Transactional()
  async update(id: string, input: UpdateRoomInput): Promise<Result<Room, DomainError>> {
    const existing = await this.rooms.findById(id);
    if (!existing) {
      return err(new NotFoundError('catalog.room.not_found', `Room ${id} was not found.`, { id }));
    }
    if (input.displayUrl && input.displayUrl !== existing.displayUrl) {
      const duplicate = await this.rooms.findByDisplayUrl(input.displayUrl);
      if (duplicate && duplicate.id !== id) {
        return err(
          new ConflictError('catalog.room.display_url_conflict', 'Display URL already in use.', {
            displayUrl: input.displayUrl,
          }),
        );
      }
    }

    const room = await this.rooms.update(id, input);
    await this.outbox.write({
      eventType: CatalogEventType.RoomUpdated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Room,
      aggregateId: room.id,
      payload: { roomId: room.id, name: room.name, status: room.status, active: room.active },
    });
    return ok(room);
  }

  @Transactional()
  async setFacilities(
    id: string,
    facilityIds: readonly string[],
  ): Promise<Result<void, DomainError>> {
    const existing = await this.rooms.findById(id);
    if (!existing) {
      return err(new NotFoundError('catalog.room.not_found', `Room ${id} was not found.`, { id }));
    }
    const facilityError = await this.ensureFacilitiesExist(facilityIds);
    if (facilityError) return err(facilityError);

    await this.rooms.setFacilities(id, facilityIds);
    await this.outbox.write({
      eventType: CatalogEventType.RoomFacilitiesChanged,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Room,
      aggregateId: id,
      payload: { roomId: id, facilityIds: [...facilityIds] },
    });
    return ok<void>(undefined);
  }

  @Transactional()
  async delete(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.rooms.findById(id);
    if (!existing) {
      return err(new NotFoundError('catalog.room.not_found', `Room ${id} was not found.`, { id }));
    }

    await this.rooms.softDelete(id);
    await this.outbox.write({
      eventType: CatalogEventType.RoomDeleted,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Room,
      aggregateId: id,
      payload: { roomId: id },
    });
    return ok<void>(undefined);
  }

  /** Validate that every requested facility id resolves to an active facility. */
  private async ensureFacilitiesExist(facilityIds: readonly string[]): Promise<DomainError | null> {
    const unique = [...new Set(facilityIds)];
    if (unique.length === 0) return null;

    const found = await this.facilities.findManyByIds(unique);
    if (found.length !== unique.length) {
      const foundIds = new Set(found.map((facility) => facility.id));
      const missing = unique.filter((facilityId) => !foundIds.has(facilityId));
      return new ValidationError(
        'catalog.room.invalid_facilities',
        'One or more facilities do not exist.',
        { missing },
      );
    }
    return null;
  }
}
