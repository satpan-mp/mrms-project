import { type Site } from '@prisma/client';

import { type Page } from '../../../common/pagination/page';
import { type PageRequest } from '../../../common/pagination/page-request';

/** Fields a `Site` list may be sorted by (allow-list; frozen deterministic order appends id). */
export const SITE_SORTABLE_FIELDS = ['code', 'name', 'createdAt'] as const;

export interface CreateSiteInput {
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly timezone?: string;
  readonly active?: boolean;
}

export interface UpdateSiteInput {
  readonly code?: string;
  readonly name?: string;
  readonly timezone?: string;
  readonly active?: boolean;
}

export interface SiteFilter {
  readonly organizationId?: string;
  readonly active?: boolean;
  /** Case-insensitive match against code/name. */
  readonly search?: string;
}

export interface FindByIdOptions {
  readonly includeDeleted?: boolean;
}

/**
 * Site repository port (Site aggregate).
 *
 * Returns `data | null` and throws only on infrastructure faults; never returns
 * `Result`. Reads are active-only by default (soft-delete filtered); writes use
 * the ambient transaction. Business rules live in `SiteService`, not here.
 */
export abstract class SiteRepository {
  abstract findById(id: string, options?: FindByIdOptions): Promise<Site | null>;

  /** Uniqueness lookup for the `(organizationId, code)` natural key. */
  abstract findByOrganizationAndCode(organizationId: string, code: string): Promise<Site | null>;

  abstract list(filter: SiteFilter, page: PageRequest): Promise<Page<Site>>;

  abstract create(input: CreateSiteInput): Promise<Site>;

  abstract update(id: string, input: UpdateSiteInput): Promise<Site>;

  /** Soft delete (sets deletedAt); shallow, non-cascading. */
  abstract softDelete(id: string): Promise<void>;
}
