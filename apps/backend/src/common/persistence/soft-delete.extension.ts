import { Prisma, type PrismaClient } from '@prisma/client';

/**
 * Soft-delete Prisma Client extension (frozen Phase 2 contract).
 *
 * Two components, both applied on the *ambient* client (the interactive
 * transaction client inside a `$transaction`, the base client otherwise), so
 * behaviour is identical inside and outside a unit of work:
 *
 * 1. `query` component — read filtering. For soft-deletable models it appends
 *    `deletedAt: null` to the `where` of read/aggregate operations, so deleted
 *    rows are invisible by default. This is transaction-safe because the
 *    injected `query(args)` executes on the same client that invoked it.
 *
 * 2. `model` component — delete interception. `delete`/`deleteMany` on a
 *    soft-deletable aggregate are rewritten to `update`/`updateMany` that set
 *    `deletedAt`. The rewrite uses `Prisma.getExtensionContext(this)`, which is
 *    bound to the CURRENT client (tx-aware), so the write stays inside the same
 *    transaction. Changing the operation type inside a `query` hook is NOT
 *    transaction-safe, so it is deliberately avoided.
 *
 * Semantics (frozen):
 * - Soft delete is SHALLOW / non-cascading. DB `onDelete: Cascade` fires only on
 *   physical DELETE; children are handled explicitly by services when required.
 * - `findUnique`/`findUniqueOrThrow` are NOT filtered (their `where` only accepts
 *   unique inputs). Repositories use `findFirst({ where: { id } })` for
 *   soft-delete-aware by-id reads.
 * - includeDeleted escape hatch: a caller that sets `deletedAt` explicitly in the
 *   `where` (e.g. `deletedAt: undefined` for all rows, or `{ not: null }` for only
 *   deleted) disables the automatic filter. Repositories expose this via an
 *   `includeDeleted` option.
 */

/** Prisma model names (PascalCase) that own a `deletedAt` column. */
export const SOFT_DELETE_MODELS: ReadonlySet<string> = new Set([
  'Organization',
  'Site',
  'User',
  'Role',
  'Permission',
  'Facility',
  'Room',
  'CalendarProvider',
  'Device',
  'Announcement',
]);

/** Read/aggregate operations whose `where` can safely carry `deletedAt: null`. */
const FILTERED_READ_OPERATIONS: ReadonlySet<string> = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
]);

/** Minimal shape of a model delegate used by the delete→update rewrite. */
interface SoftDeletableDelegate {
  update(args: { where: unknown; data: { deletedAt: Date } }): Promise<unknown>;
  updateMany(args: { where: unknown; data: { deletedAt: Date } }): Promise<unknown>;
}

/** Rewrite a single `delete` into a soft-delete `update` on the ambient client. */
async function softDeleteSingle(this: unknown, args: { where: unknown }): Promise<unknown> {
  const ctx = Prisma.getExtensionContext(this) as unknown as SoftDeletableDelegate;
  return ctx.update({ where: args.where, data: { deletedAt: new Date() } });
}

/** Rewrite a `deleteMany` into a soft-delete `updateMany` on the ambient client. */
async function softDeleteMany(this: unknown, args: { where?: unknown }): Promise<unknown> {
  const ctx = Prisma.getExtensionContext(this) as unknown as SoftDeletableDelegate;
  return ctx.updateMany({ where: args.where ?? {}, data: { deletedAt: new Date() } });
}

const deleteOverride = { delete: softDeleteSingle, deleteMany: softDeleteMany };

/**
 * The soft-delete extension. Read filtering is global across all soft-deletable
 * models; delete→update rewrites are wired per aggregate as phases introduce
 * them (Phase 2 catalog: site, facility, room).
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }): Promise<unknown> {
        if (SOFT_DELETE_MODELS.has(model) && FILTERED_READ_OPERATIONS.has(operation)) {
          const typedArgs = args as { where?: Record<string, unknown> };
          const where = typedArgs.where ?? {};
          // Respect an explicit includeDeleted opt-out: if the caller already set
          // `deletedAt` in the where, leave it untouched.
          if (!Object.prototype.hasOwnProperty.call(where, 'deletedAt')) {
            typedArgs.where = { ...where, deletedAt: null };
          }
        }
        return query(args);
      },
    },
  },
  model: {
    site: deleteOverride,
    facility: deleteOverride,
    room: deleteOverride,
  },
});

/** Apply the soft-delete extension to a base client, returning the extended client. */
export function applySoftDelete(base: PrismaClient) {
  return base.$extends(softDeleteExtension);
}

/** The extended client type (soft-delete aware). Used as the transactional connection. */
export type ExtendedPrismaClient = ReturnType<typeof applySoftDelete>;

/** DI token for the soft-delete-aware Prisma client used by the transactional adapter. */
export const PRISMA_TX_CLIENT = Symbol('PRISMA_TX_CLIENT');
