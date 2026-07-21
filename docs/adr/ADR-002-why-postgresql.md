# ADR-002: Why PostgreSQL as the primary datastore

> **Purpose:** Record the choice of PostgreSQL for persistent application data.
> **Scope:** All app-owned persistent data (rooms, cache, check-in, analytics, logs).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Database ERD](../07-Database-ERD.md), [Database Schema](../08-Database-Schema.md), [Database Strategy](../DATABASE-STRATEGY.md), [ADR-007](./ADR-007-why-prisma-orm.md)
> **References:** [PostgreSQL docs](https://www.postgresql.org/docs/)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

MRMS stores relational, strongly-consistent data: sites, rooms, facilities, the
meeting cache, check-in/no-show records, analytics rollups, device telemetry,
logs, and settings. The Master Brief mandates PostgreSQL. Deployment is
on-premise.

## Problem

Which datastore provides reliable relational integrity, transactions, and
analytical query capability for on-premise deployment?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL** | ACID, rich SQL, JSON support, strong indexing, mature on-prem story, great Prisma support | Requires operational care (backups, tuning) |
| MySQL/MariaDB | Popular, ACID | Weaker JSON/analytics ergonomics; less advanced indexing |
| MongoDB | Flexible schema | Weaker relational integrity/transactions across our normalized model; overkill for our relational needs |
| SQLite | Zero-ops | Not suitable for concurrent multi-instance backend or scale |

## Decision

Adopt **PostgreSQL**. Our data model (see Docs 07/08) is inherently relational
with uniqueness and referential-integrity requirements (e.g.,
`MeetingCache(roomId, googleEventId)`), needs transactions (check-in/no-show,
booking records), and benefits from strong indexing and JSON columns
(`SystemLog.metadata`, `Setting.value`). PostgreSQL is mandated and is the best
fit.

## Consequences

- **Positive:** Strong consistency and integrity; transactions; powerful queries
  for analytics; excellent Prisma integration (ADR-007); proven on-prem.
- **Negative / trade-offs:** Team owns backups, PITR, tuning (documented in
  [Disaster Recovery](../DISASTER-RECOVERY.md) and [Database Strategy](../DATABASE-STRATEGY.md)).
- **Neutral:** Runs as a Docker service with a persistent volume.

## Future Considerations

If analytics volume grows substantially, consider a read replica or a dedicated
analytics store; the current rollup table (`AnalyticsDaily`) defers that need.
