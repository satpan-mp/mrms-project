import { createApiClient } from '@mrms/api-client';

import { env } from '../config/env';

/**
 * Singleton API client for the Admin app. The access-token getter is wired to
 * the auth store in Sprint 1B; for now the foundation calls only public system
 * endpoints (health/version/ping).
 */
export const api = createApiClient({
  baseUrl: env.apiBaseUrl,
  getAccessToken: () => null,
});
