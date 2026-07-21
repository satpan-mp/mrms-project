import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { SystemController } from './system.controller';

describe('SystemController', () => {
  let controller: SystemController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        {
          provide: ConfigService,
          useValue: { get: () => 'development' },
        },
      ],
    }).compile();

    controller = moduleRef.get(SystemController);
  });

  it('returns pong from /ping', () => {
    const result = controller.ping();
    expect(result.message).toBe('pong');
    expect(typeof result.timestamp).toBe('string');
  });

  it('returns version metadata from /version', () => {
    const result = controller.version();
    expect(result.name).toBe('mrms-backend');
    expect(result.environment).toBe('development');
    expect(result.version).toMatch(/\d+\.\d+\.\d+/);
  });
});
