import { type InternalEvent } from './internal-event';

/**
 * Event handler contract (Phase 4).
 *
 * A consumer unit that reacts to one or more event types. Handlers live in the
 * feature module they belong to and are the ONLY thing feature modules need from
 * the event context (plus `InternalEvent`). Handlers MUST be idempotent —
 * delivery is at-least-once (see the relay). Pure contract: no NestJS import
 * (the decorator uses `reflect-metadata`, which the app already polyfills, and
 * is read back by Nest's `Reflector`).
 */

/** Reflect-metadata key under which subscribed event types are stored. */
export const ON_DOMAIN_EVENT_KEY = 'mrms:event:on_domain_event';

export abstract class EventHandler {
  abstract handle(event: InternalEvent): Promise<void>;
}

/**
 * Class decorator declaring the event type(s) a handler subscribes to. The
 * internal bus discovers decorated providers at startup and builds its
 * `eventType -> handlers[]` map.
 */
export function OnDomainEvent(...eventTypes: string[]): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ON_DOMAIN_EVENT_KEY, eventTypes, target);
  };
}
