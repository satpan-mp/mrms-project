import { parseCorsOrigins, validateEnv } from './env';

describe('validateEnv', () => {
  const minimal = { DATABASE_URL: 'postgresql://user:pass@localhost:5432/mrms' };

  it('applies documented defaults when only required vars are provided', () => {
    const env = validateEnv(minimal);
    expect(env.APP_ENV).toBe('development');
    expect(env.APP_PORT).toBe(3000);
    expect(env.APP_BASE_URL).toBe('http://localhost:3000');
    expect(env.APP_LOG_LEVEL).toBe('info');
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
    expect(env.RATE_LIMIT_TTL).toBe(60_000);
    expect(env.RATE_LIMIT_LIMIT).toBe(300);
    expect(env.ADMIN_BOOTSTRAP_EMAIL).toBeUndefined();
  });

  it('coerces numeric strings to integers', () => {
    const env = validateEnv({ ...minimal, APP_PORT: '8080', RATE_LIMIT_LIMIT: '50' });
    expect(env.APP_PORT).toBe(8080);
    expect(env.RATE_LIMIT_LIMIT).toBe(50);
  });

  it('accepts a valid full configuration', () => {
    const env = validateEnv({
      ...minimal,
      APP_ENV: 'production',
      APP_PORT: '443',
      APP_BASE_URL: 'https://mrms.example.com',
      APP_LOG_LEVEL: 'warn',
      CORS_ORIGINS: 'https://a.example.com,https://b.example.com',
      ADMIN_BOOTSTRAP_EMAIL: 'admin@example.com',
    });
    expect(env.APP_ENV).toBe('production');
    expect(env.APP_PORT).toBe(443);
    expect(env.ADMIN_BOOTSTRAP_EMAIL).toBe('admin@example.com');
  });

  it('throws a readable aggregate error when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/Invalid environment configuration/);
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects an invalid APP_ENV enum value and names the offending path', () => {
    expect(() => validateEnv({ ...minimal, APP_ENV: 'bogus' })).toThrow(/APP_ENV/);
  });

  it('rejects a non-positive port', () => {
    expect(() => validateEnv({ ...minimal, APP_PORT: '-1' })).toThrow(/APP_PORT/);
  });

  it('rejects a malformed bootstrap email', () => {
    expect(() => validateEnv({ ...minimal, ADMIN_BOOTSTRAP_EMAIL: 'not-an-email' })).toThrow(
      /ADMIN_BOOTSTRAP_EMAIL/,
    );
  });

  it('rejects a non-URL base url', () => {
    expect(() => validateEnv({ ...minimal, APP_BASE_URL: 'not a url' })).toThrow(/APP_BASE_URL/);
  });
});

describe('parseCorsOrigins', () => {
  it('splits, trims, and drops empty entries', () => {
    expect(parseCorsOrigins('http://a, http://b ,, http://c ')).toEqual([
      'http://a',
      'http://b',
      'http://c',
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseCorsOrigins('')).toEqual([]);
  });

  it('handles a single origin without separators', () => {
    expect(parseCorsOrigins('http://localhost:5173')).toEqual(['http://localhost:5173']);
  });
});
