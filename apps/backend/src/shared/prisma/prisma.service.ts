import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import type { Env } from '../config/env';

/**
 * Prisma client wrapper. Connects on module init and disconnects on shutdown so
 * the pool is managed by Nest's lifecycle. Repositories depend on this service
 * behind their ports (Clean Architecture / Repository Pattern).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<Env, true>) {
    // Emit warnings/errors to stdout in every environment; add verbose query
    // logging only in development (avoids noisy/sensitive logs in production).
    super({
      log:
        config.get('APP_ENV', { infer: true }) === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  /** Lightweight readiness probe used by the health check. */
  async isHealthy(): Promise<boolean> {
    await this.$queryRaw`SELECT 1`;
    return true;
  }
}
