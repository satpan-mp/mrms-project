/**
 * Result pattern (frozen Phase 2 contract).
 *
 * A transport-agnostic discriminated union representing either success (`Ok`)
 * or an expected, typed failure (`Err`). Domain services return
 * `Result<T, DomainError>`; repositories never return `Result` (they return
 * `data | null` and throw on infrastructure faults). Unexpected/infrastructure
 * errors are thrown, not modelled as `Err`.
 *
 * Rollback rule (see UnitOfWork): inside a transaction, returning `Err` does NOT
 * roll back — Prisma commits on a normally-returned value. Any failure that must
 * abort a unit of work is thrown; the transactional boundary converts the throw
 * back into `Err` for the caller. Validation therefore runs before any write.
 */

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

/** Wrap a success value. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Wrap an expected, typed failure. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard: narrow a `Result` to its success branch. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/** Type guard: narrow a `Result` to its failure branch. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/** Map the success value, preserving the error branch. */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/** Map the error value, preserving the success branch. */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/** Return the success value or a fallback when the result is an error. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
