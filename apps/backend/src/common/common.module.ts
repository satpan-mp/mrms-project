import { Global, Module } from '@nestjs/common';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule } from 'nestjs-cls';

import { OutboxWriter } from './events/outbox-writer';
import { PersistenceModule } from './persistence/persistence.module';
import { PRISMA_TX_CLIENT } from './persistence/soft-delete.extension';
import { UnitOfWork } from './persistence/unit-of-work';
import { Clock, SystemClock } from './time/clock';

/**
 * Global common module (frozen Phase 2 contract).
 *
 * Wires the CLS-based Unit of Work: `ClsModule` establishes async context and
 * the `ClsPluginTransactional` binds a `TransactionHost` over the soft-delete-
 * aware Prisma client (`PRISMA_TX_CLIENT`). With `@Transactional()` and default
 * `Propagation.Required`, nested services join the active transaction — no
 * nested Prisma transactions, no explicit context threading.
 *
 * Exposes the shared primitives (Clock, UnitOfWork, OutboxWriter). The
 * `TransactionHost` and `ClsService` are provided globally by the CLS plugin.
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      // Establish a CLS context per HTTP request (correlation/actor propagation).
      // Non-HTTP callers (workers) establish their own context; @Transactional
      // also self-enters a context via TransactionHost.withTransaction.
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PersistenceModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PRISMA_TX_CLIENT,
          }),
        }),
      ],
    }),
  ],
  providers: [{ provide: Clock, useClass: SystemClock }, UnitOfWork, OutboxWriter],
  exports: [Clock, UnitOfWork, OutboxWriter],
})
export class CommonModule {}
