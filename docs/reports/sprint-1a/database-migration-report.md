# Database Migration Report — Sprint 1A

> **Purpose:** Document the initial Prisma migration, the materialized schema subset, and rollback.
> **Scope:** `apps/backend/prisma` — foundation migration only.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [DB Schema (Doc 08)](../../08-Database-Schema.md), [Database ERD (Doc 07)](../../07-Database-ERD.md), [Database Strategy](../../DATABASE-STRATEGY.md)

---

## 1. Migration inventory

| Migration | Purpose |
|-----------|---------|
| `20260720090000_init_foundation` | Create the foundation tables, enums, and indexes. |

Provider: **PostgreSQL** (Prisma). Client generated via `prisma generate`.

## 2. Materialized schema (foundation subset)

Sprint 1A materializes only the models required for the foundation. This is a
**strict subset** of Document 08, chosen to support auth/identity, audit logging,
and runtime configuration without pulling in feature models prematurely.

| Model | Table | Key columns | Enums | Indexes / constraints |
|-------|-------|-------------|-------|-----------------------|
| `User` | `users` | `id`, `googleId`, `email`, `name`, `role`, `active`, `lastLoginAt` | `UserRole` (ADMINISTRATOR, EMPLOYEE) | unique `googleId`, unique `email` |
| `SystemLog` | `system_logs` | `id`, `actorUserId`, `logType`, `action`, `targetType`, `targetId`, `metadata`, `createdAt` | `LogType` (SYSTEM, ACTIVITY, AUDIT) | index `createdAt`, index `(logType, createdAt)` |
| `Setting` | `settings` | `id`, `key`, `value` (Json), `scope`, `updatedAt` | — | unique `(key, scope)` |

All three are **field-for-field consistent** with Document 08 (names, `@@map`,
enums, `@@unique`, `@@index`). No schema drift.

### Intentionally deferred (not in this migration)

`Site`, `Room`, `Facility`, `RoomFacility`, `MeetingCache`, `MeetingParticipant`,
`Booking`, `CheckIn`, `Device`, `DeviceHeartbeat`, `Announcement`,
`AnnouncementTarget`, `AnalyticsDaily`, `SyncState`, and their enums. These are
added by future migrations as the corresponding features are built, so the
schema history mirrors feature delivery.

## 3. Seed

An **idempotent** seed inserts default runtime `Setting` rows (upsert on
`(key, scope)`), aligned with Document 08 §3 defaults:

- `startingSoonLeadMinutes` (default 10)
- `noShowGraceMinutes` (default 15)
- `syncIntervalSeconds`
- `deviceOfflineThresholdSeconds`

Re-running the seed does not create duplicates.

> **Deferred:** bootstrapping the first Administrator from an allowed Workspace
> admin email (Document 08 §3) requires the Google OAuth identity flow, which is
> not part of 1A. `User.googleId` is `@unique` and non-null; reconciling a
> bootstrap admin against a real `googleId` is scheduled for Sprint 1B (auth).
> Tracked as TD-011.

## 4. Apply / rollback

| Operation | Command | Notes |
|-----------|---------|-------|
| Apply (dev) | `pnpm --filter @mrms/backend prisma migrate dev` | Creates/updates local DB + regenerates client. |
| Apply (prod/CI) | `pnpm --filter @mrms/backend prisma migrate deploy` | Applies pending migrations only; no schema drift prompts. |
| Generate client | `pnpm --filter @mrms/backend prisma generate` | Runs on install/build. |
| Status | `prisma migrate status` | Shows applied vs pending. |

**Rollback strategy:** Prisma migrations are forward-only. Because the initial
migration only **creates** objects on a previously empty database, rollback is a
clean drop of the created tables/enums (or restoring from backup per
[DATABASE-STRATEGY.md](../../DATABASE-STRATEGY.md)). A dedicated down-migration
is unnecessary for the foundation and would be authored per-change once
production data exists.

## 5. Validation

- `prisma generate` succeeds; the generated client typechecks across the workspace (`pnpm -r typecheck` PASS).
- Backend e2e health test passes with a mocked datastore.
- Runtime apply against a live PostgreSQL was **not executed in the build sandbox** (no database service available); this is validated in an environment with Postgres (dev compose or CI) — see the [Docker Compose validation report](./docker-compose-validation.md).

## 6. Actions

| ID | Action | When |
|----|--------|------|
| TD-011 | Reconcile bootstrap Administrator against real Google `googleId` | Sprint 1B (auth) |
| — | Add feature-model migrations incrementally | Per feature sprint |
| — | Run `migrate deploy` in CI against an ephemeral Postgres to validate migrations | Next sprint |

---

*End of Database Migration Report.*
