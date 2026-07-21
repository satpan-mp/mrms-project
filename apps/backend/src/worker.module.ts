import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './shared/config/env';
import { LoggerModule } from './shared/logger/logger.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';

/**
 * Worker composition root. Shares the domain/application code and infrastructure
 * with the API but runs no HTTP server. BullMQ queue processors (calendar sync,
 * no-show sweep, telemetry rollups, watch-channel renewal - Doc 16 §6) are
 * registered here in their respective sprints. Sprint 1A provides the minimum
 * bootstrap (config, logging, Prisma, Redis) so the process is real and ready.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      envFilePath: [join(process.cwd(), '../../.env'), join(process.cwd(), '.env')],
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
  ],
})
export class WorkerModule {}
