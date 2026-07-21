# Monitoring Guide

> **Purpose:** Quick operational entry point for observing MRMS health.
> **Scope:** Where to look and what to watch day-to-day.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Observability](../OBSERVABILITY.md), [Operations Guide](./operations-guide.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Troubleshooting](./troubleshooting.md)
> **References:** -

Authoritative detail: [Observability](../OBSERVABILITY.md). This page is the
"where do I look" quick reference.

## What to watch

| Signal | Where | Healthy |
|--------|-------|---------|
| Service health | `/health`, Nginx `/healthz` | 200/ok |
| API latency & errors | Grafana (system overview) | within NFR-PERF; low 5xx |
| Sync health | Grafana (sync dashboard); admin sync status | last-success age < 2x interval |
| Queue backlog | Grafana (queues) | low wait time/depth |
| Device status | Admin device dashboard; `device.status` events | online; recent heartbeat |
| Logs | Loki (by correlationId) | no error spikes |
| Traces | Tempo/Jaeger (OTLP) | no broken/slow spans |

## Alerts

Alert rules and severities are defined in
[Observability §5](../OBSERVABILITY.md) (API down, high error rate, latency SLO,
sync failing, queue backlog, DB/Redis unhealthy, device offline, resource, cert
expiry). Alerts link back to runbooks.

## Daily quick check

1. All services healthy; no critical alerts open.
2. Sync last-success age normal for all rooms.
3. No devices unexpectedly OFFLINE.
4. Error rate and latency within targets.

> The observability stack (Prometheus/Grafana/Loki) is provisioned in Phase P8;
> structured logs, health checks, and heartbeats exist from Sprint 1.
