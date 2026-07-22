import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

/**
 * The ambient transaction-aware Prisma client type exposed by `TransactionHost`.
 * Inside a `@Transactional()` method this resolves to the interactive
 * transaction client; outside one, to the base (soft-delete-aware) client.
 */
export type AmbientPrismaClient = TransactionHost<TransactionalAdapterPrisma>['tx'];

/**
 * Base class for Prisma repositories (frozen Phase 2 contract).
 *
 * Repositories NEVER open transactions and NEVER inject `PrismaService`
 * directly. They obtain the ambient client from `TransactionHost`, so every
 * read/write automatically joins whatever transaction the calling domain
 * service opened (or runs standalone when none is active). This is how nested
 * services share a single physical transaction with no explicit context
 * threading.
 *
 * Two mandatory repository rules (frozen), because the soft-delete extension has
 * documented Prisma limitations:
 *
 * 1. Canonical soft delete. A soft-deletable aggregate is deleted ONLY by setting
 *    `deletedAt` via `update`/`updateMany` (see each repository's `softDelete`).
 *    Repositories MUST NOT call Prisma `delete`/`deleteMany` on a soft-deletable
 *    model — the extension's delete→update override exists only as a defensive
 *    guard and must never be depended on. A genuine hard `delete`/`deleteMany` is
 *    permitted ONLY on non-soft-deletable link tables (e.g. `RoomFacility` during
 *    link replacement), which have no `deletedAt` column.
 *
 * 2. Explicit relation filtering. The soft-delete `query` extension does NOT
 *    filter nested relation reads (Prisma: query extensions do not support nested
 *    operations). Therefore every `include`/`select` that traverses a
 *    soft-deletable relation MUST add an explicit `deletedAt: null` filter on that
 *    relation. No implicit filtering may be relied upon.
 */
export abstract class BaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  /** The ambient (transaction-aware, soft-delete-aware) Prisma client. */
  protected get client(): AmbientPrismaClient {
    return this.txHost.tx;
  }
}
