import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, type Facility } from '@prisma/client';

import { buildPage, type Page } from '../../../common/pagination/page';
import { toSkipTake, type PageRequest } from '../../../common/pagination/page-request';
import { BaseRepository } from '../../../common/persistence/base-repository';
import { buildOrderBy } from '../../../common/persistence/query.util';
import {
  type CreateFacilityInput,
  type FacilityFilter,
  FacilityRepository,
  type UpdateFacilityInput,
} from '../domain/facility.repository';
import { type FindByIdOptions } from '../domain/site.repository';

const DEFAULT_SORT = [{ field: 'name', direction: 'asc' as const }];

/** Prisma implementation of the Facility aggregate repository. */
@Injectable()
export class PrismaFacilityRepository extends BaseRepository implements FacilityRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async findById(id: string, options?: FindByIdOptions): Promise<Facility | null> {
    return this.client.facility.findFirst({
      where: { id, ...(options?.includeDeleted ? { deletedAt: undefined } : {}) },
    });
  }

  async findByName(name: string): Promise<Facility | null> {
    return this.client.facility.findFirst({ where: { name } });
  }

  async findManyByIds(ids: readonly string[]): Promise<Facility[]> {
    if (ids.length === 0) return [];
    return this.client.facility.findMany({ where: { id: { in: [...ids] } } });
  }

  async list(filter: FacilityFilter, page: PageRequest): Promise<Page<Facility>> {
    const where = this.buildWhere(filter);
    const orderBy = buildOrderBy(
      page.sort,
      DEFAULT_SORT,
    ) as Prisma.FacilityOrderByWithRelationInput[];
    const { skip, take } = toSkipTake(page);

    const totalItems = await this.client.facility.count({ where });
    const items = await this.client.facility.findMany({ where, orderBy, skip, take });
    return buildPage(items, totalItems, page);
  }

  async create(input: CreateFacilityInput): Promise<Facility> {
    return this.client.facility.create({
      data: {
        name: input.name,
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
      },
    });
  }

  async update(id: string, input: UpdateFacilityInput): Promise<Facility> {
    return this.client.facility.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    // Canonical soft-delete: set deletedAt via update (extension override remains
    // a defensive guard against accidental hard deletes).
    await this.client.facility.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private buildWhere(filter: FacilityFilter): Prisma.FacilityWhereInput {
    const where: Prisma.FacilityWhereInput = {};
    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }
    return where;
  }
}
