# Maintenance Guide

> **Purpose:** Routine upkeep tasks to keep MRMS healthy.
> **Scope:** Dependencies, database, backups, tokens, retention, certificates.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Operations Guide](./operations-guide.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Database Strategy](../DATABASE-STRATEGY.md), [Security Guide](../SECURITY.md), [Observability](../OBSERVABILITY.md)
> **References:** -

## Routine Cadence

| Task | Frequency | Reference |
|------|-----------|-----------|
| Verify backups + run a restore drill | Monthly | [Disaster Recovery](../DISASTER-RECOVERY.md) |
| Review dependency updates (Dependabot) + security advisories | Weekly | [Security](../SECURITY.md), R-23 |
| Rotate secrets (per policy) | Quarterly / on incident | [Secrets](../SECRETS.md) |
| Rotate device tokens | ~90 days | [Auth Flow](../12-Authentication-Flow.md) |
| Renew TLS certificates | Before expiry (alert at 14d) | [Observability](../OBSERVABILITY.md) |
| Prune telemetry/logs per retention | Automated (verify) | [Database Strategy §6](../DATABASE-STRATEGY.md) |
| Review Risk Register | Each sprint boundary | [Risk Register](../RISK-REGISTER.md) |
| Confirm watch-channel renewals healthy | Weekly | [Google Guide §7](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md) |

## Database Maintenance

- Migrations via Prisma Migrate only; back up before migration releases.
- Monitor index health and query performance for hot paths
  ([Database Strategy](../DATABASE-STRATEGY.md)).

## Upgrades

- Update base images (Node/Postgres/Redis/Nginx) via PR; rebuild and test in
  staging before production.
- Follow [Release Management](../process/release-management.md) for versioning and
  rollout.

## Housekeeping

- Ensure retention jobs run (heartbeats, past cache, logs).
- Verify Grafana dashboards and alert rules remain accurate after changes.
