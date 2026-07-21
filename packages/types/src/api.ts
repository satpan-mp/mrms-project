/**
 * REST API envelope + system endpoint contracts (Doc 09 - API Specification).
 * The error envelope shape here is authoritative for both the backend global
 * exception filter and the frontend api-client error mapping.
 */

/** Standard error envelope returned by every non-2xx response (Doc 09 §1, §5). */
export interface ApiErrorBody {
  error: {
    /** Stable UPPER_SNAKE_CASE identifier clients switch on. */
    code: string;
    /** Human-readable, safe-to-display message (never leaks internals). */
    message: string;
    /** Optional structured context. */
    details?: Record<string, unknown>;
  };
  /** Ties the response to server logs. */
  correlationId: string;
}

/** Envelope for paginated collections (Doc 09 §1). */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

/** Overall service health (aggregated by the readiness endpoint). */
export type HealthState = 'ok' | 'error' | 'shutting_down';

/** Individual dependency health indicator. */
export interface HealthIndicator {
  status: 'up' | 'down';
  [detail: string]: unknown;
}

/** `GET /health` response (Terminus-compatible shape). */
export interface HealthResponse {
  status: HealthState;
  info: Record<string, HealthIndicator>;
  error: Record<string, HealthIndicator>;
  details: Record<string, HealthIndicator>;
}

/** `GET /version` response - build/version metadata. */
export interface VersionResponse {
  name: string;
  version: string;
  /** Deployment environment (development | staging | production). */
  environment: string;
  /** Short git commit SHA when injected at build time, otherwise "unknown". */
  commit: string;
  /** ISO-8601 UTC timestamp of the response. */
  timestamp: string;
}

/** `GET /ping` response - minimal liveness signal. */
export interface PingResponse {
  message: 'pong';
  timestamp: string;
}
