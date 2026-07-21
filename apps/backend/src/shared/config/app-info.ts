/**
 * Static application metadata surfaced by `GET /version`.
 * `APP_VERSION` and `GIT_COMMIT` are injected at build/deploy time via env; they
 * fall back to sensible defaults in local development.
 */
export const APP_NAME = 'mrms-backend';
export const APP_VERSION = process.env.APP_VERSION ?? '0.1.0';
export const GIT_COMMIT = process.env.GIT_COMMIT ?? 'unknown';
