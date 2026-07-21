import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import type { Env } from '../config/env';

/**
 * Structured JSON logging with a per-request correlation id (NFR-OBS-1).
 * - Correlation id comes from an inbound `x-correlation-id` header when present,
 *   otherwise a UUID is generated and echoed back on the response.
 * - Secrets/tokens are redacted from logs.
 * - Pretty printing in development only.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isDev = config.get('APP_ENV', { infer: true }) === 'development';
        return {
          pinoHttp: {
            level: config.get('APP_LOG_LEVEL', { infer: true }),
            genReqId: (req: IncomingMessage, res: ServerResponse): string => {
              const header = req.headers['x-correlation-id'];
              const id = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
              res.setHeader('X-Correlation-Id', id);
              return id;
            },
            customProps: (req: IncomingMessage) => ({
              correlationId: String((req as { id?: unknown }).id ?? ''),
            }),
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["x-device-token"]',
                'res.headers["set-cookie"]',
              ],
              censor: '[redacted]',
            },
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'SYS:standard' },
                }
              : undefined,
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
