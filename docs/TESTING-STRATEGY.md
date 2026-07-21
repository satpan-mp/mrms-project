# Testing Strategy

> **Purpose:** Define the testing approach, levels, tooling, coverage targets, and quality gates for MRMS.
> **Scope:** Backend, frontends, integrations, and non-functional testing.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Backend Architecture](16-Backend-Architecture.md), [NFR](03-NFR-Non-Functional-Requirements.md), [Definition of Done](process/definition-of-done.md), [CI workflow](../.github/workflows/ci.yml), [API Strategy](API-STRATEGY.md)
> **References:** [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

## 1. Principles

- Follow the **testing pyramid**: many fast unit tests, fewer integration tests,
  a small set of end-to-end tests.
- **Clean Architecture aids testing**: pure domain services and use cases are
  tested with mocked ports (no framework/Google/DB), making unit tests fast and
  deterministic.
- Every feature and bug fix ships with tests (Definition of Done).
- CI enforces the gates on every PR (see [ci.yml](../.github/workflows/ci.yml)).

## 2. Test Levels

| Level | What it covers | Tooling | Where |
|-------|----------------|---------|-------|
| **Unit** | Domain services (e.g., RoomStatusService), use cases with mocked ports, pure utils, React components/hooks | Jest (backend), Vitest + React Testing Library (frontend) | colocated `*.spec.ts(x)` |
| **Integration** | Repositories against real PostgreSQL, queue jobs, gateway adapters | Jest + Testcontainers (ephemeral Postgres/Redis) | `apps/backend/test/` |
| **Contract** | REST endpoints vs OpenAPI; WebSocket event contracts | Jest + supertest; AsyncAPI checks | backend test |
| **End-to-End** | Critical user flows across UI + API (booking, check-in, display update) | Playwright | `test/e2e/` |
| **Performance/Load/Stress** | Latency SLOs, concurrency, breaking points | k6 (or Artillery) | perf suite (P8) |
| **Regression** | Prevent recurrence of fixed bugs | Jest/Playwright (bug-linked tests) | with each fix |
| **UAT** | Stakeholder acceptance on staging | Manual scripts / checklist | staging (per sprint / P8) |

## 3. Google Integration Testing

- Unit/integration tests **mock the Google ACL** (no live API in CI).
- A separate, opt-in suite may run against a Google **test tenant** for
  end-to-end sync/booking validation (not in the default CI path to avoid quota
  and flakiness).
- Verify create-only behavior: assert the app never calls edit/delete.

## 4. Critical Flows (must have E2E + high coverage)

- Booking creates a Google event and the display reflects it after sync.
- Check-in -> Occupied; no check-in within grace -> No Show + room released.
- Room status computation across all variants (Available/Reserved/Starting
  Soon/Occupied/Maintenance).
- Realtime update delivery and reconnect/resync.
- Auth: OAuth login, role enforcement, device-token authorization.

## 5. Coverage Targets

| Area | Target |
|------|--------|
| Domain + application (use cases) | >= 90% lines/branches |
| Backend overall | >= 80% |
| Frontend components/hooks | >= 70% |
| Critical flows (§4) | 100% covered by at least one E2E + unit/integration |

Coverage is reported in CI; PRs that drop coverage below targets are blocked
(enforced as gates mature in Sprint 1+).

## 6. Testing Matrix

| Concern | Unit | Integration | Contract | E2E | Perf |
|---------|:----:|:-----------:|:--------:|:---:|:----:|
| Room status logic | ✓ | | | ✓ | |
| Booking (create-only) | ✓ | ✓ (Google mocked) | ✓ | ✓ | |
| Calendar sync | ✓ | ✓ (mock/test tenant) | | | ✓ |
| Check-in / no-show sweep | ✓ | ✓ | | ✓ | |
| Auth / RBAC | ✓ | ✓ | ✓ | ✓ | |
| Realtime (WS) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Device monitoring | ✓ | ✓ | ✓ | | |
| Analytics rollups | ✓ | ✓ | | | |
| Admin config CRUD | ✓ | ✓ | ✓ | ✓ | |

## 7. Non-Functional Testing

- **Performance:** validate NFR-PERF targets (API p95 <= 300ms; realtime update
  <= 2s; booking round-trip <= 800ms excl. Google).
- **Load:** >= 200 concurrent display WebSocket connections (NFR-SCALE-2).
- **Stress:** find breaking points and confirm graceful degradation + recovery.
- **Resilience:** fault injection (kill Redis/API; simulate Google outage) to
  verify cache serving + reconnect/re-sync.
- Run in **Phase P8** and before the production release.

## 8. Test Data & Environments

- Ephemeral Postgres/Redis via Testcontainers for integration tests.
- Deterministic seed/fixtures; time is injectable so status/no-show logic is
  tested without real clocks.
- Staging environment mirrors production topology for E2E/UAT.

## 9. CI Enforcement

- `lint`, `typecheck`, `test`, `build` run on every PR
  ([ci.yml](../.github/workflows/ci.yml)); `docker-build` validates images.
- Required status checks gate merges to `develop`/`main`
  (see [BRANCH_PROTECTION](../.github/BRANCH_PROTECTION.md)).
- Placeholder scripts are replaced with real runners in Sprint 1
  ([TB-003](backlog/technical-backlog.md), [TD-001/TD-004](backlog/technical-debt.md)).
