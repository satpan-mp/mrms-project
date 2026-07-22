import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { type Facility } from '@prisma/client';

import {
  ConflictError,
  type DomainError,
  NotFoundError,
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
import {
  type CreateFacilityInput,
  type FacilityFilter,
  FACILITY_SORTABLE_FIELDS,
  FacilityRepository,
  type UpdateFacilityInput,
} from './facility.repository';

/**
 * Facility domain service. `name` is globally unique; mutations run in a
 * transaction with validate-before-write and atomic outbox emission.
 */
@Injectable()
export class FacilityService {
  constructor(
    private readonly facilities: FacilityRepository,
    private readonly outbox: OutboxWriter,
  ) {}

  async getById(id: string): Promise<Result<Facility, DomainError>> {
    const facility = await this.facilities.findById(id);
    if (!facility) {
      return err(
        new NotFoundError('catalog.facility.not_found', `Facility ${id} was not found.`, { id }),
      );
    }
    return ok(facility);
  }

  async list(
    filter: FacilityFilter,
    page?: PageRequestInput,
  ): Promise<Result<Page<Facility>, DomainError>> {
    const request = normalizePageRequest(page);
    const sortError = validateSort(request.sort, FACILITY_SORTABLE_FIELDS);
    if (sortError) return err(sortError);
    return ok(await this.facilities.list(filter, request));
  }

  @Transactional()
  async create(input: CreateFacilityInput): Promise<Result<Facility, DomainError>> {
    const duplicate = await this.facilities.findByName(input.name);
    if (duplicate) {
      return err(
        new ConflictError(
          'catalog.facility.name_conflict',
          `Facility "${input.name}" already exists.`,
          { name: input.name },
        ),
      );
    }

    const facility = await this.facilities.create(input);
    await this.outbox.write({
      eventType: CatalogEventType.FacilityCreated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Facility,
      aggregateId: facility.id,
      payload: { facilityId: facility.id, name: facility.name },
    });
    return ok(facility);
  }

  @Transactional()
  async update(id: string, input: UpdateFacilityInput): Promise<Result<Facility, DomainError>> {
    const existing = await this.facilities.findById(id);
    if (!existing) {
      return err(
        new NotFoundError('catalog.facility.not_found', `Facility ${id} was not found.`, { id }),
      );
    }
    if (input.name !== undefined && input.name !== existing.name) {
      const duplicate = await this.facilities.findByName(input.name);
      if (duplicate && duplicate.id !== id) {
        return err(
          new ConflictError(
            'catalog.facility.name_conflict',
            `Facility "${input.name}" already exists.`,
            { name: input.name },
          ),
        );
      }
    }

    const facility = await this.facilities.update(id, input);
    await this.outbox.write({
      eventType: CatalogEventType.FacilityUpdated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Facility,
      aggregateId: facility.id,
      payload: { facilityId: facility.id, name: facility.name },
    });
    return ok(facility);
  }

  @Transactional()
  async delete(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.facilities.findById(id);
    if (!existing) {
      return err(
        new NotFoundError('catalog.facility.not_found', `Facility ${id} was not found.`, { id }),
      );
    }

    await this.facilities.softDelete(id);
    await this.outbox.write({
      eventType: CatalogEventType.FacilityDeleted,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Facility,
      aggregateId: id,
      payload: { facilityId: id },
    });
    return ok<void>(undefined);
  }
}
