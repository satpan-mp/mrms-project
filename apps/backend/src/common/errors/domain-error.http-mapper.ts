import { HttpException, HttpStatus } from '@nestjs/common';

import { type DomainError, type DomainErrorKind } from './domain-error';

/**
 * Boundary adapter: convert a transport-agnostic `DomainError` into a NestJS
 * `HttpException`. This is the ONE place the domain error model meets HTTP and
 * is used only by HTTP controllers (Phase 7 Admin API). Non-HTTP adapters
 * (Phase 4 outbox relay, Phase 14 workers) handle `DomainError` differently
 * (log + retry / dead-letter) and must not use this mapper.
 *
 * The exception body carries the stable domain `code` and `message` (plus any
 * non-sensitive `details`). The global `AllExceptionsFilter` renders the final
 * MRMS envelope from the thrown `HttpException`.
 */

/** Map the coarse domain classification to an HTTP status code. */
function statusForKind(kind: DomainErrorKind): HttpStatus {
  switch (kind) {
    case 'NOT_FOUND':
      return HttpStatus.NOT_FOUND;
    case 'CONFLICT':
      return HttpStatus.CONFLICT;
    case 'VALIDATION':
      return HttpStatus.BAD_REQUEST;
    case 'BUSINESS_RULE':
      return HttpStatus.UNPROCESSABLE_ENTITY;
    default:
      // Exhaustiveness guard: adding a new kind forces a compile error here.
      return assertNeverKind(kind);
  }
}

function assertNeverKind(kind: never): never {
  throw new Error(`Unhandled DomainErrorKind: ${String(kind)}`);
}

/** Convert a `DomainError` into an `HttpException` for the HTTP boundary. */
export function domainErrorToHttpException(error: DomainError): HttpException {
  const status = statusForKind(error.kind);
  return new HttpException(
    {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
    status,
  );
}
