# Backup & Disaster Recovery

> **Purpose:** Define backup, failure-handling, and recovery procedures with RTO/RPO targets.
> **Scope:** PostgreSQL, Redis, Google API dependency, network, server, Intel NUC/Chrome, and offline display behavior.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Risk Register](RISK-REGISTER.md), [Release Management](process/release-management.md), [Display Client Recovery](DISPLAY-CLIENT-RECOVERY.md), [Google Workspace Integration Guide](GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [Observability](OBSERVABILITY.md), [Operations Guide](wiki/operations-guide.md)
> **References:** [PostgreSQL backup](https://www.postgresql.org/docs/current/backup.html)

## 1. Recovery Objectives (targets, to confirm with stakeholders)

| Component | RTO (restore time) | RPO (max data loss) | Notes |
|-----------|--------------------|--------------------|-------|
| PostgreSQL | <= 1 hour | <= 15 min (with PITR/WAL) | App-owned data; core |
| Redis | <= 15 min | Ephemeral (rebuildable) | Cache/queue; no source-of-truth data |
| Backend (API/worker) | <= 15 min | 0 (stateless) | Redeploy pinned images |
| Web/Nginx | <= 15 min | 0 | Redeploy image |
| Reservations | ~immediate | 0 | Held in Google Calendar (SSOT); re-synced |
| A room display | <= 5 min | 0 | Cached schedule; reconnect/re-sync |

Because **Google Calendar is the source of truth** and the app is **create-only**,
reservation data is not lost by an app/DB failure; only app-owned state
(check-in/no-show/analytics/logs/device telemetry) is subject to RPO.

## 2. Backup Strategy

| Data | Method | Frequency | Retention | Storage |
|------|--------|-----------|-----------|---------|
| PostgreSQL (logical) | `pg_dump` per database | Daily | 30 days (confirm) | Off-host, encrypted |
| PostgreSQL (PITR) | WAL archiving + base backup | Continuous WAL | 7-14 days | Off-host |
| Redis | AOF persistence (+ optional RDB snapshot) | Continuous / periodic | Short | Host volume |
| Config/secrets | Managed in secret store (not backed up in VCS) | n/a | n/a | Secret store |
| Docker images | Registry with versioned tags | Per release | Per policy | Registry |

- Backups are **encrypted at rest** and stored **off the primary host**.
- Restore drills are performed periodically (Risk R-24) to prove backups are
  usable; a drill without a successful restore does not count.

## 3. Failure Scenarios & Procedures

### 3.1 Database Recovery (PostgreSQL)
1. Detect via health checks/alerts (see [Observability](OBSERVABILITY.md)).
2. Stop the API/worker writers (maintenance mode) to prevent partial writes.
3. Restore: for PITR, restore base backup + replay WAL to the last good point;
   for logical, restore the latest `pg_dump`.
4. Run `prisma migrate deploy` to confirm schema alignment.
5. Verify integrity (row counts, key tables); resume writers.
6. Trigger a calendar re-sync to refresh the cache.

### 3.2 Redis Recovery
1. Redis holds cache, queues, and pub/sub state - **no source-of-truth data**.
2. Restart Redis (AOF restores recent state). If lost entirely: start fresh.
3. Cache repopulates on demand; scheduled sync + sweep jobs re-run and converge.
4. Re-establish Socket.IO adapter connectivity; displays reconnect and re-sync.

### 3.3 Google API Failure
- App continues serving the **last-known cache**; sync status shows failure;
  displays show a staleness banner (D-005).
- Sync workers retry with backoff (see [Google Workspace Integration Guide](GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md)).
- On recovery: incremental sync (or bounded full resync on invalid token) restores
  freshness. No manual data restore needed - Calendar is authoritative.

### 3.4 Internet Failure (site or server)
- Displays render cached schedule; realtime pauses; reconnect on restore.
- If the server loses internet: booking (event create) and sync are unavailable
  until restored; reads from cache continue. Surface status to admins.

### 3.5 Server (Docker host) Failure
1. Provision/repair the Linux host.
2. Restore Docker + pull versioned images.
3. Restore the PostgreSQL volume/backup (§3.1); start Redis.
4. `docker compose ... up -d` with prod overrides (pinned tags).
5. Verify health, run a sync, confirm displays reconnect.

### 3.6 Mini PC (Intel NUC) Failure
1. Detected via missed heartbeats -> device OFFLINE alert.
2. Replace/repair NUC; reimage using the provisioning image (auto-login, kiosk,
   agent) - see [Display Client Recovery](DISPLAY-CLIENT-RECOVERY.md).
3. Provision a room-scoped device token; open the room Display URL.
4. Confirm heartbeat + realtime + camera/mic permissions.

### 3.7 Chrome Crash Recovery
- Chrome is configured to relaunch on crash; the device agent reports
  Chrome-not-running.
- Kiosk reopens the Display URL and re-subscribes; last-known cache renders while
  reconnecting. Full detail in [Display Client Recovery](DISPLAY-CLIENT-RECOVERY.md).

### 3.8 Offline Display Strategy
- The display keeps the last successfully rendered schedule in memory/local cache
  and shows a clear **offline/staleness banner** with the last-updated time.
- On reconnect, it emits `resync` and refreshes state (D-005).

## 4. Restore Procedure (general)

1. Declare the incident; assign an incident owner.
2. Put the system in maintenance mode where writes are involved.
3. Restore the affected component per §3.
4. Validate health + core flows (display renders, sync succeeds, booking works).
5. Exit maintenance mode; monitor closely.
6. Back-fill/verify app-owned data within the RPO window; note any gaps.
7. Post-incident review; capture actions in the backlog + Risk Register.

## 5. Testing the Plan

- **Restore drills** (DB PITR + logical) on a schedule; record RTO achieved.
- **Failover exercises** (kill API/Redis in staging) to validate reconnect/re-sync.
- Update RTO/RPO targets based on drill results.

## 6. Open Items

- Confirm RTO/RPO targets and backup retention with stakeholders (PRD open
  questions / operations policy).
- Confirm off-host backup storage location and encryption key custody.
