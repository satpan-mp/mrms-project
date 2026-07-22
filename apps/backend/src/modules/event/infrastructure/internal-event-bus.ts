import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import { EventHandler, ON_DOMAIN_EVENT_KEY } from '../domain/event-handler';
import { EventPublisher } from '../domain/event-publisher';
import { type InternalEvent } from '../domain/internal-event';

/** Thrown when one or more handlers fail; signals the relay not to mark published. */
class EventDispatchError extends Error {
  constructor(eventType: string, eventId: string, failedCount: number) {
    super(`${failedCount} handler(s) failed for ${eventType} [${eventId}]`);
    this.name = 'EventDispatchError';
  }
}

/** Minimal duck-typed handler shape (avoids requiring `instanceof EventHandler`). */
type HandlerLike = { handle: (event: InternalEvent) => Promise<void> };

/**
 * In-process internal event bus (Phase 4) — the `EventPublisher` implementation.
 *
 * At startup it discovers every provider decorated with `@OnDomainEvent` (via
 * `DiscoveryService` + `Reflector`) and builds an `eventType -> handlers[]` map.
 * `publish` dispatches an event to its handlers sequentially and deterministically
 * with per-handler error isolation: a failing handler is caught and logged, the
 * remaining handlers still run, and if any failed the method throws so the relay
 * leaves the event unpublished for retry (at-least-once). Events with no
 * registered handler are ignored.
 */
@Injectable()
export class InternalEventBus extends EventPublisher implements OnModuleInit {
  private readonly logger = new Logger(InternalEventBus.name);
  private readonly handlers = new Map<string, HandlerLike[]>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  onModuleInit(): void {
    this.registerHandlers();
  }

  async publish(event: InternalEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers || handlers.length === 0) {
      this.logger.debug(`No handler registered for "${event.eventType}"; ignoring`);
      return;
    }

    const failures: unknown[] = [];
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        failures.push(error);
        this.logger.error(
          `Handler "${(handler as object).constructor.name}" failed for "${event.eventType}" [${event.id}]`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    if (failures.length > 0) {
      throw new EventDispatchError(event.eventType, event.id, failures.length);
    }
  }

  /** Discover `@OnDomainEvent`-decorated providers and index them by event type. */
  private registerHandlers(): void {
    for (const wrapper of this.discovery.getProviders()) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const eventTypes = this.reflector.get<string[] | undefined>(
        ON_DOMAIN_EVENT_KEY,
        instance.constructor,
      );
      if (!eventTypes || eventTypes.length === 0) continue;
      if (!this.isHandler(instance)) continue;

      for (const eventType of eventTypes) {
        const list = this.handlers.get(eventType) ?? [];
        list.push(instance);
        this.handlers.set(eventType, list);
      }
    }
    this.logger.log(`Registered handlers for ${this.handlers.size} event type(s)`);
  }

  private isHandler(instance: object): instance is HandlerLike {
    return (
      instance instanceof EventHandler ||
      typeof (instance as Partial<HandlerLike>).handle === 'function'
    );
  }
}
