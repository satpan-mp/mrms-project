# ADR-007: Why Prisma ORM

> **Purpose:** Record the ORM / data-access choice.
> **Scope:** All PostgreSQL access behind repository ports.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Database Schema](../08-Database-Schema.md), [Database Strategy](../DATABASE-STRATEGY.md), [ADR-002](./ADR-002-why-postgresql.md), [ADR-008](./ADR-008-clean-architecture-ddd.md)
> **References:** [Prisma docs](https://www.prisma.io/docs)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

The backend (NestJS, TypeScript) needs type-safe database access, migrations, and
seeding for PostgreSQL. The Master Brief mandates Prisma. Data access must sit
behind repository ports per Clean Architecture (ADR-008).

## Problem

Which data-access layer gives type safety, ergonomic migrations, and a clean fit
behind repository interfaces?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Prisma** | Generated types from schema, first-class migrations (Prisma Migrate), great DX, transactions, mandated | Query flexibility limits for very complex SQL (mitigated by raw queries when needed) |
| TypeORM | Decorator entities, mature | Historically inconsistent migrations; heavier runtime metadata |
| Knex/Objection | Fine-grained SQL control | More boilerplate; less type safety end-to-end |
| Raw pg driver | Max control | No migrations/types; high boilerplate; error-prone |

## Decision

Adopt **Prisma**. `schema.prisma` (Doc 08) is the single schema definition;
Prisma Migrate manages versioned migrations; generated types flow into the
domain-facing DTOs. Prisma is used **only inside the infrastructure layer**
(repository implementations), keeping the domain framework-free (ADR-008). For
rare complex analytics queries, Prisma's raw query escape hatch is available.

## Consequences

- **Positive:** End-to-end type safety; clean migrations + seed; fast development;
  isolated behind repositories so it can be swapped without touching the domain.
- **Negative / trade-offs:** Very complex queries may need raw SQL; Prisma client
  generation is a build step.
- **Neutral:** Migrations run on deploy (see Database Strategy).

## Future Considerations

If a query pattern outgrows Prisma, encapsulate raw SQL within a repository
implementation without leaking it upward. A different ORM could replace Prisma
behind the same ports if ever necessary.
