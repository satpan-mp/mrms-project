/**
 * Domain error hierarchy (frozen Phase 2 contract).
 *
 * `DomainError` models EXPECTED, business-meaningful failures returned from
 * domain services inside a `Result`. It is transport-agnostic: it carries no
 * HTTP status. Conversion to a transport shape (HTTP, worker log, relay retry)
 * happens exactly once at the outermost adapter — never inside the domain layer.
 *
 * Because `DomainError` extends `Error`, it may also be thrown to abort a unit
 * of work (throw-to-rollback); the transactional boundary catches it and returns
 * it as `Err`.
 */

/** Coarse classification used by adapters to pick a transport representation. */
export type DomainErrorKind = 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'BUSINESS_RULE';

export abstract class DomainError extends Error {
  /** Stable classification for adapter-level mapping. */
  abstract readonly kind: DomainErrorKind;

  /**
   * Stable, machine-readable code (e.g. `catalog.site.not_found`). Safe to expose
   * to clients and to assert against in tests; never localized.
   */
  readonly code: string;

  /** Optional structured context (ids, offending fields). Must not carry secrets. */
  readonly details?: Readonly<Record<string, unknown>>;

  protected constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    // Restore prototype chain + set a useful name for logs/stacks.
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}

/** The requested aggregate/entity does not exist (or is soft-deleted). */
export class NotFoundError extends DomainError {
  readonly kind = 'NOT_FOUND' as const;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
  }
}

/** A uniqueness/state conflict prevents the operation (e.g. duplicate natural key). */
export class ConflictError extends DomainError {
  readonly kind = 'CONFLICT' as const;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
  }
}

/** Input failed a domain invariant/shape check before any write occurred. */
export class ValidationError extends DomainError {
  readonly kind = 'VALIDATION' as const;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
  }
}

/** A business rule forbids the operation given valid, well-formed input. */
export class BusinessRuleError extends DomainError {
  readonly kind = 'BUSINESS_RULE' as const;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details);
  }
}

/** Runtime guard usable by adapters that receive `unknown` thrown values. */
export function isDomainError(value: unknown): value is DomainError {
  return value instanceof DomainError;
}
