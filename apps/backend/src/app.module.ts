import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CommonModule } from './common/common.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EventModule } from './modules/event/event.module';
import { HealthModule } from './modules/health/health.module';
import { StatusModule } from './modules/status/status.module';
import { validateEnv, type Env } from './shared/config/env';
import { LoggerModule } from './shared/logger/logger.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';

/**
 * Root application module. Wires cross-cutting infrastructure (config, logging,
 * Prisma, Redis) and the system/health module. Business modules (Auth, Rooms,
 * Sync, ...) are added in their respective sprints per Doc 16.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      // Load the monorepo-root .env in local dev; in containers the values are
      // injected as real environment variables (envFilePath is then ignored).
      envFilePath: [join(process.cwd(), '../../.env'), join(process.cwd(), '.env')],
    }),
    // Global rate limiting (per client IP) — window + max configurable via env.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL', { infer: true }),
            limit: config.get('RATE_LIMIT_LIMIT', { infer: true }),
          },
        ],
      }),
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    CommonModule,
    EventModule,
    CatalogModule,
    StatusModule,
    HealthModule,
  ],
  providers: [
    // Apply the throttler globally; per-route overrides via @Throttle/@SkipThrottle.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
