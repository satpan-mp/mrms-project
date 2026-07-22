import {
  type DomainEventMetadata,
  type DomainEventPayloadEnvelope,
} from '../../../common/events/domain-event';
import { type InternalEvent } from '../domain/internal-event';

import { type ClaimedOutboxRow } from './outbox-relay.store';

/**
 * Pure mapper: reconstruct an immutable `InternalEvent` from a claimed
 * `event_outbox` row. Columns provide id/type/aggregate/occurredAt; the JSON
 * envelope provides eventVersion/metadata/payload. Defensive against malformed
 * rows (missing envelope fields fall back to safe defaults). No side effects.
 */
export function mapOutboxRowToInternalEvent(row: ClaimedOutboxRow): InternalEvent {
  const envelope = (row.payload ?? {}) as Partial<DomainEventPayloadEnvelope>;
  const metadata = (envelope.metadata ?? {}) as Partial<DomainEventMetadata>;

  return {
    id: row.id,
    eventType: row.eventType,
    eventVersion: typeof envelope.eventVersion === 'number' ? envelope.eventVersion : 1,
    aggregateType: row.aggregateType,
    aggregateId: row.aggregateId,
    occurredAt: row.occurredAt,
    metadata: {
      correlationId: typeof metadata.correlationId === 'string' ? metadata.correlationId : '',
      actorUserId: typeof metadata.actorUserId === 'string' ? metadata.actorUserId : null,
      causationId: typeof metadata.causationId === 'string' ? metadata.causationId : null,
    },
    payload: (envelope.data ?? {}) as Record<string, unknown>,
  };
}
