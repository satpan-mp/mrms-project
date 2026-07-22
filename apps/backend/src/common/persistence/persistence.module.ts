import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';

import { applySoftDelete, PRISMA_TX_CLIENT } from './soft-delete.extension';

/**
 * Provides the soft-delete-aware Prisma client used as the transactional
 * connection. The extended client is derived from the single `PrismaService`
 * instance (which still owns connection lifecycle + health), so `PrismaService`
 * remains the one and only Prisma client; the extension is a thin wrapper over
 * the same connection pool.
 *
 * This module is imported by the `ClsPluginTransactional` adapter so the
 * `TransactionHost` resolves `PRISMA_TX_CLIENT` as its connection.
 */
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PRISMA_TX_CLIENT,
      useFactory: (prisma: PrismaService) => applySoftDelete(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [PRISMA_TX_CLIENT],
})
export class PersistenceModule {}
