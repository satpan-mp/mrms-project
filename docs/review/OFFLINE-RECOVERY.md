# Offline Recovery

> **Purpose:** Consolidated recovery procedures and expected recovery times for each failure mode.
> **Scope:** Internet, Google API, Redis, database, server, display, NUC, Chrome.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Disaster Recovery](../DISASTER-RECOVERY.md), [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md), [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [Performance Budget](./PERFORMANCE-BUDGET.md), [Observability](../OBSERVABILITY.md)
> **References:** -

This is the audit-level **recovery summary**. Full procedures live in
[Disaster Recovery](../DISASTER-RECOVERY.md) and
[Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md); this consolidates them
with expected recovery times for the review.

## 1. Recovery Matrix

| Failure | Detection | Recovery procedure | Expected recovery time |
|---------|-----------|--------------------|------------------------|
| Internet failure (site) | Heartbeat/WS drop; display banner | Display serves cache; auto-reconnect + resync on restore | Auto on link restore (display <= 10s after) |
| Google API failure | Sync status FAILED; alert | Serve cache; retry w/ backoff; sync resumes; no data restore (SSOT) | Auto on Google recovery |
| Redis failure | Health check; connection errors | Restart (AOF) or fresh; caches/queues rebuild; clients resync | <= 15 min |
| Database failure | Health check; alert | Restore PITR/logical backup; `migrate deploy`; verify; re-sync | <= 1 h (RTO); RPO <= 15 min |
| Server (host) failure | Health/uptime alert | Rebuild host; pull pinned images; restore DB volume; compose up | <= 1 h |
| Display failure (SPA) | Heartbeat: display not running | Kiosk relaunch; cache renders; resync | <= 5 min |
| NUC (Mini PC) restart | Missed heartbeats | Auto-login -> Chrome -> Display URL (no interaction) | <= 5 min after boot |
| NUC hardware failure | OFFLINE alert | Replace + reimage from provisioning image; reprovision token | Hardware-dependent |
| Chrome crash | Agent reports Chrome not running | Auto-relaunch; re-subscribe; cache renders | <= 1-2 min |

## 2. Recovery Principles

- **Reservations are never lost** - Google Calendar is the source of truth and the
  app is create-only. Only app-owned data (check-in/analytics/logs/telemetry) is
  subject to RPO.
- **Graceful degradation** - displays always show last-known data + a staleness/
  offline banner; the local clock keeps ticking.
- **Self-healing** - reconnect with backoff + `resync`; scheduled sync + sweeps
  reconcile state after any outage (convergence guaranteed).
- **Deterministic rollback** - pinned image tags enable exact application rollback.

## 3. Expected Recovery Times (summary)

| Component | RTO | RPO |
|-----------|-----|-----|
| A room display | <= 5 min | 0 (cache) |
| Backend API/worker/web | <= 15 min | 0 (stateless) |
| Redis | <= 15 min | ephemeral |
| PostgreSQL | <= 1 h | <= 15 min |
| Server host | <= 1 h | <= 15 min (DB) |
| Reservations | ~immediate (re-sync) | 0 (Google SSOT) |

(Targets to be confirmed with stakeholders and validated by DR drills in P8 -
see [Disaster Recovery §1/§6](../DISASTER-RECOVERY.md).)

## 4. Drills

- Restore drill (DB PITR + logical) and failover exercises (kill Redis/API in
  staging) are scheduled in P8 to validate RTO/RPO and reconnect/resync
  ([Testing Strategy](../TESTING-STRATEGY.md), Risk R-24).
