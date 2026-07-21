/** Centralized React Query cache keys (single source of truth to avoid drift). */
export const queryKeys = {
  system: {
    health: ['system', 'health'] as const,
    version: ['system', 'version'] as const,
    ping: ['system', 'ping'] as const,
  },
} as const;
