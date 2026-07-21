# Architecture Decision Records (ADR)

> **Purpose:** Central index of all Architecture Decision Records for MRMS.
> **Scope:** Every significant, hard-to-reverse architectural decision.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Software Architecture](../04-Software-Architecture.md), [Backend Architecture](../16-Backend-Architecture.md), [RFC](../rfc/README.md), [Decision Log](../decisions/README.md)
> **References:** [Michael Nygard - Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

An **Architecture Decision Record** captures a single architectural decision, its
context, the alternatives considered, and its consequences. ADRs are immutable
once accepted; a superseding decision gets a new ADR that references the old one.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](./ADR-001-why-nestjs.md) | Why NestJS for the backend | Accepted | 2026-07-20 |
| [ADR-002](./ADR-002-why-postgresql.md) | Why PostgreSQL as the primary datastore | Accepted | 2026-07-20 |
| [ADR-003](./ADR-003-why-react.md) | Why React + TypeScript + Vite for the frontends | Accepted | 2026-07-20 |
| [ADR-004](./ADR-004-why-socketio-over-mqtt.md) | Why Socket.IO instead of MQTT | Accepted | 2026-07-20 |
| [ADR-005](./ADR-005-google-calendar-source-of-truth.md) | Why Google Calendar is the Single Source of Truth | Accepted | 2026-07-20 |
| [ADR-006](./ADR-006-why-docker-deployment.md) | Why Docker for on-premise deployment | Accepted | 2026-07-20 |
| [ADR-007](./ADR-007-why-prisma-orm.md) | Why Prisma ORM | Accepted | 2026-07-20 |
| [ADR-008](./ADR-008-clean-architecture-ddd.md) | Why Clean Architecture + DDD | Accepted | 2026-07-20 |
| [ADR-009](./ADR-009-foundation-tooling.md) | Foundation tooling: pnpm workspaces, Zod env validation, pino logging, split test runners | Accepted | 2026-07-21 |

## Statuses

`Proposed` -> `Accepted` -> `Deprecated` / `Superseded by ADR-NNN`.

## Adding a new ADR

1. Copy [`adr-template.md`](./adr-template.md) to `ADR-NNN-short-title.md`.
2. Fill every section; keep it focused on **one** decision.
3. Add a row to the index above.
4. If it changes a runtime tunable or product rule, also add a
   [Decision Log](../decisions/README.md) entry.
5. Larger or contested changes should go through an [RFC](../rfc/README.md) first.
