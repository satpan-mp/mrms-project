# API Convention

Detailed contracts live in `docs/09-API-Specification.md`. This document defines
the binding rules for building and evolving those APIs.

## 1. REST

- **Base path:** `/api/v1`. Version in the path; breaking changes bump the version.
- **Resources** are plural nouns; use sub-resources for relationships:
  `/rooms/{id}/schedule`, `/rooms/{id}/status`.
- **HTTP methods:** GET (read), POST (create/command), PATCH (partial update).
  MRMS does **not** expose Calendar edit/delete operations.
- **Status codes:** 200/201/202 success; 400 validation; 401 unauthenticated;
  403 forbidden; 404 not found; 409 conflict; 410 gone; 422 unprocessable;
  429 rate limited; 5xx server/upstream.
- **JSON only**, `camelCase` fields, timestamps ISO-8601 UTC.
- **Pagination:** `?page=&pageSize=` returning `{ data, meta: { page, pageSize, total } }`.
- **Idempotency:** unsafe create endpoints (e.g., `POST /bookings`) accept an
  `Idempotency-Key` header.

## 2. Error Envelope

All errors return a consistent shape:

```json
{
  "error": { "code": "ROOM_NOT_AVAILABLE", "message": "…", "details": {} },
  "correlationId": "…"
}
```

- `code` is a stable `UPPER_SNAKE_CASE` identifier (clients switch on this).
- `message` is human-readable and safe to display; never leak internals/secrets.
- `correlationId` ties the response to server logs.

## 3. Validation & Contracts

- Every request body/query is a validated DTO (`class-validator`).
- The OpenAPI spec (`apps/backend/openapi.json`) is generated from the code and is
  the source for the typed `@mrms/api-client`. FE and BE must not drift.
- WebSocket event contracts are documented via AsyncAPI and typed in
  `@mrms/realtime`.

## 4. Authentication & Authorization

- Users/admin: `Authorization: Bearer <JWT>`.
- Display devices: `X-Device-Token` (room-scoped).
- RBAC enforced via guards; admin-only routes require `ADMINISTRATOR`.
- Document auth requirements per endpoint in the OpenAPI spec.

## 5. WebSocket (Socket.IO)

- Endpoint `/realtime`; authenticate on handshake (JWT or device token).
- Server->client events use `dot.case` (`room.status`, `meeting.started`,
  `calendar.updated`, `device.status`, `announcement`).
- Channels: `room:{id}`, `site:{id}`, `global`, `admin`.
- Displays subscribe only to their room + site + global; admin channel is
  `ADMINISTRATOR`-only.
- Clients must handle reconnect and emit `resync` to refresh state.

## 6. Backwards Compatibility

- Additive changes (new optional fields, new endpoints) are allowed within a
  version.
- Removing/renaming fields or changing semantics is breaking -> new version +
  documented migration + CHANGELOG entry.

## 7. Rate Limiting & Security

- Rate-limit `auth` and `booking` endpoints.
- Never accept or return secrets. Treat all inbound data as untrusted.
- Log state-changing requests to the audit log with actor + correlation ID.
