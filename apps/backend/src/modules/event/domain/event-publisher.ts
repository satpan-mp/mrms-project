import { type InternalEvent } from './internal-event';

/**
 * Event publisher port (Phase 4).
 *
 * The single delivery interface the relay calls to fan an event out to handlers.
 * Domain services NEVER use this (they write to the outbox via `OutboxWriter`);
 * only the relay publishes. Abstracting delivery here is the swap point for a
 * future external broker (Redis/RabbitMQ/Kafka) with no change to handlers or
 * the domain layer.
 */
export abstract class EventPublisher {
  abstract publish(event: InternalEvent): Promise<void>;
}
