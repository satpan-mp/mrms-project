# API Strategy

> **Purpose:** Strategic, cross-cutting API standards (versioning, pagination, filtering, sorting, errors, idempotency, rate limiting).
> **Scope:** REST + WebSocket surfaces of MRMS, over their lifetime.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [API Specification](09-API-Specification.md), [API Convention](standards/api-convention.md), [Security Guide](SECURITY.md), [Naming Convention](standards/naming-convention.md), [Error Handling](standards/error-handling-convention.md)
> **References:** [REST](https://www.rfc-editor.org/rfc/rfc9110), [OpenAPI](https://spec.openapis.org/), [AsyncAPI](https://www.asyncapi.com/)

This document is the **strategy layer**. Concrete endpoints live in
[Doc 09](09-API-Specification.md); binding rules live in the
[API Convention](standards/api-convention.md). This adds cross-cutting policy
(lifecycle, query grammar, deprecation) without duplicating them.

## 1. API Versioning

- **URI versioning**: `/api/v1`. The major version changes only for breaking
  changes.
- **Additive changes** (new endpoints, new optional fields) are non-breaking and
  allowed within a version.
- **Breaking changes** (remove/rename fields, change semantics/types, change auth)
  require a new major version and a documented migration.
- **Deprecation policy:** mark deprecated fields/endpoints in OpenAPI, announce in
  the CHANGELOG, and support the old version for an agreed overlap window before
  removal. Emit a `Deprecation` (and optional `Sunset`) response header where
  feasible.

## 2. REST Standards

- Resource-oriented, plural nouns, `kebab-case` paths; sub-resources for
  relationships (`/rooms/{id}/schedule`).
- Methods: GET (safe/read), POST (create/command), PATCH (partial update). No
  Calendar edit/delete operations are exposed (ADR-005).
- JSON only; `camelCase` fields; ISO-8601 UTC timestamps.
- Status codes per [API Convention §1](standards/api-convention.md) and the
  [error catalogue](09-API-Specification.md#5-status-codes--error-codes).

## 3. Naming

- Follows the [Naming Convention](standards/naming-convention.md): `kebab-case`
  paths, `camelCase` query params and JSON fields, `dot.case` WebSocket events,
  `UPPER_SNAKE_CASE` error codes.

## 4. Pagination

- **Offset/size** pagination: `?page=1&pageSize=25` (default `pageSize=25`,
  max e.g. 100).
- Envelope:

```json
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 25, "total": 137 } }
```

- List endpoints must be paginated by default to bound payloads (NFR-PERF).

## 5. Filtering

- Field filters via explicit query params: `?siteId=...&status=AVAILABLE`.
- Date ranges via `from`/`to` (ISO-8601), e.g. analytics: `?from=2026-07-01&to=2026-07-20`.
- Only whitelisted, indexed fields are filterable (see
  [Database Strategy](DATABASE-STRATEGY.md) indexing).
- Unknown filter params are rejected (validation), not silently ignored.

## 6. Sorting

- `?sort=field` ascending, `?sort=-field` descending (leading `-` = desc).
- Multiple keys comma-separated: `?sort=-startTime,subject`.
- Only whitelisted fields are sortable; default sort is documented per endpoint
  (e.g., schedule sorted by `startTime` ascending).

## 7. Error Response Standard

Single envelope for all errors (see [API Convention §2](standards/api-convention.md)):

```json
{ "error": { "code": "ROOM_NOT_AVAILABLE", "message": "…", "details": {} }, "correlationId": "…" }
```

- `code` is stable and machine-switchable; `message` is safe to display;
  `correlationId` ties to logs/traces. Full catalogue in Doc 09 §5.

## 8. Authentication

- Users/admin: `Authorization: Bearer <JWT>`; devices: `X-Device-Token`
  (room-scoped). RBAC enforced by guards. Details in
  [Security Guide](SECURITY.md) and [Authentication Flow](12-Authentication-Flow.md).

## 9. Rate Limiting

- Applied to `auth/*` and `booking` (NFR-SEC-10); `429 RATE_LIMITED` on breach.
- Limits are per-IP and per-principal, backed by Redis for multi-instance
  consistency. Consider `Retry-After` headers.

## 10. Idempotency

- Unsafe creates accept an **`Idempotency-Key`** header. `POST /bookings` uses it
  to avoid creating duplicate Google events on retry.
- The server records the key + result for a bounded window and returns the
  original result on replay.
- GET/PATCH follow standard HTTP idempotency semantics (GET safe; PATCH designed
  to be idempotent where possible).

## 11. Contracts & Documentation

- **OpenAPI 3.1** generated from code is the source for the typed
  `@mrms/api-client`; **AsyncAPI** documents WebSocket events for `@mrms/realtime`.
- Contract tests verify implementation matches the spec (see
  [Testing Strategy](TESTING-STRATEGY.md)). FE and BE must not drift.

## 12. WebSocket API Strategy

- Endpoint `/realtime`; authenticated handshake; channels `room:{id}`,
  `site:{id}`, `global`, `admin`.
- Event names are versioned implicitly with the REST major version; additive
  events are non-breaking. Clients handle unknown events gracefully and `resync`
  on reconnect.
