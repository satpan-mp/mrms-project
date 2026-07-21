import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { HealthController } from '../src/modules/health/health.controller';
import { PrismaHealthIndicator } from '../src/modules/health/indicators/prisma.health';
import { RedisHealthIndicator } from '../src/modules/health/indicators/redis.health';
import { SystemController } from '../src/modules/health/system.controller';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { RedisService } from '../src/shared/redis/redis.service';

/**
 * End-to-end HTTP test for the system endpoints. PostgreSQL/Redis are mocked as
 * healthy so the test runs in CI without live infrastructure while still
 * exercising the real controllers, Terminus aggregation, routing (/api/v1), and
 * validation pipeline.
 */
describe('System endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController, SystemController],
      providers: [
        PrismaHealthIndicator,
        RedisHealthIndicator,
        { provide: PrismaService, useValue: { isHealthy: async () => true } },
        { provide: RedisService, useValue: { isHealthy: async () => true } },
        { provide: ConfigService, useValue: { get: () => 'test' } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok with database + redis up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.details.database.status).toBe('up');
    expect(res.body.details.redis.status).toBe('up');
  });

  it('GET /api/v1/ping returns pong', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/ping').expect(200);
    expect(res.body.message).toBe('pong');
  });

  it('GET /api/v1/version returns metadata', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/version').expect(200);
    expect(res.body.name).toBe('mrms-backend');
    expect(res.body.environment).toBe('test');
  });
});
