import { resolveSortOrDefault, type SortDirection, type SortSpec } from '../pagination/sort';

/**
 * Build a deterministic Prisma `orderBy` from an already-validated sort.
 *
 * Mechanical only (no allow-list validation — that happens at the service
 * boundary via `validateSort`). Maps the requested sort (or the aggregate's
 * default) to `orderBy` and appends a unique `id` tiebreaker so ordering is
 * total and offset pagination is reproducible. The result is a plain array that
 * each repository casts to its model-specific `OrderByWithRelationInput`.
 */
export function buildOrderBy(
  requested: readonly SortSpec[] | undefined,
  fallback: readonly SortSpec[],
): Array<Record<string, SortDirection>> {
  const resolved = resolveSortOrDefault(requested, fallback);
  const orderBy = resolved.map((spec) => ({ [spec.field]: spec.direction }));
  if (!resolved.some((spec) => spec.field === 'id')) {
    orderBy.push({ id: 'asc' });
  }
  return orderBy;
}
