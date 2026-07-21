import { Global, Logger, Module, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { Env } from '../config/env';

import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService<Env, true>): Redis => {
    const logger = new Logger('RedisClient');
    const client = new Redis(config.get('REDIS_URL', { infer: true }), {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2_000),
    });
    client.on('connect', () => logger.log('Redis connected'));
    client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    return client;
  },
};

/** Global Redis module exposing the ioredis client + RedisService. */
@Global()
@Module({
  providers: [redisClientProvider, RedisService],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
