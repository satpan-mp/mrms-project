import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, type Site } from '@prisma/client';

import { buildPage, type Page } from '../../../common/pagination/page';
import { toSkipTake, type PageRequest } from '../../../common/pagination/page-request';
import { BaseRepository } from '../../../common/persistence/base-repository';
import { buildOrderBy } from '../../../common/persistence/query.util';
import {
  type CreateSiteInput,
  type FindByIdOptions,
  type SiteFilter,
  SiteRepository,
  type UpdateSiteInput,
} from '../domain/site.repository';

const DEFAULT_SORT = [{ field: 'code', direction: 'asc' as const }];

/** Prisma implementation of the Site aggregate repository. */
@Injectable()
export class PrismaSiteRepository extends BaseRepository implements SiteRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async findById(id: string, options?: FindByIdOptions): Promise<Site | null> {
    return this.client.site.findFirst({
      where: { id, ...(options?.includeDeleted ? { deletedAt: undefined } : {}) },
    });
  }

  async findByOrganizationAndCode(organizationId: string, code: string): Promise<Site | null> {
    return this.client.site.findFirst({ where: { organizationId, code } });
  }

  async list(filter: SiteFilter, page: PageRequest): Promise<Page<Site>> {
    const where = this.buildWhere(filter);
    const orderBy = buildOrderBy(page.sort, DEFAULT_SORT) as Prisma.SiteOrderByWithRelationInput[];
    const { skip, take } = toSkipTake(page);

    const totalItems = await this.client.site.count({ where });
    const items = await this.client.site.findMany({ where, orderBy, skip, take });
    return buildPage(items, totalItems, page);
  }

  async create(input: CreateSiteInput): Promise<Site> {
    return this.client.site.create({
      data: {
        organizationId: input.organizationId,
        code: input.code,
        name: input.name,
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  }

  async update(id: string, input: UpdateSiteInput): Promise<Site> {
    return this.client.site.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    // Canonical soft-delete: set deletedAt via update. Does NOT rely on the
    // extension's delete->update override (which remains a defensive guard).
    await this.client.site.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private buildWhere(filter: SiteFilter): Prisma.SiteWhereInput {
    const where: Prisma.SiteWhereInput = {};
    if (filter.organizationId !== undefined) where.organizationId = filter.organizationId;
    if (filter.active !== undefined) where.active = filter.active;
    if (filter.search) {
      where.OR = [
        { code: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
