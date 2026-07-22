import { type Organization } from '@prisma/client';

/**
 * Organization repository port (read-only in Phase 2).
 *
 * The catalog layer only needs to resolve/validate the owning organization when
 * creating sites and rooms; organization mutation belongs to a later phase.
 * Concrete implementation is bound in `CatalogModule`.
 */
export abstract class OrganizationRepository {
  /** Fetch an active organization by id, or null when absent/soft-deleted. */
  abstract findById(id: string): Promise<Organization | null>;

  /** Whether an active organization exists for the given id. */
  abstract existsById(id: string): Promise<boolean>;
}
