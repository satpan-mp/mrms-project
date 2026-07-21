# ERD Validation

> **Purpose:** Audit the data model for normalization, integrity, indexing, naming, and future scalability.
> **Scope:** The 17-entity PostgreSQL/Prisma schema (Docs 07/08).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin (acting Data/Backend Architect)
> **Last Updated:** 2026-07-20
> **Related Documents:** [Database ERD](../07-Database-ERD.md), [Database Schema](../08-Database-Schema.md), [Database Strategy](../DATABASE-STRATEGY.md), [Capacity Planning](./CAPACITY-PLANNING.md)
> **References:** -

## 1. Verdict

The schema is **well-formed and approved** with a few **recommended (non-blocking)
enhancements** to apply during Sprint 1's schema implementation. Entities: Site,
Room, Facility, RoomFacility, User, MeetingCache, MeetingParticipant, Booking,
CheckIn, Device, DeviceHeartbeat, Announcement, AnnouncementTarget,
AnalyticsDaily, SystemLog, Setting, SyncState.

## 2. Normalization

- Overall **3NF**. No repeating groups; attributes depend on their keys.
- Many-to-many Room↔Facility correctly resolved via `RoomFacility` join.
- `MeetingParticipant` correctly separates attendees from `MeetingCache` (1-N).
- **Intentional denormalization:** `AnalyticsDaily` (pre-aggregated rollups) and
  `MeetingCache` (projection of Google events) - both justified for performance /
  source-of-truth mirroring, not modeling errors.
- **Assessment: PASS.**

## 3. Keys & Foreign Keys

- UUID PKs everywhere (`@default(uuid())`) - good for distributed/merge safety.
- FKs present and typed: Room.siteId, RoomFacility.(roomId,facilityId),
  MeetingCache.roomId, MeetingParticipant.meetingCacheId, Booking.(roomId,
  createdBy, meetingCacheId?), CheckIn.(meetingCacheId, checkedInBy?),
  Device.roomId, DeviceHeartbeat.deviceId, Announcement.createdBy,
  AnnouncementTarget.(announcementId, siteId?, roomId?), AnalyticsDaily.roomId,
  SystemLog.actorUserId?, SyncState.roomId.
- **Assessment: PASS.**

## 4. Uniqueness & Constraints

Present and correct:
- `Room.googleResourceId` unique, `User.googleId` unique, `User.email` unique,
  `Facility.name` unique, `MeetingCache(roomId, googleEventId)` unique,
  `RoomFacility(roomId, facilityId)` unique, `Booking.meetingCacheId` unique,
  `CheckIn.meetingCacheId` unique, `Device.roomId` unique,
  `AnalyticsDaily(roomId, day)` unique, `Setting(key, scope)` unique,
  `SyncState.roomId` unique.

Recommended additions:
- **R1:** Add a DB **CHECK constraint** `endTime > startTime` on `MeetingCache`
  and `Booking` (Prisma lacks native CHECK; add via raw migration SQL).
- **R2:** Consider `Site.code` unique (site codes BB/GP/Jembrana should be unique).
- **R3:** `MeetingParticipant(meetingCacheId, email)` unique to avoid duplicate
  attendees per meeting.

## 5. Cascade Rules

- Cascades defined where children are owned: `RoomFacility`, `MeetingCache`,
  `MeetingParticipant`, `CheckIn`, `DeviceHeartbeat`, `AnnouncementTarget`,
  `AnalyticsDaily`, `SyncState` cascade on parent delete.
- `Room`/`Site` deletion is **discouraged** in favor of soft-deactivation
  (`active=false`) - aligns with [Database Strategy §7](../DATABASE-STRATEGY.md).
- Recommended:
  - **R4:** `Booking.createdBy` / `CheckIn.checkedInBy` / `SystemLog.actorUserId`
    -> `onDelete: SetNull` (nullable) or restrict, to preserve history if a user is
    removed. Confirm behavior explicitly in the schema.

## 6. Indexing

Present: `MeetingCache(roomId, startTime, endTime)`,
`MeetingParticipant(meetingCacheId)`, `Booking(roomId, startTime)`,
`CheckIn(state, graceDeadline)`, `DeviceHeartbeat(deviceId, createdAt)`,
`AnalyticsDaily(day)`, `SystemLog(createdAt)` + `(logType, createdAt)`,
plus unique-index-backed lookups.

Recommended additions:
- **R5:** Index `Room(siteId, active)` for site room lists.
- **R6:** Index `SyncState(watchExpiresAt)` for the watch-renewal sweep.
- **R7:** Index `Booking(createdBy, startTime)` for "my bookings" queries.
- **R8:** Partial/where-indexes not required initially; revisit under load.

## 7. Naming Convention

- Prisma models `PascalCase` singular; tables `snake_case` plural via `@@map`;
  columns `snake_case` via `@map`; enums `PascalCase` + `UPPER_SNAKE_CASE` members;
  FKs `<entity>_id`. Fully consistent with
  [Naming Convention](../standards/naming-convention.md) and
  [Database Convention](../standards/database-convention.md).
- **Assessment: PASS.**

## 8. Data Types & Time

- Timestamps `DateTime` stored UTC; `AnalyticsDaily.day` is `@db.Date`; display
  uses `Site.timezone`. Good.
- `SystemLog.metadata` and `Setting.value` are `Json` - appropriate for flexible
  structures.
- Recommended:
  - **R9:** Consider numeric precision for telemetry floats (cpu/ram/storage) -
    fine as `Float`; document expected 0-100 range and validate at ingest.

## 9. Future Scalability

- **Time-series volume:** `device_heartbeats` and `system_logs` grow fastest.
  Recommend **time-based partitioning** for these at the Large/X-Large tiers plus
  the retention jobs already planned ([Capacity Planning §5](./CAPACITY-PLANNING.md)).
- **Analytics:** `AnalyticsDaily` keeps dashboards fast; a dedicated analytics
  store is only needed at very large scale (documented future option).
- **Read scaling:** add a read replica for analytics/report queries at the 500
  tier.
- **Assessment: Scales to target (100 rooms) as-is; 500-tier needs partitioning +
  replica (documented).**

## 10. Summary of Recommendations (non-blocking)

| ID | Recommendation | When |
|----|----------------|------|
| R1 | CHECK `endTime > startTime` (MeetingCache, Booking) | Sprint 1 schema |
| R2 | Unique `Site.code` | Sprint 1 schema |
| R3 | Unique `MeetingParticipant(meetingCacheId, email)` | Sprint 1 schema |
| R4 | Explicit `onDelete` for user FKs (SetNull/Restrict) | Sprint 1 schema |
| R5 | Index `Room(siteId, active)` | Sprint 1 schema |
| R6 | Index `SyncState(watchExpiresAt)` | Sprint 3 (sync) |
| R7 | Index `Booking(createdBy, startTime)` | Sprint 7 (booking) |
| R9 | Validate telemetry float ranges at ingest | Sprint 10 (monitoring) |
| Part | Partition `device_heartbeats`/`system_logs` | Large/X-Large tier |

These are refinements; none require redesign. The ERD is approved for
implementation.
