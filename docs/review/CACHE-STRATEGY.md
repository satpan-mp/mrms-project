# Cache Strategy

> **Purpose:** Define the Redis caching strategy: key structure, TTLs, invalidation, synchronization, recovery, fallback, and memory.
> **Scope:** Redis usage for caching (also used for BullMQ queues and the Socket.IO adapter, noted for completeness).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Backend Architecture](../16-Backend-Architecture.md), [Google Calendar Integration Design](../10-Google-Calendar-Integration-Design.md), [Event-Driven Flow](./EVENT-DRIVEN-FLOW.md), [Performance Budget](./PERFORMANCE-BUDGET.md), [Disaster Recovery](../DISASTER-RECOVERY.md)
> **References:** [Redis docs](https://redis.io/docs/)

## 1. Principles

- Redis is a **performance cache**, never a source of truth. PostgreSQL owns
  app data; Google Calendar owns reservations. Cache is always **rebuildable**.
- Cache hot **read models** (room status, day schedule) to meet NFR-PERF
  (cache read <= 150ms p95; realtime update <= 2s).
- Cache is **eventually consistent** with a bounded staleness (<= sync interval);
  event-driven invalidation keeps it fresh.
- Redis also backs **BullMQ** (queues) and the **Socket.IO Redis adapter**
  (fan-out); those use their own namespaces and are out of scope for TTL policy.

## 2. Key Structure

Namespaced, colon-delimited, versioned keys. Prefix all app cache keys with
`mrms:v1:`.

| Key pattern | Type | Contents |
|-------------|------|----------|
| `mrms:v1:room:{roomId}:status` | JSON string | Computed RoomStatus + current/next summary |
| `mrms:v1:room:{roomId}:schedule:{yyyymmdd}` | JSON string | Day schedule projection for a room |
| `mrms:v1:room:{roomId}:meta` | hash | Room name, capacity, facilities, site, timezone |
| `mrms:v1:site:{siteId}:rooms` | JSON string | Room list + live status tiles (admin grid) |
| `mrms:v1:analytics:summary:{scope}:{from}:{to}` | JSON string | Cached analytics summary |
| `mrms:v1:settings` | hash | Hot runtime settings (windows, intervals, toggles) |
| `mrms:v1:idem:{idempotencyKey}` | string | Booking idempotency result |
| `mrms:v1:ratelimit:{scope}:{id}` | counter | Rate-limit windows (auth/booking) |
| `mrms:v1:synclock:{roomId}` | string (NX) | Per-room sync mutex to avoid concurrent syncs |

Queue/adapter namespaces (managed by libraries): `bull:*`, `socket.io#*`.

## 3. TTL Policy

| Key | TTL | Rationale |
|-----|-----|-----------|
| `room:{id}:status` | 60s (<= sync interval) + event refresh | Bounded staleness; refreshed on events |
| `room:{id}:schedule:{day}` | 300s | Day view changes less often; invalidated on `calendar.updated` |
| `room:{id}:meta` | 3600s | Room metadata rarely changes; invalidated on admin update |
| `site:{id}:rooms` | 30s | Admin live grid; short |
| `analytics:summary:*` | 900s | Expensive to compute; tolerable staleness |
| `settings` | no TTL (event-invalidated) | Hot-reloaded on settings change |
| `idem:*` | 24h | Idempotency window for booking retries |
| `ratelimit:*` | window length | e.g., 60s sliding/fixed window |
| `synclock:*` | 30-60s (auto-expire) | Prevents deadlock if a worker dies |

## 4. Invalidation

- **Event-driven (primary):** consumers of domain events invalidate/patch keys:
  - `calendar.updated` / `RoomStatusChanged` -> delete `room:{id}:status` and
    affected `schedule` keys; recompute lazily on next read or proactively.
  - `room.maintenance` -> invalidate `room:{id}:status`, `site:{id}:rooms`.
  - settings change -> refresh `settings` hash.
  - room metadata update -> invalidate `room:{id}:meta`, `site:{id}:rooms`.
- **TTL (secondary):** natural expiry bounds staleness even if an event is missed.
- **Write-through for settings:** admin writes update DB then refresh cache.
- Prefer **delete-on-write** (lazy recompute) over write-through for status to keep
  the authoritative `RoomStatusService` the single computation path.

## 5. Synchronization

- Per-room `synclock:{roomId}` (SET NX + TTL) ensures only one sync job mutates a
  room's cache at a time; other triggers coalesce.
- Status is computed by the server-authoritative `RoomStatusService`; the cache
  only stores its output, so concurrent readers never see divergent logic.
- Cache writes happen after the PG upsert commits (cache reflects durable state).

## 6. Recovery

- On Redis restart (AOF) or flush, caches are simply **cold**; the app recomputes
  from PostgreSQL on demand and re-populates. No data is lost (not a source of
  truth) - see [Disaster Recovery §3.2](../DISASTER-RECOVERY.md).
- Queues (BullMQ) resume; scheduled sync + sweeps re-run and converge.
- Socket.IO adapter reconnects; clients `resync`.

## 7. Fallback (cache/Redis unavailable)

- **Reads:** fall back directly to PostgreSQL (compute status/schedule live).
  Slightly higher latency but correct.
- **Booking idempotency:** if Redis is down, fall back to a DB-backed idempotency
  check (unique constraint on the idempotency key) so retries remain safe.
- **Rate limiting:** degrade to a conservative in-process limiter if Redis is
  unavailable (fail closed for auth-sensitive routes).
- **Realtime:** if the adapter is down, single-instance delivery still works;
  multi-instance fan-out resumes on recovery.

## 8. Memory Considerations

- Payloads are small JSON summaries; estimate < ~5 KB per room status/schedule
  key. For 100 rooms with status + a few day-schedules: well under tens of MB.
- Set a Redis `maxmemory` with an eviction policy of **`volatile-lru`** so only
  TTL-bearing cache keys are evicted; queue/adapter keys (no TTL by policy) are
  protected. Never use `allkeys-*` eviction (would drop queue/adapter state).
- Monitor `used_memory`, `evicted_keys`, and hit ratio (see
  [Monitoring Dashboard](./MONITORING-DASHBOARD.md)); alert on high eviction.
- Separate concerns if needed at scale: a dedicated Redis (or logical DB index)
  for cache vs. queues vs. adapter to isolate memory pressure (500-room tier -
  see [Capacity Planning](./CAPACITY-PLANNING.md)).

## 9. Anti-Patterns to Avoid

- Do not treat Redis as a database or store the only copy of any state.
- Do not cache secrets or full personal data beyond the display summary fields.
- Do not use unbounded keys without TTL (except intentional queue/adapter/settings).
- Do not recompute status in clients; always consume the server-computed value.
