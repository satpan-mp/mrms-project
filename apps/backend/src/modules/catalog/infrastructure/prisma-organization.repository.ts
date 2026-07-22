import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { type Organization } from '@prisma/client';

import { BaseRepository } from '../../../common/persistence/base-repository';
import { OrganizationRepository } from '../domain/organization.repository';

/** Prisma implementation of the read-only organization port. */
@Injectable()
export class PrismaOrganizationRepository extends BaseRepository implements OrganizationRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async findById(id: string): Promise<Organization | null> {
    // findFirst (not findUnique) so the soft-delete extension applies its filter.
    return this.client.organization.findFirst({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.client.organization.count({ where: { id } });
    return count > 0;
  }
}
