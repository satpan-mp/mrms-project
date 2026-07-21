import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

/**
 * Thin service over the shared ioredis client. Used for caching, pub/sub, and
 * Socket.IO scale-out (added in later sprints). Exposes a readiness probe for
 * the health check.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }

  /** Readiness probe used by the health check (`PONG` on success). */
  async isHealthy(): Promise<boolean> {
    const reply = await this.client.ping();
    return reply === 'PONG';
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }
}
