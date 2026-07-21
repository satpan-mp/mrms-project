import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { APP_NAME, APP_VERSION } from './shared/config/app-info';
import { parseCorsOrigins, type Env } from './shared/config/env';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Structured logging (nestjs-pino) for the app + startup logs.
  app.useLogger(app.get(Logger));

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

  const logger = app.get(Logger);
  logger.log(`${APP_NAME} v${APP_VERSION} listening on http://localhost:${port}/api/v1`, 'Bootstrap');
  if (isDev) {
    logger.log(`Swagger UI available at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

void bootstrap();
