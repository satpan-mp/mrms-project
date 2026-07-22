import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { type TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

import { CLS_ACTOR_USER_ID, CLS_CORRELATION_ID } from '../context/cls-keys';
import { Clock } from '../time/clock';

import {
  type DomainEventInput,
  type DomainEventMetadata,
  type DomainEventPayloadEnvelope,
} from './domain-event';

/**
 * Transactional outbox writer (frozen Phase 2 contract).
 *
 * Persists a domain event into `event_outbox` using the AMBIENT transaction
 * client, so the event is written in the same physical transaction as the state
 * change that produced it (atomic outbox). If the surrounding unit of work rolls
 * back, the event row is rolled back with it — no event without a committed
 * state change, and no committed state change without its event.
 *
 * The writer never performs external I/O; publishing to consumers is the Phase 4
 * relay's responsibility.
 */
@Injectable()
export class OutboxWriter {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    private readonly clock: Clock,
    private readonly cls: ClsService,
  ) {}

  /** Write one domain event into the outbox within the ambient transaction. */
  async write(event: DomainEventInput): Promise<void> {
    const envelope: DomainEventPayloadEnvelope = {
      eventVersion: event.eventVersion,
      metadata: this.resolveMetadata(event.metadata),
      data: event.payload,
    };

    await this.txHost.tx.eventOutbox.create({
      data: {
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        occurredAt: this.clock.now(),
        payload: envelope as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /** Resolve event metadata from explicit overrides, then CLS, then defaults. */
  private resolveMetadata(overrides?: Partial<DomainEventMetadata>): DomainEventMetadata {
    return {
      correlationId: overrides?.correlationId ?? this.fromCls(CLS_CORRELATION_ID) ?? randomUUID(),
      actorUserId: overrides?.actorUserId ?? this.fromCls(CLS_ACTOR_USER_ID) ?? null,
      causationId: overrides?.causationId ?? null,
    };
  }

  /** Read a string value from the active CLS context, if any. */
  private fromCls(key: string): string | undefined {
    if (!this.cls.isActive()) return undefined;
    const value = this.cls.get<unknown>(key);
    return typeof value === 'string' ? value : undefined;
  }
}
