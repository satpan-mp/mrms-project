import { z } from 'zod';

/**
 * Environment schema + validation (fail-fast at boot).
 * Only the variables the backend actually consumes are declared; unknown vars
 * are ignored. Secrets are never logged. See docs/CONFIGURATION.md and
 * docs/standards/environment-variable-convention.md.
 */
export const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3000),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  APP_LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Comma-separated list of allowed browser origins for CORS.
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').default('redis://localhost:6379'),

  // Global rate limiting (per client) — window in milliseconds and max requests.
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_LIMIT: z.coerce.number().int().positive().default(300),

  // Reserved for Sprint 1B (auth). Optional at the foundation stage.
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * NestJS ConfigModule `validate` hook. Throws a readable aggregate error listing
 * every invalid/missing variable so misconfiguration is caught at startup.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

/** Parse a comma-separated CORS origins string into a trimmed, non-empty array. */
export function parseCorsOrigins(corsOrigins: string): string[] {
  return corsOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
