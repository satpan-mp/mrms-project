import { ValidationError } from '../errors/domain-error';

/**
 * Sorting contract (frozen Phase 2 contract).
 *
 * Offset pagination requires a stable, deterministic `ORDER BY`. Callers may
 * request one or more sort fields, but every field must be on the aggregate's
 * allow-list — unknown fields are rejected. Repositories additionally append a
 * unique tiebreaker (`id`) so ordering is always total and pagination is
 * reproducible.
 *
 * Result-lifecycle rule (frozen): sort validation is an EXPECTED failure. It is
 * performed at the domain-service boundary via {@link validateSort}, which
 * RETURNS a `ValidationError` (never throws) so the service can surface it as
 * `Result.Err`. Repositories stay mechanical: {@link resolveSortOrDefault}
 * assumes the sort was already validated and performs no business validation.
 */

export type SortDirection = 'asc' | 'desc';

export interface SortSpec {
  readonly field: string;
  readonly direction: SortDirection;
}

/**
 * Validate a requested sort against an aggregate's allow-list.
 *
 * @returns a `ValidationError` describing the first unsortable field, or `null`
 *          when the sort is absent/empty or every field is allowed. Never throws.
 */
export function validateSort(
  requested: readonly SortSpec[] | undefined,
  allowed: readonly string[],
): ValidationError | null {
  if (!requested || requested.length === 0) return null;

  for (const spec of requested) {
    if (!allowed.includes(spec.field)) {
      return new ValidationError(
        'common.pagination.invalid_sort_field',
        `Sort field "${spec.field}" is not sortable.`,
        { field: spec.field, allowed: [...allowed] },
      );
    }
  }
  return null;
}

/**
 * Mechanical resolution used by repositories: return the requested sort (assumed
 * already validated by the service) or the aggregate's deterministic default
 * when none was requested. Performs no allow-list validation and never throws.
 */
export function resolveSortOrDefault(
  requested: readonly SortSpec[] | undefined,
  fallback: readonly SortSpec[],
): SortSpec[] {
  if (!requested || requested.length === 0) {
    return [...fallback];
  }
  return requested.map((spec) => ({ field: spec.field, direction: spec.direction }));
}
