import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { ApiClientError, isApiErrorBody } from './errors';

export interface ApiClientOptions {
  /** Base URL including the version prefix, e.g. `http://localhost:3000/api/v1`. */
  baseUrl: string;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Returns the current bearer access token (JWT), or null when unauthenticated. */
  getAccessToken?: () => string | null | undefined;
  /** Room-scoped device token for kiosk (display) requests. */
  getDeviceToken?: () => string | null | undefined;
}

/**
 * Creates a configured Axios instance for the MRMS API with:
 *  - Authorization (JWT) / X-Device-Token injection,
 *  - normalization of the standard error envelope into `ApiClientError`.
 *
 * Token refresh (401 handling) is wired in Sprint 1B when auth lands; the hook
 * points (`getAccessToken`) are provided now so callers integrate cleanly.
 */
export function createHttpClient(options: ApiClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseUrl,
    timeout: options.timeoutMs ?? 15_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = options.getAccessToken?.();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    const deviceToken = options.getDeviceToken?.();
    if (deviceToken) {
      config.headers.set('X-Device-Token', deviceToken);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;
      const body = error.response?.data;

      if (isApiErrorBody(body)) {
        return Promise.reject(
          new ApiClientError({
            code: body.error.code,
            message: body.error.message,
            status,
            correlationId: body.correlationId,
            details: body.error.details,
          }),
        );
      }

      // Network error, timeout, or non-enveloped response.
      return Promise.reject(
        new ApiClientError({
          code: status === 0 ? 'NETWORK_ERROR' : 'UNEXPECTED_ERROR',
          message:
            status === 0
              ? 'Unable to reach the server. Check your connection and try again.'
              : (error.message ?? 'An unexpected error occurred.'),
          status,
        }),
      );
    },
  );

  return instance;
}
