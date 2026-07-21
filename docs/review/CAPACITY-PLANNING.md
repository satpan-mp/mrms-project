# Capacity Planning

> **Purpose:** Define scaling strategy and resource expectations across deployment sizes.
> **Scope:** Rooms, concurrent displays/users, Google API limits, Redis memory, and database growth.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [NFR](../03-NFR-Non-Functional-Requirements.md), [Cache Strategy](./CACHE-STRATEGY.md), [Performance Budget](./PERFORMANCE-BUDGET.md), [Deployment Diagram](./DEPLOYMENT-DIAGRAM.md), [Database Strategy](../DATABASE-STRATEGY.md)
> **References:** [Google Calendar quotas](https://developers.google.com/calendar/api/guides/quota)

Current deployment: 3 sites, **14 rooms** (BB=5, GP=3, Jembrana=6). Targets below
show how the same architecture scales.

## 1. Scaling Tiers

| Tier | Rooms | Displays | API | Workers | Redis | PostgreSQL | Notes |
|------|:-----:|:--------:|-----|---------|-------|-----------|-------|
| Small | ~20 | ~20 | 1-2 | 1 | 1 (256 MB) | 1 (2 vCPU/4 GB) | Single host, Compose |
| Medium | ~50 | ~50 | 2 | 2 | 1 (512 MB) | 1 (4 vCPU/8 GB) | Single host, more replicas |
| Large | ~100 | ~100-200 | 2-3 | 2-3 | 1 (1 GB) | 1 (8 vCPU/16 GB) + tuned | Target; validate load |
| X-Large | ~500 | ~500+ | 4+ (LB) | 4+ (by queue) | dedicated/HA (2-4 GB) | primary + read replica; consider partitioning | Multi-host/orchestrator (RFC) |

Displays are mostly idle WebSocket connections with periodic small events, so
connection count matters more than throughput at these sizes.

## 2. Concurrency

- **Concurrent displays (WS):** NFR target >= 200; Socket.IO + Redis adapter scale
  across gateway instances. Each display: 1 long-lived connection, low message
  rate. 500 displays -> add gateway replicas + ensure Redis adapter headroom.
- **Concurrent users (admin/booking):** far lower than displays; bursty at
  meeting boundaries (top of hour). Rate limiting protects auth/booking.
- **Peak pattern:** status changes cluster at :00/:30; sync + no-show sweeps
  spike then. Workers scale by queue depth.

## 3. Google API Limits

- Calendar API has per-project and per-user quotas. With incremental sync + watch
  channels, steady-state calls scale with **change volume**, not room count.
- Per-room sync spacing + backoff prevents bursts. At 100-500 rooms, prefer
  push (watch) over frequent polling; widen poll interval if approaching limits.
- Booking creates are user-driven and low-volume relative to quota.
- Mitigation and monitoring per [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md)
  and Risk R-01.

## 4. Redis Memory

- App cache payloads are small JSON (< ~5 KB/key). Estimate per room: status +
  a few day schedules + meta ~ 20-40 KB.

| Rooms | Approx cache (excl. queue/adapter) | Recommended maxmemory |
|-------|-----------------------------------|-----------------------|
| 20 | < 1 MB | 256 MB |
| 50 | ~2-3 MB | 512 MB |
| 100 | ~4-6 MB | 1 GB |
| 500 | ~20-30 MB | 2-4 GB (dedicate/split cache vs queue) |

Queues (BullMQ) and the Socket.IO adapter add overhead; size with headroom and
`volatile-lru` eviction (see [Cache Strategy §8](./CACHE-STRATEGY.md)).

## 5. Database Growth

Dominant growth is time-series/telemetry and logs, not core catalog.

| Table | Growth driver | Estimate (100 rooms) | Control |
|-------|---------------|----------------------|---------|
| `meeting_cache` | events x rooms x window | ~ hundreds-thousands rows (bounded by sync window) | Purge/aggregate past events |
| `device_heartbeats` | rooms x (86400/30) per day | ~ 288k rows/day @ 100 rooms | **Retention** (prune raw) + rollups |
| `check_ins` | meetings/day | modest | Long-lived (small) |
| `analytics_daily` | rooms x days | small | Long-term retention |
| `system_logs` | activity/audit volume | moderate | Retention per audit policy |
| catalog (sites/rooms/facilities/users) | config | tiny | - |

- **Heartbeats dominate** - retention/rollup jobs are essential (BullMQ
  `retention`, [Database Strategy §6](../DATABASE-STRATEGY.md)). Consider table
  partitioning by time for `device_heartbeats` and `system_logs` at the 500 tier.

## 6. Scale-Out Triggers (when to move up a tier)

| Signal | Action |
|--------|--------|
| API p95 approaching PB-2 under load | Add API replicas |
| WS connections near instance limit / high adapter traffic | Add gateway replicas; check Redis |
| Queue wait time / backlog rising | Add workers; widen sync interval |
| Redis eviction rate rising | Increase maxmemory; split cache/queue Redis |
| DB query p95 rising / disk growth | Tune/index; add read replica; partition telemetry |
| Google quota near limit | Prefer push; widen poll; prioritize active rooms |

## 7. Beyond Single Host (500+ / multi-site HA)

Migrating from Compose (single host) to a multi-host orchestrator (Docker
Swarm/Kubernetes) with a managed/HA PostgreSQL and Redis is a documented future
path requiring an [RFC](../rfc/README.md) (ADR-006 future considerations). The
images are built orchestrator-agnostic to enable this.
