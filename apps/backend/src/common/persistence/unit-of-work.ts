import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

/**
 * Unit of Work (frozen Phase 2 contract).
 *
 * A thin, explicit wrapper over the CLS `TransactionHost` for callers that
 * cannot use the `@Transactional()` decorator (e.g. Phase 14 background jobs
 * that establish their own CLS context). Semantics:
 *
 * - Join-if-active: `run` uses default `Propagation.Required`, so a nested call
 *   reuses the active transaction instead of opening a new physical one. Nested
 *   Prisma transactions are therefore impossible.
 * - Rollback: the wrapped work commits when it returns normally and rolls back
 *   only when it throws. Returning a `Result.Err` does NOT roll back — services
 *   must validate before writing and throw to abort (throw-to-rollback).
 * - Atomicity: state changes and the EventOutbox write performed inside the same
 *   `run` commit or roll back together.
 */
@Injectable()
export class UnitOfWork {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  /** Run `work` in a transaction, joining the active one if present. */
  run<T>(work: () => Promise<T>): Promise<T> {
    return this.txHost.withTransaction(work);
  }

  /** Whether a transaction is currently active in the CLS context. */
  isActive(): boolean {
    return this.txHost.isTransactionActive();
  }
}
