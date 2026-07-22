/**
 * Domain event envelope (frozen Phase 2 contract).
 *
 * The immutable event shape consumed by every downstream phase (Phase 4 relay,
 * Phase 11 analytics, Phase 12 notification, Phase 13 audit). It maps onto the
 * existing `event_outbox` columns plus the JSON `payload` — NO migration:
 *
 *   id            -> event_outbox.id            (uuid v7, DB default)
 *   eventType     -> event_outbox.event_type
 *   aggregateType -> event_outbox.aggregate_type
 *   aggregateId   -> event_outbox.aggregate_id
 *   occurredAt    -> event_outbox.occurred_at   (from the injected Clock)
 *   eventVersion  -> payload.eventVersion
 *   metadata      -> payload.metadata
 *   payload       -> payload.data
 *
 * Versioning: additive payload changes keep `eventVersion`; breaking changes
 * increment it. Consumers switch on `(eventType, eventVersion)` and ignore
 * unknown types/versions (forward-compatible).
 */

/** Tracing/audit/causation metadata carried by every event. */
export interface DomainEventMetadata {
  /** End-to-end correlation id (from CLS/request context, else generated). */
  readonly correlationId: string;
  /** Acting user id; null for system-originated events (and until auth, Phase 5). */
  readonly actorUserId: string | null;
  /** Id of the event/command that caused this one; null when root. */
  readonly causationId: string | null;
}

/** What a domain service supplies when emitting an event. */
export interface DomainEventInput<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly eventType: string;
  readonly eventVersion: number;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: TPayload;
  /** Optional overrides; unspecified fields are resolved from CLS/defaults. */
  readonly metadata?: Partial<DomainEventMetadata>;
}

/** The JSON envelope persisted in `event_outbox.payload`. */
export interface DomainEventPayloadEnvelope<TPayload = Record<string, unknown>> {
  readonly eventVersion: number;
  readonly metadata: DomainEventMetadata;
  readonly data: TPayload;
}
