# Observability Readiness

- **Date:** 2026-07-20
- **Method:** source inspection (`main.ts`, logger module, health module, exception filter). Recommendations favor deferring heavyweight instrumentation until Sprint 1B to avoid premature complexity.

## 1. Checklist

| Capability | Status | Evidence / Note |
|---|---|---|
| Structured logging | ✅ Verified | `nestjs-pino` (JSON logs) wired in `main.ts` via `app.useLogger(Logger)` |
| Request IDs | ✅ Verified | pino-http assigns per-request id; used by the exception filter |
| Correlation IDs | ✅ Verified | `AllExceptionsFilter` resolves `x-correlation-id` (string/array) with `request.id` fallback; echoed in error envelope (unit-tested) |
| Health endpoint | ✅ Verified | `GET /api/v1/health` (Terminus) checks DB + Redis — e2e verified |
| Readiness endpoint | ⚠ Partial | health composite covers readiness signals; no separate `/ready` path yet |
| Liveness endpoint | ⚠ Partial | `GET /api/v1/ping` serves as a lightweight liveness probe |
| Metrics readiness | ❌ Not yet | no Prometheus/metrics endpoint |
| OpenTelemetry readiness | ❌ Not yet | no OTel SDK wired |
| Tracing readiness | ❌ Not yet | no distributed tracing |
| Process guards | ✅ Verified | `unhandledRejection` logged; `uncaughtException` logged + clean exit for orchestrator restart |
| Graceful shutdown | ✅ Verified | `app.enableShutdownHooks()` |

## 2. Assessment

The foundation has **solid log-level observability** (structured JSON + correlation ids + health checks + process guards) — appropriate and sufficient for a foundation baseline. Metrics/tracing/OTel are **intentionally absent**: wiring them now would add dependencies and config surface before there is feature traffic to observe.

## 3. Recommendations (Sprint 1B, sequenced)

1. Split explicit **`/health/live`** and **`/health/ready`** (Terminus supports distinct indicators) for K8s probes.
2. Add a **`/metrics`** endpoint (`@willsoto/nestjs-prometheus` or similar) once request/business metrics exist.
3. Introduce **OpenTelemetry** tracing when the first cross-service call or external integration (Google Workspace) lands — not before.
4. Ship **log-based dashboards + alerts** against the existing structured logs (no code change needed).

## 4. Verdict

Observability is **foundation-ready** (logs, correlation, health, guards). Metrics/tracing are deferred by design and tracked for Sprint 1B. **Not blocking.**
