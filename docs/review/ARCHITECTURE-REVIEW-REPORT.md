# Architecture Review Report

> **Purpose:** Enterprise architecture audit of MRMS prior to Sprint 1 implementation.
> **Scope:** Architecture, scalability, maintainability, security, performance, infrastructure, operational readiness.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin (acting Principal Architect / Sr Full-Stack / DevOps / Security / Tech Lead / EM)
> **Last Updated:** 2026-07-20
> **Related Documents:** [Software Architecture](../04-Software-Architecture.md), [Backend Architecture](../16-Backend-Architecture.md), [NFR](../03-NFR-Non-Functional-Requirements.md), [ADR index](../adr/README.md), [Risk Register](../RISK-REGISTER.md), [Production Readiness Checklist](./PRODUCTION-READINESS-CHECKLIST.md), [Threat Model](./THREAT-MODEL.md)
> **References:** C4 model; Clean Architecture; DDD

## 1. Executive Summary

MRMS enters implementation with an unusually complete documentation and design
foundation: 19 design documents, 8 ADRs, development standards, process
(DoR/DoD/release), risk register, backlogs, and an operational wiki. The
architecture (Clean Architecture + DDD, NestJS, PostgreSQL/Prisma, Redis, BullMQ,
Socket.IO, React/Vite, Docker/Nginx) is coherent, appropriately scoped, and
aligned to the mandated constraints - most importantly that **Google Calendar is
the single source of truth** with a **create-only** integration.

The design is **approved to proceed to Sprint 1** with minor, non-blocking
revisions (mostly stakeholder confirmations and enabling GitHub controls). No
architectural rework is required.

**Overall Score: 88 / 100.** **Approval Status: Ready with Minor Revisions.**

## 2. Project Strengths

1. **Documentation-first discipline** - design, standards, governance (ADR/RFC/
   decision log), and operations are all in place before code.
2. **Sound source-of-truth model** - create-only Google integration eliminates
   dual-write conflicts and reduces security surface (least-privilege scopes).
3. **Clean Architecture + DDD** with the Repository Pattern and an ACL around
   Google - domain is framework/vendor independent and testable.
4. **Server-authoritative status** - one pure `RoomStatusService` reused by REST,
   realtime, and the no-show sweep prevents divergence across displays.
5. **Resilience by design** - cached display + staleness banner, reconnect/resync,
   heartbeat monitoring, and DR procedures.
6. **Operational maturity** - CI/CD scaffolding, Docker infra, observability plan,
   release management, and a risk register from day one.
7. **Clear modular boundaries** map cleanly to NestJS modules and bounded contexts.

## 3. Architecture Weaknesses

| # | Weakness | Severity | Recommendation |
|---|----------|----------|----------------|
| W-1 | Booking freshness depends on next sync; user may not see their event instantly | Medium | Optimistically reflect the created event in cache on successful `events.insert` (link-back on sync) |
| W-2 | Single Docker host (Compose) is a single point of failure for the tier | Medium | Documented; plan HA/orchestrator migration path (ADR-006 future) |
| W-3 | Conferencing return-to-display relies on scheduled end time (no Meet "ended" signal) | Medium | Backend `meeting.finished` + optional kiosk heuristic (already designed, D-006) |
| W-4 | Cross-site network topology to central backend not yet validated | Medium | Validate in P8 (IB-013); confirm latency/bandwidth per site |
| W-5 | Analytics computed from cache + check-ins; historical accuracy depends on retention | Low | Daily rollups (`AnalyticsDaily`) mitigate; define retention policy |
| W-6 | Device agent (Windows) is an additional deployment surface | Low | Keep minimal; package with NUC provisioning image |

## 4. Technical Risks

Tracked in the [Risk Register](../RISK-REGISTER.md). Highest-severity:
- **R-01 Google quota/rate limits** (High) - mitigated by incremental sync + watch
  channels + backoff.
- **R-20 insufficient test coverage on critical flows** (High) - mitigated by
  coverage targets + contract tests + CI gates.
All other risks are Medium/Low with documented mitigations and contingencies.

## 5. Scalability

- Stateless API/gateway scale horizontally behind Nginx; Socket.IO uses the Redis
  adapter for fan-out; sync/sweeps scale via BullMQ workers.
- Current: 3 sites / 14 rooms. Target: >=100 rooms, >=200 concurrent displays.
- Detailed scaling tiers in [Capacity Planning](./CAPACITY-PLANNING.md).
- **Assessment: Strong** for the stated horizon; 500-room tier needs read-replica
  / partitioning considerations (documented).

## 6. Maintainability

- Clean Architecture + SOLID + Repository Pattern; module-per-bounded-context;
  strict TypeScript; enforced conventions; generated API/event clients keep FE/BE
  in sync.
- **Assessment: Strong.** Onboarding is well-served by the wiki and standards.

## 7. Security Review

- Google OAuth only; RS256 JWT with rotation + reuse detection; RBAC guards;
  room-scoped hashed device tokens; least-privilege Google scopes (no edit/delete);
  Helmet/CORS/rate limiting; encrypted tokens; audit logging.
- Full STRIDE analysis in [Threat Model](./THREAT-MODEL.md); OWASP mapping in
  [Security Guide](../SECURITY.md).
- **Assessment: Strong design.** Gaps are operational (enable secret scanning,
  apply branch protection) rather than architectural.

## 8. Performance Review

- Targets defined in [Performance Budget](./PERFORMANCE-BUDGET.md) and NFR-PERF
  (realtime <= 2s, API p95 <= 300ms, booking <= 800ms p95, cache read <= 150ms).
- Caching (Redis) for hot read models; server-side status; scoped WS channels.
- **Assessment: Achievable;** must be verified by load/stress tests in P8.

## 9. Infrastructure Review

- Docker Compose (base/dev/prod), Nginx reverse proxy (TLS + WS upgrade),
  Postgres + Redis with health checks and volumes; observability stack planned.
- See [Deployment & Infrastructure diagrams](./DEPLOYMENT-DIAGRAM.md).
- **Assessment: Solid for on-prem single-host;** HA and backups need P8 execution.

## 10. Operational Readiness

- DR (RTO/RPO), monitoring/alerting, heartbeat/device monitoring, release/rollback,
  runbooks (wiki) are documented.
- **Assessment: Good** for launch once P8 infra tasks (backups, observability
  stack, TLS, alerting) are executed and drilled.

## 11. Improvement Recommendations (prioritized)

| Priority | Recommendation |
|----------|----------------|
| High | Resolve PRD §15 open questions (timing windows, on-display attribution, sync trigger, retention) before dependent sprints |
| High | Apply GitHub branch protection + secret scanning; wire gitleaks in CI (TD-006/TD-007) |
| High | Confirm RTO/RPO + backup retention; schedule a restore drill in P8 |
| Medium | Optimistic booking reflection (W-1) to improve perceived latency |
| Medium | Validate cross-site network topology early (IB-013) |
| Medium | Plan HA path for the Docker host (W-2) before broad rollout |
| Low | Keep the device agent minimal; bundle with NUC image |

## 12. Overall Score

| Dimension | Weight | Score (/10) |
|-----------|:------:|:-----------:|
| Architecture soundness | 20% | 9 |
| Scalability | 15% | 9 |
| Maintainability | 15% | 9 |
| Security | 20% | 9 |
| Performance (designed) | 10% | 8 |
| Infrastructure | 10% | 8 |
| Operational readiness | 10% | 8 |
| **Weighted total** | 100% | **8.8 / 10 (88/100)** |

## 13. Approval Status

**Ready with Minor Revisions.** The architecture is approved for Sprint 1. Minor
revisions (stakeholder confirmations and GitHub control enablement) are
non-blocking for P0/P1 and should be resolved before the sprints that depend on
them. No architectural redesign is required.
