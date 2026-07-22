import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { CLS_ACTOR_USER_ID, CLS_CORRELATION_ID } from '../../../common/context/cls-keys';
import { EventPublisher } from '../domain/event-publisher';
import { type InternalEvent } from '../domain/internal-event';
import {
  RELAY_BATCH_SIZE,
  RELAY_MAX_ATTEMPTS,
  RELAY_POLL_INTERVAL_MS,
} from '../domain/relay-config';

import { OutboxRelayStore } from './outbox-relay.store';
import { mapOutboxRowToInternalEvent } from './outbox-row.mapper';

/**
 * Outbox relay poller (Phase 4).
 *
 * Self-scheduling background loop: claim a batch → map each row → publish to the
 * internal bus → mark published. Guarantees:
 * - A single iteration at a time (no overlapping polls).
 * - Greedy drain: a full batch triggers an immediate next poll; otherwise it
 *   waits `RELAY_POLL_INTERVAL_MS`.
 * - Handlers run OUTSIDE the claim statement, each within a fresh per-event CLS
 *   context so they may safely use `@Transactional` / `OutboxWriter` (event
 *   chaining). The context is seeded with the event's correlation/actor so
 *   chained events inherit them.
 * - At-least-once: `markPublished` runs only after a successful publish; a
 *   failure leaves the event unpublished (attempts already incremented by the
 *   claim) for retry until it becomes poison.
 */
@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private running = false;
  private polling = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly store: OutboxRelayStore,
    private readonly publisher: EventPublisher,
    private readonly cls: ClsService,
  ) {}

  onModuleInit(): void {
    this.running = true;
    this.scheduleNext(0);
    this.logger.log('Outbox relay started');
  }

  onModuleDestroy(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.logger.log('Outbox relay stopped');
  }

  private scheduleNext(delayMs: number): void {
    if (!this.running) return;
    this.timer = setTimeout(() => {
      void this.tick();
    }, delayMs);
  }

  private async tick(): Promise<void> {
    if (this.polling) {
      // Never overlap cycles; try again after the interval.
      this.scheduleNext(RELAY_POLL_INTERVAL_MS);
      return;
    }

    this.polling = true;
    let claimed = 0;
    try {
      claimed = await this.pollOnce();
    } catch (error) {
      this.logger.error(
        'Outbox relay poll cycle failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.polling = false;
    }

    // Greedy drain: if the batch was full there is likely more work.
    this.scheduleNext(claimed >= RELAY_BATCH_SIZE ? 0 : RELAY_POLL_INTERVAL_MS);
  }

  private async pollOnce(): Promise<number> {
    const rows = await this.store.claimBatch(RELAY_BATCH_SIZE, RELAY_MAX_ATTEMPTS);
    for (const row of rows) {
      await this.processEvent(mapOutboxRowToInternalEvent(row));
    }
    return rows.length;
  }

  private async processEvent(event: InternalEvent): Promise<void> {
    await this.cls.run(async () => {
      this.cls.set(CLS_CORRELATION_ID, event.metadata.correlationId);
      if (event.metadata.actorUserId) {
        this.cls.set(CLS_ACTOR_USER_ID, event.metadata.actorUserId);
      }

      try {
        await this.publisher.publish(event);
        await this.store.markPublished(event.id);
      } catch (error) {
        this.logger.warn(
          `Delivery failed for "${event.eventType}" [${event.id}]; will retry next cycle`,
          error instanceof Error ? error.message : String(error),
        );
      }
    });
  }
}
