# Monitoring & Observability

> **Purpose:** Define how MRMS is observed in production: logging, metrics, tracing, health, alerting, and device monitoring.
> **Scope:** Backend (API/gateway/workers), datastores, and Intel NUC displays.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Logging Convention](standards/logging-convention.md), [NFR](03-NFR-Non-Functional-Requirements.md), [Backend Architecture](16-Backend-Architecture.md), [Disaster Recovery](DISASTER-RECOVERY.md), [Risk Register](RISK-REGISTER.md), [Operations Guide](wiki/operations-guide.md)
> **References:** [Prometheus](https://prometheus.io/), [Grafana](https://grafana.com/), [Grafana Loki](https://grafana.com/oss/loki/), [OpenTelemetry](https://opentelemetry.io/)

Observability rests on three pillars - **logs, metrics, traces** - plus health
checks, alerting, and device/heartbeat monitoring specific to MRMS.

## 1. Logging

- **Structured JSON** logs with correlation IDs, per the
  [Logging Convention](standards/logging-convention.md).
- Shipped to **Loki** (via a log agent / container driver) for centralized search.
- Levels configurable via `APP_LOG_LEVEL` (prod default `info`).
- **No secrets/PII** beyond necessary identifiers.

## 2. Metrics

- Backend exposes Prometheus metrics at `/metrics` (API and workers).
- **Scraped by Prometheus**; visualized in **Grafana** dashboards.

| Metric area | Examples |
|-------------|----------|
| HTTP | request rate, latency histograms (p50/p95/p99), status codes |
| WebSocket | active connections, messages/sec, reconnects |
| Sync | sync duration, events processed, failures, last-success age per room |
| Queues (BullMQ) | job counts, wait time, failures, retries by queue |
| Check-in | check-ins, no-shows swept |
| Domain | bookings created, booking failures by reason |
| Runtime | CPU, memory, event-loop lag, GC |
| DB/Redis | connections, query latency, pool saturation |

## 3. Tracing

- **OpenTelemetry** traces with the same correlation ID propagated from logs.
- Spans across REST -> use case -> repository/gateway (incl. Google API calls) and
  queue jobs, to diagnose latency and failures end-to-end.
- Exportable to an OTLP-compatible backend (e.g., Tempo/Jaeger) - selected at P8.

## 4. Health Checks

- `/health` liveness + readiness on API/workers (NFR-OBS-3), checking DB, Redis,
  and queue connectivity.
- Nginx `/healthz` for edge liveness.
- Compose/orchestrator health checks gate traffic and restarts.

## 5. Alerting Strategy

Alerts route to the team channel/on-call (tool selected at P8). Initial rules:

| Alert | Condition | Severity |
|-------|-----------|----------|
| API down | health failing / no scrape | Critical |
| High error rate | 5xx rate > threshold for N min | High |
| Latency SLO breach | p95 > target (NFR-PERF) sustained | High |
| Sync failing | last-success age > 2x interval, or repeated failures | High |
| Queue backlog | wait time / depth over threshold | Medium |
| DB/Redis unhealthy | connection failures / saturation | Critical/High |
| Device offline | missed heartbeats > `DEVICE_OFFLINE_THRESHOLD_SECONDS` | Medium |
| Disk/resource | host disk/CPU/memory over threshold | High |
| Cert expiry | TLS cert < 14 days to expiry | Medium |

Alerts should be **actionable** and link to the relevant runbook
([Operations Guide](wiki/operations-guide.md), [Disaster Recovery](DISASTER-RECOVERY.md)).

## 6. Heartbeat & Device Monitoring

- Each NUC posts a heartbeat every `DEVICE_HEARTBEAT_INTERVAL_SECONDS` (default 30)
  with telemetry: CPU, RAM, storage, internet, Chrome running, display running,
  webcam/mic/TV connected, last calendar sync (FR-MON-1..5).
- Backend flags a device **OFFLINE** after `DEVICE_OFFLINE_THRESHOLD_SECONDS`
  (default 120) of missed heartbeats and emits `device.status` to the admin channel.
- The Admin dashboard shows live device health; offline/degraded devices raise
  alerts (Risk R-04/R-05).
- Telemetry is persisted (`DeviceHeartbeat`) for history and rolled up; raw rows
  pruned per retention.

## 7. Dashboards (Grafana)

- **System overview:** request rate/latency/errors, WS connections, runtime.
- **Sync health:** per-room last-success age, failures, durations.
- **Queues:** depth, throughput, failures by queue.
- **Devices:** online/offline map, resource usage, peripherals.
- **Business:** bookings, check-ins, no-shows (operational view; deeper analytics
  in the product Analytics module).

## 8. Log & Data Retention

| Data | Retention (proposed) |
|------|----------------------|
| Application logs (Loki) | 30 days (confirm) |
| Metrics (Prometheus) | 15 days raw; longer via downsampling if needed |
| Traces | 7 days (sampled) |
| `DeviceHeartbeat` raw rows | N days then rely on rollups (configurable) |
| Audit logs (`SystemLog` AUDIT) | Per audit policy (NFR-AUDIT-2; pending) |

## 9. Rollout

Observability stack (Prometheus + Grafana + Loki, optional Tempo/Jaeger) is set
up in **Phase P8** (see [Infrastructure Backlog IB-007..009](backlog/infrastructure-backlog.md)).
Structured logging, health checks, and correlation IDs are implemented from
**Sprint 1** so services are observable from day one.
