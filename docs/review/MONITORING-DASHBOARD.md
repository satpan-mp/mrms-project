# Monitoring Dashboard

> **Purpose:** Specify the operational monitoring dashboards and the signals they display.
> **Scope:** System resources, sync, realtime, devices, queues, datastores, API, workers.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Observability](../OBSERVABILITY.md), [Performance Budget](./PERFORMANCE-BUDGET.md), [Device Heartbeat Flow](./DEVICE-HEARTBEAT-FLOW.md), [Capacity Planning](./CAPACITY-PLANNING.md)
> **References:** [Grafana](https://grafana.com/)

Dashboards are built in **Grafana** over **Prometheus** (metrics) and **Loki**
(logs), provisioned in Phase P8. This document specifies the panels; the
authoritative metric/alert definitions are in [Observability](../OBSERVABILITY.md).

## 1. Dashboard Panels

| Signal | Panel | Source | Alert threshold |
|--------|-------|--------|-----------------|
| CPU | Host + per-container CPU % | node/cAdvisor | > 85% sustained |
| RAM | Memory usage / limits | node/cAdvisor | > 85% sustained |
| Disk | Disk usage + growth trend | node exporter | > 80% |
| Internet | Google API reachability / egress health | probe | repeated failures |
| Google Sync | Per-room last-success age; failures; duration | app metrics | age > 2x interval |
| WebSocket | Active connections; msgs/sec; reconnects | app metrics | connection drop spike |
| Device Status | Online/Offline/Degraded count + map | app metrics/DB | any OFFLINE |
| Queue | Depth, wait time, failures by queue | BullMQ metrics | backlog/wait high |
| Redis | Memory, evictions, hit ratio, ops/sec | redis exporter | eviction rate up |
| PostgreSQL | Connections, query p95, cache hit, locks | pg exporter | conn saturation; slow queries |
| API | Req rate, latency p50/p95/p99, 5xx rate | app metrics | p95 > PB-2; 5xx spike |
| Workers | Jobs processed/failed; processing time | app metrics | failure rate up |

## 2. Suggested Dashboards

| Dashboard | Audience | Panels |
|-----------|----------|--------|
| **System Overview** | Ops/on-call | CPU, RAM, disk, API latency/errors, WS connections |
| **Sync Health** | Backend/Ops | per-room last-success age, failures, durations, quota usage |
| **Queues** | Backend/Ops | depth, throughput, failures per queue |
| **Devices** | Facilities/IT | online/offline map, resource usage, peripheral status |
| **Datastores** | Ops/DBA | Postgres + Redis health |
| **Business (ops view)** | Product/Ops | bookings, check-ins, no-shows (deep analytics in product module) |

## 3. Health & Heartbeat Integration

- Service health from `/health` (API/workers) and Nginx `/healthz`.
- Device health from heartbeat pipeline
  ([Device Heartbeat Flow](./DEVICE-HEARTBEAT-FLOW.md)); OFFLINE/DEGRADED surface
  on the Devices dashboard and raise alerts.

## 4. Alerting

Alert rules, severities, and routing are defined in
[Observability §5](../OBSERVABILITY.md). Alerts link to the relevant runbook
([Operations Guide](../wiki/operations-guide.md),
[Offline Recovery](./OFFLINE-RECOVERY.md)).

## 5. Log & Metric Retention

Per [Observability §8](../OBSERVABILITY.md): logs ~30d (Loki), metrics ~15d raw
(downsample longer), traces ~7d sampled; raw heartbeats pruned to rollups.

## 6. Rollout

Instrumentation (metrics, health, structured logs, correlation IDs) ships from
Sprint 1; the Grafana/Prometheus/Loki stack and these dashboards are provisioned
in Phase P8 (Infrastructure Backlog IB-007..009).
