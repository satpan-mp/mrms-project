/**
 * Outbox relay store port (Phase 4).
 *
 * Reads and marks `event_outbox` rows for the relay. Not a domain repository —
 * it is relay infrastructure that manages its own short statements. Uses only
 * the existing `published_at` + `attempts` columns and the existing partial
 * index; introduces no schema.
 */

/** A claimed outbox row, projected to camelCase for mapping to an InternalEvent. */
export interface ClaimedOutboxRow {
  readonly id: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  /** The JSON envelope stored in `event_outbox.payload`. */
  readonly payload: unknown;
}

export abstract class OutboxRelayStore {
  /**
   * Atomically claim up to `limit` unpublished, non-poison events, incrementing
   * their attempt count. Concurrency-safe across relay instances.
   */
  abstract claimBatch(limit: number, maxAttempts: number): Promise<ClaimedOutboxRow[]>;

  /** Mark an event delivered (sets `published_at`). */
  abstract markPublished(id: string): Promise<void>;
}
