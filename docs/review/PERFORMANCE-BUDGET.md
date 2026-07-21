# Performance Budget

> **Purpose:** Define measurable performance targets (SLOs) for MRMS and how they are verified.
> **Scope:** API, realtime, booking, login, sync, database, startup, and recovery.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [NFR](../03-NFR-Non-Functional-Requirements.md), [Cache Strategy](./CACHE-STRATEGY.md), [Capacity Planning](./CAPACITY-PLANNING.md), [Testing Strategy](../TESTING-STRATEGY.md), [Observability](../OBSERVABILITY.md)
> **References:** -

Budgets are SLO-style targets. "Excludes Google" means the metric measures MRMS
work only, not third-party latency (which is tracked separately). Verified by
load/perf tests in Phase P8 and monitored continuously.

## 1. Budget Table

| # | Operation | Target | Measure | Verify |
|---|-----------|--------|---------|--------|
| PB-1 | Display refresh (realtime event -> render) | <= 2 s end-to-end | server emit -> client paint | perf test + WS trace |
| PB-2 | API read (p95) | <= 300 ms | server response time | benchmark + Prometheus |
| PB-3 | API read (p99) | <= 600 ms | server response time | Prometheus |
| PB-4 | Booking round-trip (p95, excl. Google) | <= 800 ms | POST /bookings server time | benchmark |
| PB-5 | Login (app work, excl. Google OAuth) | <= 500 ms | callback -> JWT issued | benchmark |
| PB-6 | Socket latency (event delivery) | <= 500 ms p95 | emit -> client receive | WS load test |
| PB-7 | Database query (hot paths, p95) | <= 50 ms | query duration | pg metrics |
| PB-8 | Cache read (room status/schedule, p95) | <= 150 ms | Redis GET + deserialize | benchmark |
| PB-9 | Calendar sync (per room, incremental) | <= 5 s typical | job duration | worker metrics |
| PB-10 | Google API sync call (external) | tracked, no SLO (3rd party) | call duration | metric only |
| PB-11 | Cold start (API container ready) | <= 30 s | boot -> /health ready | deploy check |
| PB-12 | Worker start (ready to consume) | <= 30 s | boot -> queue consuming | deploy check |
| PB-13 | Display recovery (reconnect + resync) | <= 10 s | disconnect -> fresh state | fault test |
| PB-14 | No-show sweep latency | <= 30 s after grace | grace passed -> released | integration test |
| PB-15 | Clock accuracy on display | drift <= 1 s | NTP-backed local clock | manual/automated |

## 2. Frontend Budgets (display kiosk)

| Metric | Target |
|--------|--------|
| First contentful paint (kiosk boot) | <= 2 s on NUC |
| Time to interactive | <= 3 s |
| Bundle size (initial, gzipped) | <= 300 KB (guideline) |
| Memory growth over 24h (no leak) | stable (bounded) |

## 3. Enforcement

- CI runs perf smoke where feasible; full **load/stress tests in P8** validate
  PB-1..PB-14 against the targets ([Testing Strategy](../TESTING-STRATEGY.md)).
- Continuous monitoring alerts on sustained SLO breaches
  ([Observability](../OBSERVABILITY.md), [Monitoring Dashboard](./MONITORING-DASHBOARD.md)).
- A budget breach in CI/staging blocks a release candidate
  ([Release Management](../process/release-management.md)).

## 4. Budget Ownership

- Backend Lead owns API/DB/sync budgets; Frontend Lead owns display budgets;
  DevOps owns startup/recovery budgets. Reviewed each sprint and before release.
