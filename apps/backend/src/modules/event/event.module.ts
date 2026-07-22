import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { EventPublisher } from './domain/event-publisher';
import { InternalEventBus } from './infrastructure/internal-event-bus';
import { OutboxRelayService } from './infrastructure/outbox-relay.service';
import { OutboxRelayStore } from './infrastructure/outbox-relay.store';
import { PrismaOutboxRelayStore } from './infrastructure/prisma-outbox-relay.store';

/**
 * Event Relay / Internal Event Bus foundation (Phase 4).
 *
 * Binds the `EventPublisher` port to the in-process `InternalEventBus`, the
 * `OutboxRelayStore` port to its Prisma implementation, and runs the
 * `OutboxRelayService` poller. `DiscoveryModule` enables handler discovery.
 * `PrismaService`/`ClsService` come from the global modules. Only `EventPublisher`
 * is exported; feature modules depend solely on the event DOMAIN contracts
 * (`EventHandler`, `@OnDomainEvent`, `InternalEvent`) and are discovered at
 * runtime, so this module never imports them (no circular dependency).
 */
@Module({
  imports: [DiscoveryModule],
  providers: [
    { provide: EventPublisher, useClass: InternalEventBus },
    { provide: OutboxRelayStore, useClass: PrismaOutboxRelayStore },
    OutboxRelayService,
  ],
  exports: [EventPublisher],
})
export class EventModule {}
