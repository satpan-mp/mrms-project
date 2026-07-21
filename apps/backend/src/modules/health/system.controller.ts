import type { PingResponse, VersionResponse } from '@mrms/types';
import { Controller, Get } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { APP_NAME, APP_VERSION, GIT_COMMIT } from '../../shared/config/app-info';
import type { Env } from '../../shared/config/env';

/** Version metadata + minimal liveness ping (Doc 09). */
@ApiTags('system')
@Controller()
export class SystemController {
  constructor(private readonly config: ConfigService<Env, true>) {}

  @Get('version')
  @ApiOperation({ summary: 'Build/version metadata' })
  @ApiOkResponse({ description: 'Application name, version, environment, and commit.' })
  version(): VersionResponse {
    return {
      name: APP_NAME,
      version: APP_VERSION,
      environment: this.config.get('APP_ENV', { infer: true }),
      commit: GIT_COMMIT,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Minimal liveness signal' })
  @ApiOkResponse({ description: 'Returns pong.' })
  ping(): PingResponse {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }
}
