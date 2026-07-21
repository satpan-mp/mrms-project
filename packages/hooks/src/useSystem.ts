import type { ApiClient } from '@mrms/api-client';
import type { HealthResponse, VersionResponse } from '@mrms/types';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from './queryKeys';

/**
 * Health poll. Used by the app shells to surface backend connectivity. Polls on
 * an interval so the UI reflects backend availability without a manual refresh.
 */
export function useHealth(api: ApiClient, refetchIntervalMs = 30_000): UseQueryResult<HealthResponse> {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: () => api.system.health(),
    refetchInterval: refetchIntervalMs,
    staleTime: 10_000,
    retry: 1,
  });
}

/** Backend version/build metadata (rendered in the app footer/about). */
export function useVersion(api: ApiClient): UseQueryResult<VersionResponse> {
  return useQuery({
    queryKey: queryKeys.system.version,
    queryFn: () => api.system.version(),
    staleTime: Infinity,
    retry: 1,
  });
}
