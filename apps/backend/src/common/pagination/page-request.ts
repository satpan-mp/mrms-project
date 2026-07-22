import { type SortSpec } from './sort';

/**
 * Pagination request (frozen Phase 2 contract).
 *
 * Offset-based pagination for the catalog (small tables). High-volume tables in
 * later phases may introduce keyset pagination additively. `page` is 1-based.
 * Values are normalized and clamped to safe bounds via {@link normalizePageRequest}.
 */

export interface PageRequestInput {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: readonly SortSpec[];
}

export interface PageRequest {
  readonly page: number;
  readonly pageSize: number;
  readonly sort?: readonly SortSpec[];
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Clamp/normalize raw pagination input into a safe {@link PageRequest}. */
export function normalizePageRequest(input?: PageRequestInput): PageRequest {
  const page = clampInt(input?.page, DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER);
  const pageSize = clampInt(input?.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  return { page, pageSize, sort: input?.sort };
}

/** Convert a normalized page request into Prisma `skip`/`take`. */
export function toSkipTake(request: PageRequest): { skip: number; take: number } {
  return { skip: (request.page - 1) * request.pageSize, take: request.pageSize };
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  const int = Math.trunc(value);
  if (int < min) return min;
  if (int > max) return max;
  return int;
}
