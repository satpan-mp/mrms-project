import { describe, expect, it } from 'vitest';

import { ApiClientError, isApiErrorBody } from './errors';

describe('isApiErrorBody', () => {
  it('accepts a valid error envelope', () => {
    expect(
      isApiErrorBody({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
        correlationId: 'abc',
      }),
    ).toBe(true);
  });

  it('rejects non-envelope values', () => {
    expect(isApiErrorBody(null)).toBe(false);
    expect(isApiErrorBody({})).toBe(false);
    expect(isApiErrorBody({ error: { code: 1 } })).toBe(false);
    expect(isApiErrorBody('nope')).toBe(false);
  });
});

describe('ApiClientError', () => {
  it('preserves code, status, and correlation id', () => {
    const err = new ApiClientError({
      code: 'ROOM_NOT_AVAILABLE',
      message: 'Not available',
      status: 409,
      correlationId: 'cid-1',
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiClientError');
    expect(err.code).toBe('ROOM_NOT_AVAILABLE');
    expect(err.status).toBe(409);
    expect(err.correlationId).toBe('cid-1');
  });
});
