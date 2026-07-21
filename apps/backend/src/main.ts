import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { APP_NAME, APP_VERSION } from './shared/config/app-info';
import { parseCorsOrigins, type Env } from './shared/config/env';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  // Structured logging (nestjs-pino) for the app + startup logs.
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Last-resort process guards: log (structured) and, for a corrupted process
  // state, exit so the orchestrator (Docker/K8s) restarts a clean instance.
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled promise rejection: ${String(reason)}`, 'Process');
  });
  process.on('uncaughtException', (error: Error) => {
    logger.error(error.stack ?? error.message, 'Process');
    process.exit(1);
  });

  const config = app.get(ConfigService<Env, true>);
  const isDev = config.get('APP_ENV', { infer: true }) === 'development';

  // API versioning + global prefix -> all routes served under /api/v1 (Doc 09).
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Strict DTO validation everywhere (whitelist strips unknown props).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Standard error envelope for every failure (Doc 09 §5).
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS for the Admin/Display SPAs.
  app.enableCors({
    origin: parseCorsOrigins(config.get('CORS_ORIGINS', { infer: true })),
    credentials: true,
  });

  // --- Security & transport hardening ---
  // Security response headers (CSP, HSTS, nosniff, frameguard, etc.). Rate
  // limiting is applied globally via ThrottlerGuard in AppModule.
  app.use(helmet());
  // gzip responses (transparent; safe for JSON APIs).
  app.use(compression());
  // Bound request body size to mitigate memory-exhaustion DoS.
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
  // Remove framework fingerprinting; trust the first proxy hop (Nginx TLS).
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.enableShutdownHooks();

  // OpenAPI / Swagger (non-production only) at /api/docs.
  if (!config.get('APP_ENV', { infer: true }).startsWith('prod')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MRMS API')
      .setDescription('Meeting Room Management System - REST API (Doc 09).')
      .setVersion(APP_VERSION)
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Device-Token', in: 'header' }, 'device-token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get('APP_PORT', { infer: true });
  await app.listen(port);

  logger.log(
    `${APP_NAME} v${APP_VERSION} listening on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
  if (isDev) {
    logger.log(`Swagger UI available at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

void bootstrap();
