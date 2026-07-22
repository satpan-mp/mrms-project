import { type PageRequest } from './page-request';

/**
 * A page of results plus the metadata needed by clients to navigate. Produced by
 * repositories from a total count and the current {@link PageRequest}.
 */
export interface Page<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

/** Build a {@link Page} from the fetched items, total count, and request. */
export function buildPage<T>(
  items: readonly T[],
  totalItems: number,
  request: PageRequest,
): Page<T> {
  return {
    items,
    page: request.page,
    pageSize: request.pageSize,
    totalItems,
    totalPages: request.pageSize > 0 ? Math.ceil(totalItems / request.pageSize) : 0,
  };
}
