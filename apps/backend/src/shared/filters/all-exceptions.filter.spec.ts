import {
  type ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { AllExceptionsFilter } from './all-exceptions.filter';

interface CapturedResponse {
  statusSpy: jest.Mock;
  jsonSpy: jest.Mock;
}

function buildHost(requestOverrides: Record<string, unknown> = {}): {
  host: ArgumentsHost;
  res: CapturedResponse;
} {
  const jsonSpy = jest.fn();
  const statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
  const request = {
    method: 'GET',
    url: '/api/v1/resource',
    headers: {},
    ...requestOverrides,
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: statusSpy }),
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, res: { statusSpy, jsonSpy } };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('maps a NotFoundException to the standard envelope with NOT_FOUND code', () => {
    const { host, res } = buildHost({ headers: { 'x-correlation-id': 'cid-123' } });
    filter.catch(new NotFoundException('missing'), host);

    expect(res.statusSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = res.jsonSpy.mock.calls[0][0];
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.correlationId).toBe('cid-123');
  });

  it('maps a ForbiddenException to FORBIDDEN', () => {
    const { host, res } = buildHost();
    filter.catch(new ForbiddenException(), host);
    expect(res.statusSpy).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(res.jsonSpy.mock.calls[0][0].error.code).toBe('FORBIDDEN');
  });

  it('normalizes ValidationPipe array messages into VALIDATION_ERROR with violations', () => {
    const { host, res } = buildHost();
    const exception = new BadRequestException({
      message: ['name should not be empty', 'email must be an email'],
      error: 'Bad Request',
      statusCode: 400,
    });
    filter.catch(exception, host);

    expect(res.statusSpy).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = res.jsonSpy.mock.calls[0][0];
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('One or more fields are invalid.');
    expect(body.error.details.violations).toEqual([
      'name should not be empty',
      'email must be an email',
    ]);
  });

  it('maps an unknown (non-HTTP) error to a 500 INTERNAL_ERROR without leaking details', () => {
    const { host, res } = buildHost({ id: 'req-42' });
    filter.catch(new Error('boom: secret db string'), host);

    expect(res.statusSpy).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = res.jsonSpy.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected error occurred.');
    expect(JSON.stringify(body)).not.toContain('secret db string');
    expect(body.correlationId).toBe('req-42');
  });

  it('logs 5xx errors with the correlation id', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const { host } = buildHost({ id: 'req-99' });
    filter.catch(new Error('kaboom'), host);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const firstCall = errorSpy.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(String(firstCall?.[0])).toContain('req-99');
  });

  it('falls back to "unknown" when no correlation id is available', () => {
    const { host, res } = buildHost();
    filter.catch(new NotFoundException(), host);
    expect(res.jsonSpy.mock.calls[0][0].correlationId).toBe('unknown');
  });

  it('reads the correlation id from an array-valued header', () => {
    const { host, res } = buildHost({ headers: { 'x-correlation-id': ['cid-arr', 'other'] } });
    filter.catch(new NotFoundException(), host);
    expect(res.jsonSpy.mock.calls[0][0].correlationId).toBe('cid-arr');
  });

  it('maps a generic HttpException string response through codeForStatus', () => {
    const { host, res } = buildHost();
    filter.catch(new HttpException('teapot', HttpStatus.I_AM_A_TEAPOT), host);
    expect(res.statusSpy).toHaveBeenCalledWith(HttpStatus.I_AM_A_TEAPOT);
    // Unmapped status >= 400 and < 500 -> generic ERROR code.
    expect(res.jsonSpy.mock.calls[0][0].error.code).toBe('ERROR');
  });

  it('maps 429 to RATE_LIMITED', () => {
    const { host, res } = buildHost();
    filter.catch(new HttpException('slow down', HttpStatus.TOO_MANY_REQUESTS), host);
    expect(res.jsonSpy.mock.calls[0][0].error.code).toBe('RATE_LIMITED');
  });
});
