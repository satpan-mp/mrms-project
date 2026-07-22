/**
 * Well-known CLS context keys shared across the request/job lifecycle.
 *
 * These keys carry request/job-scoped identity that the outbox writer stamps
 * onto every domain event's metadata. The frozen resolution order used by
 * `OutboxWriter` is: explicit override -> CLS value (these keys) -> generated
 * fallback. This module only DECLARES the keys and the producer contract; it
 * intentionally does not populate them.
 *
 * Expected producers (edge/adapter layer only — never the domain layer):
 * - HTTP: an interceptor/middleware sets `CLS_CORRELATION_ID` (from the inbound
 *   `x-correlation-id` header, matching the logger) and `CLS_ACTOR_USER_ID`
 *   (from the authenticated principal) once auth arrives in Phase 5 / the Admin
 *   API in Phase 7.
 * - Workers (Phase 14): the job runner establishes a CLS context per job and
 *   sets these keys from the job envelope (e.g. the originating event's
 *   correlationId), preserving causal chains.
 *
 * Until a producer is wired, `OutboxWriter` falls back to a generated
 * correlation id and a null actor — no domain code changes are required when the
 * adapter layer starts populating these keys.
 */
export const CLS_CORRELATION_ID = 'correlationId';
export const CLS_ACTOR_USER_ID = 'actorUserId';
