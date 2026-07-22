import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { type Site } from '@prisma/client';

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
import { OrganizationRepository } from './organization.repository';
import {
  type CreateSiteInput,
  type SiteFilter,
  SITE_SORTABLE_FIELDS,
  SiteRepository,
  type UpdateSiteInput,
} from './site.repository';

/**
 * Site domain service.
 *
 * Returns `Result<T, DomainError>`; mutations run in a transaction
 * (`@Transactional`, join-if-active). Validation runs before any write, so
 * returning `Err` never leaves a partial commit; the state change and its
 * outbox event commit atomically.
 */
@Injectable()
export class SiteService {
  constructor(
    private readonly sites: SiteRepository,
    private readonly organizations: OrganizationRepository,
    private readonly outbox: OutboxWriter,
  ) {}

  async getById(id: string): Promise<Result<Site, DomainError>> {
    const site = await this.sites.findById(id);
    if (!site) {
      return err(new NotFoundError('catalog.site.not_found', `Site ${id} was not found.`, { id }));
    }
    return ok(site);
  }

  async list(
    filter: SiteFilter,
    page?: PageRequestInput,
  ): Promise<Result<Page<Site>, DomainError>> {
    const request = normalizePageRequest(page);
    const sortError = validateSort(request.sort, SITE_SORTABLE_FIELDS);
    if (sortError) return err(sortError);
    return ok(await this.sites.list(filter, request));
  }

  @Transactional()
  async create(input: CreateSiteInput): Promise<Result<Site, DomainError>> {
    if (!(await this.organizations.existsById(input.organizationId))) {
      return err(
        new NotFoundError(
          'catalog.organization.not_found',
          `Organization ${input.organizationId} was not found.`,
          { organizationId: input.organizationId },
        ),
      );
    }
    const duplicate = await this.sites.findByOrganizationAndCode(input.organizationId, input.code);
    if (duplicate) {
      return err(
        new ConflictError(
          'catalog.site.code_conflict',
          `Site code "${input.code}" already exists in this organization.`,
          { organizationId: input.organizationId, code: input.code },
        ),
      );
    }

    const site = await this.sites.create(input);
    await this.outbox.write({
      eventType: CatalogEventType.SiteCreated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Site,
      aggregateId: site.id,
      payload: {
        siteId: site.id,
        organizationId: site.organizationId,
        code: site.code,
        name: site.name,
      },
    });
    return ok(site);
  }

  @Transactional()
  async update(id: string, input: UpdateSiteInput): Promise<Result<Site, DomainError>> {
    const existing = await this.sites.findById(id);
    if (!existing) {
      return err(new NotFoundError('catalog.site.not_found', `Site ${id} was not found.`, { id }));
    }
    if (input.code !== undefined && input.code !== existing.code) {
      const duplicate = await this.sites.findByOrganizationAndCode(
        existing.organizationId,
        input.code,
      );
      if (duplicate && duplicate.id !== id) {
        return err(
          new ConflictError(
            'catalog.site.code_conflict',
            `Site code "${input.code}" already exists in this organization.`,
            { organizationId: existing.organizationId, code: input.code },
          ),
        );
      }
    }

    const site = await this.sites.update(id, input);
    await this.outbox.write({
      eventType: CatalogEventType.SiteUpdated,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Site,
      aggregateId: site.id,
      payload: { siteId: site.id, code: site.code, name: site.name, active: site.active },
    });
    return ok(site);
  }

  @Transactional()
  async delete(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.sites.findById(id);
    if (!existing) {
      return err(new NotFoundError('catalog.site.not_found', `Site ${id} was not found.`, { id }));
    }

    await this.sites.softDelete(id);
    await this.outbox.write({
      eventType: CatalogEventType.SiteDeleted,
      eventVersion: CATALOG_EVENT_VERSION,
      aggregateType: CatalogAggregateType.Site,
      aggregateId: id,
      payload: { siteId: id },
    });
    return ok<void>(undefined);
  }
}
