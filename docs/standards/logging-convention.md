# Logging Convention

Structured, secure, and useful logging across all services (see NFR-OBS-*).

## 1. Format

- **Structured JSON** logs (one JSON object per line) in all environments except
  local dev, where a pretty/human format is acceptable.
- Standard fields on every log entry:

| Field | Meaning |
|-------|---------|
| `timestamp` | ISO-8601 UTC |
| `level` | `error` / `warn` / `info` / `debug` / `trace` |
| `service` | `api` / `worker` / `gateway` |
| `module` | e.g., `booking`, `sync` |
| `correlationId` | request/job correlation identifier |
| `message` | concise, human-readable |
| `context` | structured extra data (no secrets) |

## 2. Levels

| Level | Use for |
|-------|---------|
| `error` | Failures requiring attention (unhandled, integration failures) |
| `warn` | Recoverable issues, retries, degraded mode, near-limits |
| `info` | Significant lifecycle events (startup, sync completed, booking created) |
| `debug` | Detailed diagnostics (disabled in prod by default) |
| `trace` | Very verbose; never in prod |

- Default production level: `info`. Configurable via env
  (`APP_LOG_LEVEL`).

## 3. Correlation

- Generate a `correlationId` per inbound request (interceptor/middleware) and per
  queued job; propagate it through use cases and into external-call logs.
- Return `correlationId` in API error envelopes so client-reported issues map to
  server logs.

## 4. Security & Privacy (mandatory)

- **Never log secrets or credentials**: tokens, passwords, `Authorization`
  headers, device tokens, Google client secret, DB URLs with passwords.
- Redact/omit sensitive fields; reference secrets by name, never value.
- Minimize personal data: log identifiers (user id, email only where necessary),
  not full meeting content beyond what is needed for diagnosis.
- Treat external data (calendar, device telemetry) as untrusted; do not log raw
  payloads that may contain sensitive info.

## 5. What to Log

- Service start/stop, health transitions.
- Auth events (login/logout/refresh) - actor + result, no credentials.
- Calendar sync results (per room): counts, duration, status, errors.
- Booking create, check-in/no-show transitions - outcome + ids.
- Device heartbeat anomalies and offline transitions.
- All errors with stack + correlation ID (server side only).

## 6. Audit Logging

- State-changing admin actions and security-relevant events are written to the
  **`SystemLog`** table (`logType = AUDIT`/`ACTIVITY`) with actor, action, target,
  timestamp - in addition to application logs.
- Audit records are append-only and must not contain secrets.

## 7. Rules

- Use the shared logger; do not use `console.log` in committed code.
- No debug logs left enabled in production paths.
- Log messages are English, concise, and actionable.
- Prefer structured `context` fields over string interpolation for machine
  parsing.
