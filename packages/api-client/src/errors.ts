import type { ApiErrorBody } from '@mrms/types';

/**
 * Normalized client-side error carrying the backend error envelope (Doc 09 §5).
 * UI code switches on `code`; `correlationId` links to server logs.
 */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly correlationId: string | undefined;
  readonly details: Record<string, unknown> | undefined;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    correlationId?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.code = params.code;
    this.status = params.status;
    this.correlationId = params.correlationId;
    this.details = params.details;
  }
}

/** Type guard for the standard error envelope. */
export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const error = candidate.error as Record<string, unknown> | undefined;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}
