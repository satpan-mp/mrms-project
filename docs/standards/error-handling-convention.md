# Error Handling Convention

Consistent, layered error handling across backend and frontend.

## 1. Principles

- **Fail fast, fail clearly.** Validate at boundaries; reject invalid input early.
- **Never swallow errors silently.** Either handle meaningfully or propagate.
- **No secrets/internal detail** in messages returned to clients or logs.
- Errors carry enough context (correlation ID) to diagnose from logs alone.

## 2. Backend Error Taxonomy

| Layer | Error kind | Example |
|-------|-----------|---------|
| Domain | Domain errors (business rule violations) | `RoomNotAvailableError`, `CheckInWindowExpiredError` |
| Application | Orchestration/validation errors | invalid state transition |
| Infrastructure | Integration errors | `GoogleCreateFailedError`, DB errors |
| Interface | HTTP/WS mapping | maps the above to status + error code |

- Define **typed domain errors** in each module's `domain/errors/`. They extend a
  shared base error and carry a stable `code`.
- Use cases throw domain/application errors; they do not format HTTP responses.

## 3. Mapping to the API Contract

- A **global NestJS exception filter** maps errors to the standard envelope:

```json
{ "error": { "code": "ROOM_NOT_AVAILABLE", "message": "…", "details": {} }, "correlationId": "…" }
```

- Mapping table (examples; full list in `docs/09-API-Specification.md`):

| Error | HTTP | code |
|-------|------|------|
| `RoomNotAvailableError` | 409 | `ROOM_NOT_AVAILABLE` |
| `RoomInMaintenanceError` | 403 | `ROOM_IN_MAINTENANCE` |
| `MeetingNotFoundError` | 404 | `MEETING_NOT_FOUND` |
| `AlreadyCheckedInError` | 409 | `ALREADY_CHECKED_IN` |
| `CheckInWindowExpiredError` | 410 | `CHECKIN_WINDOW_EXPIRED` |
| `GoogleCreateFailedError` | 502 | `GOOGLE_CREATE_FAILED` |
| validation failure | 400 | `VALIDATION_ERROR` |
| unexpected | 500 | `INTERNAL_ERROR` |

- Unknown/unexpected errors return `500 INTERNAL_ERROR` with a generic message;
  full detail goes to logs only.

## 4. External Integrations (Google, Redis, DB)

- Wrap external calls; translate provider errors into domain/infrastructure
  errors (Anti-Corruption Layer).
- Apply **retry with exponential backoff + jitter** for transient failures
  (Google rate limits, network); cap retries and then surface a clear failure.
- Isolate failures per room/job so one failure does not cascade.
- Handle Google `410` (invalid sync token) explicitly with a bounded full resync.

## 5. WebSocket Errors

- Emit a structured error event to the affected client; never crash the gateway.
- On connection auth failure, reject the handshake with a clear reason.

## 6. Frontend

- Global `ErrorBoundary` per app + route-level fallbacks.
- Every data view supports **loading / empty / error** states.
- Map API `error.code` to user-friendly, actionable messages (e.g., conflict,
  maintenance, Google failure).
- Kiosk display degrades gracefully: on backend/Google failure, show last-known
  schedule + a staleness/offline banner instead of a blank screen.

## 7. Rules

- No empty `catch` blocks; no `catch (e) {}`.
- Do not use exceptions for normal control flow.
- Always include a correlation ID in server error logs.
- Add a test for each new error path where practical.
