import { createApiClient } from '@mrms/api-client';

import { env } from '../config/env';
import { readKioskConfig } from './kioskConfig';

/**
 * Display API client. Authenticates with the room-scoped device token from the
 * kiosk URL (Doc 12 §3). Sprint 1A calls only public system endpoints; the token
 * getter is wired now so device-authenticated calls work unchanged in Sprint 1E.
 */
export const api = createApiClient({
  baseUrl: env.apiBaseUrl,
  getDeviceToken: () => readKioskConfig().deviceToken,
});
