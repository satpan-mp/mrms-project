import { type Facility } from '@prisma/client';

import { type Page } from '../../../common/pagination/page';
import { type PageRequest } from '../../../common/pagination/page-request';

import { type FindByIdOptions } from './site.repository';

/** Fields a `Facility` list may be sorted by (allow-list; deterministic order appends id). */
export const FACILITY_SORTABLE_FIELDS = ['name', 'createdAt'] as const;

export interface CreateFacilityInput {
  readonly name: string;
  readonly icon?: string | null;
}

export interface UpdateFacilityInput {
  readonly name?: string;
  readonly icon?: string | null;
}

export interface FacilityFilter {
  /** Case-insensitive match against name. */
  readonly search?: string;
}

/**
 * Facility repository port (Facility aggregate).
 *
 * `name` is the natural key (globally unique). Reads are active-only by default.
 */
export abstract class FacilityRepository {
  abstract findById(id: string, options?: FindByIdOptions): Promise<Facility | null>;

  abstract findByName(name: string): Promise<Facility | null>;

  /** Resolve a set of facilities by id (active only); used to validate room links. */
  abstract findManyByIds(ids: readonly string[]): Promise<Facility[]>;

  abstract list(filter: FacilityFilter, page: PageRequest): Promise<Page<Facility>>;

  abstract create(input: CreateFacilityInput): Promise<Facility>;

  abstract update(id: string, input: UpdateFacilityInput): Promise<Facility>;

  /** Soft delete (sets deletedAt); shallow, non-cascading. */
  abstract softDelete(id: string): Promise<void>;
}
