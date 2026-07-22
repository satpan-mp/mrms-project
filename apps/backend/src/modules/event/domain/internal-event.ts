import { type DomainEventMetadata } from '../../../common/events/domain-event';

/**
 * In-memory event envelope (Phase 4).
 *
 * The fully reconstructed, immutable event that the relay hands to the internal
 * bus and its handlers. Built from an `event_outbox` row (columns + parsed JSON
 * envelope). Reuses the frozen `DomainEventMetadata` shape. Pure contract — no
 * Prisma, no NestJS, no infrastructure.
 */

/** Alias of the frozen event metadata carried by every event. */
export type EventMetadata = DomainEventMetadata;

export interface InternalEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  /** Outbox row id (uuid v7); stable idempotency key for consumers. */
  readonly id: string;
  readonly eventType: string;
  readonly eventVersion: number;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly metadata: EventMetadata;
  readonly payload: TPayload;
}
