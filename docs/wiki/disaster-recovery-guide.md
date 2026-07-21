# Disaster Recovery Guide (Quick Reference)

> **Purpose:** Fast operational pointer for recovery during an incident.
> **Scope:** Quick actions; full procedures live in the canonical DR doc.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Disaster Recovery (canonical)](../DISASTER-RECOVERY.md), [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md), [Operations Guide](./operations-guide.md), [Release Management](../process/release-management.md)
> **References:** -

Full, authoritative procedures and RTO/RPO targets:
[Disaster Recovery](../DISASTER-RECOVERY.md). Use this page to act fast.

## First 5 minutes

1. **Declare** the incident; assign an owner.
2. **Identify** the failed component (health checks, alerts, logs).
3. Put write paths in **maintenance mode** if data integrity is at risk.
4. Jump to the relevant procedure below.

## Quick pointers

| Failure | Action | Detail |
|---------|--------|--------|
| Database down/corrupt | Restore PITR/logical backup; `migrate deploy`; re-sync | [DR §3.1](../DISASTER-RECOVERY.md) |
| Redis down | Restart (AOF) or start fresh; caches/queues rebuild | [DR §3.2](../DISASTER-RECOVERY.md) |
| Google unavailable | Serve cache; wait for auto-recovery; check sync status | [DR §3.3](../DISASTER-RECOVERY.md) |
| Internet down | Cached display; reconnect on restore | [DR §3.4](../DISASTER-RECOVERY.md) |
| Server (host) down | Rebuild host from images + restore DB volume | [DR §3.5](../DISASTER-RECOVERY.md) |
| NUC failure | Reimage + reprovision device token | [Display Recovery](../DISPLAY-CLIENT-RECOVERY.md) |
| Bad release | Roll back to previous pinned images | [Release Mgmt §7](../process/release-management.md) |

## Key facts

- **Reservations are safe**: Google Calendar is the source of truth; the app is
  create-only. App-owned data (check-in/analytics/logs) is subject to RPO.
- Always **verify core flows** after recovery: display renders, sync succeeds,
  booking works.
