# Backend Performance Report — Sprint 1A

> **Purpose:** Establish a performance baseline and methodology for the backend foundation.
> **Scope:** `apps/backend` (NestJS) — operational endpoints only (`/health`, `/version`, `/ping`).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [NFR §2 Performance](../../03-NFR-Non-Functional-Requirements.md), [Backend Architecture](../../16-Backend-Architecture.md), [Observability](../../OBSERVABILITY.md)

---

## 1. Scope & honesty note

Sprint 1A ships only operational endpoints (`/health`, `/version`, `/ping`).
There are **no business endpoints, database queries, or realtime paths** to load
test yet. A full load/latency benchmark against the NFR targets is therefore
**not meaningful at this stage** and was **not run**. This report records the
qualitative baseline, the architectural properties that support the NFR targets,
and the methodology to be executed once feature endpoints exist.

## 2. NFR performance targets (reference — Document 03 §2)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-1 | Realtime display update latency | ≤ 2 s end-to-end |
| NFR-PERF-2 | REST read endpoints (p95) | ≤ 300 ms |
| NFR-PERF-3 | Booking creation round-trip (excl. Google) | ≤ 800 ms p95 |
| NFR-PERF-5 | Calendar cache read (room day view) p95 | ≤ 150 ms |

## 3. Qualitative baseline (foundation)

| Aspect | Observation |
|--------|-------------|
| Cold start | NestJS app boots and passes e2e health/ping/version tests locally. |
| `/health` | Terminus check aggregates DB + Redis indicators; returns fast when datastores are reachable. |
| `/ping`, `/version` | Trivial in-memory responses; negligible latency. |
| Logging overhead | nestjs-pino (async JSON) chosen specifically to minimize logging overhead on the hot path. |
| Validation overhead | Global `ValidationPipe` runs only on DTO routes; operational endpoints are unaffected. |

## 4. Architectural properties supporting the targets

- **Stateless API** (NFR-SCALE-3): horizontally scalable behind Nginx; no in-process session state.
- **Shared Redis/PostgreSQL**: enables caching and pub/sub for realtime fan-out.
- **Worker tier** (`worker.ts` bootstrap): heavy/async work (calendar sync, no-show sweep) is offloaded to BullMQ workers, keeping API latency low (NFR-SCALE-4).
- **Prisma + indexed schema**: the materialized models already declare the indexes from Document 08 (`SystemLog` on `createdAt` and `(logType, createdAt)`, `Setting` unique `(key, scope)`), so read paths are index-backed by design.
- **Structured logging with correlation IDs** (NFR-OBS-1): enables per-request latency tracing once metrics are added.

## 5. Methodology (to run when feature endpoints land)

1. **Environment:** dockerized stack (API + Postgres + Redis) on representative hardware; seeded dataset (3 sites, 14 rooms, realistic meeting volume).
2. **Tooling:** `autocannon` or `k6` for HTTP; a WebSocket latency harness for NFR-PERF-1.
3. **Scenarios:**
   - Read endpoints (`/rooms`, `/rooms/{id}/status`, `/rooms/{id}/schedule`) → measure p50/p95/p99 vs NFR-PERF-2/5.
   - Booking creation (mock Google) → NFR-PERF-3.
   - Realtime status propagation (server event → display render) → NFR-PERF-1.
4. **Load profile:** ramp to ≥ 200 concurrent WS connections (NFR-SCALE-2); sustained read load with headroom for ≥ 100 rooms (NFR-SCALE-1).
5. **Pass/fail:** compare p95 to targets; capture CPU/RAM; record regressions per sprint.

## 6. Actions

| ID | Action | When |
|----|--------|------|
| — | Add latency/throughput benchmark harness | When first feature endpoints ship |
| — | Add request-duration metrics + tracing to the pino pipeline | Observability sprint |
| — | Re-run this report with real numbers and append a results table | Each feature sprint |

---

*End of Backend Performance Report.*
