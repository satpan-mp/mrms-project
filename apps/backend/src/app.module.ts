import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './modules/health/health.module';
import { validateEnv } from './shared/config/env';
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
    LoggerModule,
    PrismaModule,
    RedisModule,
    HealthModule,
  ],
})
export class AppModule {}
