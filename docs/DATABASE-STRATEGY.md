# Database Strategy

> **Purpose:** Strategic database practices - migrations, rollback, seeding, indexing, backup, retention, soft-delete, audit, naming.
> **Scope:** PostgreSQL via Prisma across all environments.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Database ERD](07-Database-ERD.md), [Database Schema](08-Database-Schema.md), [Database Convention](standards/database-convention.md), [ADR-002](adr/ADR-002-why-postgresql.md), [ADR-007](adr/ADR-007-why-prisma-orm.md), [Disaster Recovery](DISASTER-RECOVERY.md)
> **References:** [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)

This is the **strategy layer**. The schema of record is
[Doc 08](08-Database-Schema.md); binding rules are in the
[Database Convention](standards/database-convention.md). This document adds the
operational strategy (workflow, environments, drills) without duplicating them.

## 1. Migration Strategy

- **Prisma Migrate** is the only mechanism to change schema; never edit the DB by
  hand.
- Workflow: change `schema.prisma` -> `prisma migrate dev` locally (generates a
  named migration) -> review generated SQL -> commit migration **with** the code
  that needs it -> `prisma migrate deploy` in staging/production (CI/CD).
- One logical change per migration; descriptive `snake_case` names
  (`add_check_in_grace_deadline`).
- Migrations are **forward-only** in shared environments; never rewrite an applied
  migration - fix forward with a new one.
- Destructive migrations (drops) require explicit review and a backup beforehand.

## 2. Rollback Strategy

- Prefer a **forward-fix** migration over a down-migration in production.
- For releases with schema changes, the [Release process](process/release-management.md)
  takes a **pre-deploy backup**; if rollback is unavoidable, either apply a
  documented reverse migration or restore from backup within the RPO window (see
  [Disaster Recovery](DISASTER-RECOVERY.md)).
- Because Google Calendar is the source of truth and the app is create-only, a
  rollback never risks reservation data; the cache re-syncs.

## 3. Seed Strategy

- `apps/backend/prisma/seed.ts` seeds baseline data **idempotently**:
  Sites (BB=5, GP=3, Jembrana=6 rooms configurable), Facilities master, Settings
  (timing windows, sync interval, thresholds), and a bootstrap Administrator.
- Environment matrix:

| Env | Seed behavior |
|-----|---------------|
| Local/dev | Full seed incl. sample rooms for development |
| Staging | Real sites/rooms; test admin |
| Production | Sites/rooms/facilities/settings + bootstrap admin only (no sample data) |

- Seeds must be safe to re-run (upserts keyed by natural keys).

## 4. Indexing Strategy

- Index for the hot read paths (see Doc 08):
  `MeetingCache(roomId, startTime, endTime)`, `DeviceHeartbeat(deviceId, createdAt)`,
  `SystemLog(createdAt, logType)`, `AnalyticsDaily(roomId, day)`.
- Enforce uniqueness at the DB: `Room.googleResourceId`, `User.email`,
  `User.googleId`, `MeetingCache(roomId, googleEventId)`, `Setting(key, scope)`.
- Only indexed fields are exposed as API filter/sort keys (see
  [API Strategy](API-STRATEGY.md)).
- Review query plans for new hot paths; add indexes via migration; avoid
  over-indexing write-heavy tables (heartbeats).

## 5. Backup Strategy

- Daily logical `pg_dump` + continuous WAL archiving for PITR; encrypted, stored
  off-host. Full detail and RTO/RPO in [Disaster Recovery](DISASTER-RECOVERY.md).
- Pre-deploy backup before any migration release.
- Periodic **restore drills** to prove backups (Risk R-24).

## 6. Data Retention

| Data | Retention |
|------|-----------|
| `MeetingCache` (past events) | Retain per privacy policy, then purge/aggregate |
| `DeviceHeartbeat` (raw) | N days (configurable), then rely on rollups |
| `SystemLog` (audit) | Per audit policy (NFR-AUDIT-2; pending stakeholder input) |
| `AnalyticsDaily` | Long-term (small footprint) |

Retention is enforced by scheduled worker jobs (BullMQ `retention` queue).

## 7. Soft-Delete Policy

- Prefer **soft deactivation** (`active = false`) over hard deletes for `Room` and
  `Site` to preserve historical analytics and referential integrity.
- Hard deletes are reserved for prunable/derived data (heartbeats, expired cache)
  under retention jobs.
- Deactivated rooms are excluded from booking/availability but retain history.

## 8. Audit Tables

- `SystemLog` serves system/activity/**audit** logs (distinguished by `logType`),
  append-only, with actor/action/target/metadata/timestamp (FR-X-1,
  [Security Guide](SECURITY.md), [Logging Convention](standards/logging-convention.md)).
- No secrets in audit records. Audit retention per policy.

## 9. Naming Convention

- Prisma models `PascalCase` singular; tables `snake_case` plural via `@@map`;
  columns `snake_case` via `@map`; FKs `<entity>_id`; enums `PascalCase` with
  `UPPER_SNAKE_CASE` members. Full rules in the
  [Database Convention](standards/database-convention.md) and
  [Naming Convention](standards/naming-convention.md).

## 10. Consistency & Transactions

- All timestamps stored in **UTC**; presentation uses `Site.timezone`.
- Multi-write operations (booking record, check-in transitions, no-show release)
  run in Prisma transactions (NFR-DATA-3).
- `MeetingCache` upserts are idempotent keyed by `(roomId, googleEventId)`.
- Analytics reads use pre-aggregated `AnalyticsDaily`; heavy aggregation is not on
  the request path.
