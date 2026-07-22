/**
 * Outbox relay configuration (Phase 4).
 *
 * Frozen module constants (not environment variables — Phase 1 `env.ts` is not
 * modified). Externalization is a future additive option and requires no relay
 * change.
 */

/** Delay between poll cycles when the last cycle did not fill a batch. */
export const RELAY_POLL_INTERVAL_MS = 500;

/** Maximum events claimed per poll cycle (bounds memory and lock scope). */
export const RELAY_BATCH_SIZE = 100;

/**
 * Maximum dispatch attempts before an event is treated as poison and no longer
 * claimed. Left in place (not dead-lettered) for a future additive DLQ.
 */
export const RELAY_MAX_ATTEMPTS = 10;
