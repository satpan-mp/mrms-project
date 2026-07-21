import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { APP_NAME, APP_VERSION } from './shared/config/app-info';
import { WorkerModule } from './worker.module';

/**
 * BullMQ worker process bootstrap. Boots the DI container (config, logging,
 * Prisma, Redis), then stays alive to consume queues (registered per sprint).
 * The open Redis connection keeps the event loop active; shutdown hooks ensure
 * a clean disconnect on SIGTERM/SIGINT.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const logger = app.get(Logger);
  logger.log(`${APP_NAME}-worker v${APP_VERSION} started; awaiting queued jobs`, 'Worker');
}

void bootstrap();
