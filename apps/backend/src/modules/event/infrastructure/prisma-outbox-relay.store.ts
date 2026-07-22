import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../shared/prisma/prisma.service';

import { type ClaimedOutboxRow, OutboxRelayStore } from './outbox-relay.store';

/**
 * Prisma implementation of the relay store.
 *
 * Uses the base `PrismaService` directly (the relay runs outside request/CLS
 * scope and manages its own short statements). Claiming is a single atomic
 * `UPDATE ... RETURNING` whose subquery uses `FOR UPDATE SKIP LOCKED`, so
 * multiple relay instances never claim the same row and locks are released
 * immediately. Ordering is by `id` (uuid v7 = creation order). Poison events
 * (`attempts >= maxAttempts`) are excluded from claiming.
 */
@Injectable()
export class PrismaOutboxRelayStore extends OutboxRelayStore {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async claimBatch(limit: number, maxAttempts: number): Promise<ClaimedOutboxRow[]> {
    return this.prisma.$queryRaw<ClaimedOutboxRow[]>(Prisma.sql`
      UPDATE "event_outbox"
      SET attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM "event_outbox"
        WHERE published_at IS NULL AND attempts < ${maxAttempts}
        ORDER BY id
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING
        id,
        event_type AS "eventType",
        aggregate_type AS "aggregateType",
        aggregate_id AS "aggregateId",
        occurred_at AS "occurredAt",
        payload;
    `);
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE "event_outbox" SET published_at = now() WHERE id = ${id};`,
    );
  }
}
