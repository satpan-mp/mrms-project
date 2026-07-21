import { createHttpClient, type ApiClientOptions } from './client';
import { createSystemApi } from './system';

export * from './client';
export * from './errors';
export * from './system';

/**
 * Assembles the full typed MRMS API client. As modules land each sprint, their
 * endpoint groups are added here (e.g. `rooms`, `bookings`, `auth`).
 */
export function createApiClient(options: ApiClientOptions) {
  const http = createHttpClient(options);
  return {
    http,
    system: createSystemApi(http),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
