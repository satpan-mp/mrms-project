# Technical Backlog

> **Purpose:** Engineering enablers and non-feature work required to deliver the product safely.
> **Scope:** Backend/frontend scaffolding, cross-cutting concerns, testing infrastructure.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Backend Architecture](../16-Backend-Architecture.md), [Frontend Architecture](../15-Frontend-Architecture.md), [Testing Strategy](../TESTING-STRATEGY.md), [Backlog index](./README.md)
> **References:** -

| ID | Item | Priority | Sprint/Phase | Est |
|----|------|:--------:|--------------|:---:|
| TB-001 | Backend scaffold: NestJS app, module structure, DI, config module | H | S1 / P0 | 8 |
| TB-002 | Prisma schema + initial migration + idempotent seed | H | S1 / P0 | 8 |
| TB-003 | Wire real lint/typecheck/test/build scripts (replace placeholders) | H | S1 / P0 | 5 |
| TB-004 | Shared packages scaffold: @mrms/types, api-client, realtime, ui, hooks, config | H | S1-5 | 8 |
| TB-005 | Auth module: OAuth, JWT (RS256, rotation), guards (RBAC + device) | H | S2 / P0 | 13 |
| TB-006 | Google ACL client (read + create) + token encryption at rest | H | S3 / P1 | 13 |
| TB-007 | Sync worker: incremental syncToken + watch channels + renewal | H | S3-4 / P1 | 13 |
| TB-008 | Pure RoomStatusService + unit tests | H | S4 / P1 | 8 |
| TB-009 | Socket.IO gateway + Redis adapter + event bus | H | S5 / P2 | 8 |
| TB-010 | BullMQ setup + no-show sweep + telemetry rollup + retention jobs | H | S8/S10 | 8 |
| TB-011 | Global exception filter + error envelope + correlation IDs | H | S1-2 | 5 |
| TB-012 | Structured logging (JSON) + logger module | H | S1 / P0 | 5 |
| TB-013 | OpenAPI generation -> typed api-client pipeline | M | S2-3 | 5 |
| TB-014 | AsyncAPI event contracts -> typed realtime package | M | S5 | 5 |
| TB-015 | Test harness: Jest + Testcontainers + Vitest/RTL + Playwright | H | S1-2 | 8 |
| TB-016 | Config validation at startup (fail-fast schema) | H | S1 / P0 | 3 |
| TB-017 | Rate limiting on auth + booking endpoints | M | S2/S7 | 3 |
| TB-018 | Device agent (heartbeat/telemetry) for NUC | M | S10 / P6 | 8 |
