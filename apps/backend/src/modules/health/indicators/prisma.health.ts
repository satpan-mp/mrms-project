import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';

import { PrismaService } from '../../../shared/prisma/prisma.service';

/** Terminus indicator that verifies PostgreSQL connectivity via Prisma. */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key = 'database'): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.isHealthy();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Prisma health check failed',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'unknown error',
        }),
      );
    }
  }
}
