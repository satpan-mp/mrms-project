# Event-Driven Flow

> **Purpose:** Document every event in MRMS end-to-end (producers, queues, consumers, effects).
> **Scope:** Domain events, queue jobs, and realtime WebSocket events.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Backend Architecture](../16-Backend-Architecture.md), [API Specification](../09-API-Specification.md), [Sequence Diagrams](./SEQUENCE-DIAGRAMS.md), [Cache Strategy](./CACHE-STRATEGY.md), [Observability](../OBSERVABILITY.md)
> **References:** -

## 1. Canonical Pipeline

```
Source (Google push / schedule / user action / device)
      ↓
BullMQ Queue (sync | checkin | analytics | monitoring | retention)
      ↓
Worker / Use Case  →  PostgreSQL (cache / state)
      ↓
Domain Event → Event Bus (Redis pub/sub)
      ↓
Socket.IO Gateway → scoped channel (room / site / global / admin)
      ↓
Display / Admin  →  UI update  →  Analytics rollup
```

Illustrative (Calendar Updated):

```
Calendar Updated (Google) → Watch push → sync queue → Sync Worker
 → upsert MeetingCache (PG) → RoomStatusChanged event → Redis pub/sub
 → Socket.IO → room:{id} → Display refresh → AnalyticsDaily (nightly rollup)
```

## 2. Event Catalogue

### 2.1 Queue jobs (BullMQ)

| Queue | Job | Producer / Trigger | Consumer effect |
|-------|-----|--------------------|-----------------|
| `sync` | `syncRoom` | Google watch push, schedule (60s), admin manual | Incremental sync -> upsert `MeetingCache` -> emit `calendar.updated`/`room.status` |
| `sync` | `renewWatch` | Schedule (before expiry) | Renew Google watch channel; update `SyncState` |
| `checkin` | `noShowSweep` | Interval (~30s) | `CheckIn` PENDING past grace -> NO_SHOW + release -> emit `meeting.noshow`/`room.status` |
| `analytics` | `rollupDaily` | Nightly + on demand | Build `AnalyticsDaily` from cache + check-ins |
| `monitoring` | `deviceOfflineSweep` | Interval | Flag stale devices OFFLINE -> emit `device.status` |
| `retention` | `pruneTelemetry` | Nightly | Prune old heartbeats/cache per retention |

### 2.2 Domain events (internal, in-proc + Redis pub/sub)

| Event | Raised by | Consumers |
|-------|-----------|-----------|
| `RoomStatusChanged` | Sync, CheckIn, Monitoring, Admin (maintenance) | Notification gateway; cache invalidation |
| `MeetingStarted` | CheckIn (check-in) | Notification; analytics inputs |
| `MeetingFinished` | Scheduler (end time reached) | Notification (drives conferencing return); analytics |
| `MeetingNoShow` | no-show sweep | Notification; analytics |
| `MeetingCancelledExternally` | Sync (event removed) | Notification; cache update |
| `CalendarUpdated` | Sync (changes applied) | Notification; cache invalidation |
| `DeviceStatusChanged` | Monitoring (heartbeat/offline) | Notification (admin) |
| `AnnouncementBroadcast` | Admin | Notification (targeted) |
| `RoomMaintenanceChanged` | Admin | Notification; cache invalidation |

### 2.3 Realtime events (Socket.IO server -> client)

| Event | Channel | Payload (summary) | Effect on client |
|-------|---------|-------------------|------------------|
| `room.status` | `room:{id}` | `{roomId, status, current, next}` | Display re-renders status/cards |
| `calendar.updated` | `room:{id}` | `{roomId}` | Invalidate/refetch room schedule |
| `meeting.started` | `room:{id}` | `{roomId, eventId}` | Mark in progress |
| `meeting.finished` | `room:{id}` | `{roomId, eventId}` | Close Meet/Zoom, return to display |
| `meeting.noshow` | `room:{id}` | `{roomId, eventId}` | Refresh; room now Available |
| `meeting.cancelled` | `room:{id}` | `{roomId, eventId}` | Refresh schedule |
| `room.maintenance` | `room:{id}`, `admin` | `{roomId, maintenance}` | Show/hide maintenance overlay |
| `announcement` | `global`/`site:{id}`/`room:{id}` | `{id, title, message, scope}` | Show banner |
| `device.status` | `admin` | `{deviceId, status}` | Update device dashboard |

Client -> server: `subscribe {roomId}`, `resync {roomId}`, `ping`.

## 3. Delivery Guarantees & Ordering

- Queue jobs: at-least-once (BullMQ); handlers are **idempotent** (cache upserts
  keyed by `(roomId, googleEventId)`; state transitions guarded).
- Realtime events: best-effort push; clients **`resync` on reconnect** so a missed
  event never leaves stale state (see [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md)).
- Convergence guarantee: even if a Google push is missed, the scheduled poll
  reconciles state within the sync interval.
- Ordering: not assumed across events; the server-authoritative
  `RoomStatusService` recomputes from current data, so out-of-order delivery still
  yields correct status.

## 4. Failure Handling per Stage

| Stage | Failure | Handling |
|-------|---------|----------|
| Source (Google push) | Missed/duplicate | Poll convergence; validate channel token |
| Queue | Job failure | Retry w/ backoff + jitter; per-room isolation; DLQ/logged after max |
| Worker -> PG | DB error | Transaction rollback; retry; surfaced in sync status |
| Event bus | Redis down | Cache/queue degraded; on recovery, sweeps/sync re-run; clients resync |
| Gateway -> client | Client offline | Client shows cached data + resyncs on reconnect |

## 5. Observability of Events

Each stage emits metrics/logs with a correlation ID (see
[Observability](../OBSERVABILITY.md)): queue depth/throughput/failures, sync
duration, events emitted, WS messages/sec, and per-room last-success age.
