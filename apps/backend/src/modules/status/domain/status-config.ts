/**
 * Room-status engine configuration (Phase 3, pure).
 *
 * Frozen module constants (not environment variables — Phase 1 `env.ts` is not
 * modified). They define the time windows the resolver uses to distinguish
 * STARTING_SOON and RESERVED from AVAILABLE. Externalization to config is a
 * future additive option and requires no engine change.
 */

/** A meeting starting within this many minutes marks the room STARTING_SOON. */
export const STARTING_SOON_LEAD_MIN = 15;

/**
 * A meeting starting beyond the STARTING_SOON lead but within this many minutes
 * marks the room RESERVED. Beyond this horizon the room is treated as AVAILABLE.
 */
export const RESERVED_HORIZON_MIN = 120;
