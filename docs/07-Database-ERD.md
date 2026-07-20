# Database ERD

**Project:** Meeting Room Management System (MRMS)
**Document:** 07 of 19 — Entity Relationship Diagram
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Purpose

Logical data model for MRMS in PostgreSQL. It reflects that **Google Calendar is
the source of truth** — reservation detail is mirrored into `MeetingCache`, while
app-owned state (check-in, no-show, analytics, monitoring, logs, settings) lives
authoritatively in PostgreSQL.

---

## 2. Entity Overview

| Entity | Ownership | Notes |
|--------|-----------|-------|
| User | App | From Google Workspace identity; role assigned |
| Site | App | Factory site (BB, GP, Jembrana...) |
| Room | App | Maps 1:1 to Google Resource and one display |
| Facility | App | Master list of facilities |
| RoomFacility | App | Join Room↔Facility (many-to-many) |
| MeetingCache | Mirror | Projection of Google Calendar events per room |
| MeetingParticipant | Mirror | Attendees of a cached meeting |
| Booking | App | App-initiated create → links to created event |
| CheckIn | App | Check-in / no-show state per meeting occurrence |
| Device | App | One NUC per room |
| DeviceHeartbeat | App | Time-series telemetry |
| Announcement | App | Broadcast messages |
| AnnouncementTarget | App | Scope of an announcement |
| AnalyticsDaily | App | Pre-aggregated daily metrics per room |
| SystemLog | App | System/activity/audit log |
| Setting | App | Runtime configuration key/value |
| SyncState | App | Per-room calendar sync tokens/status |

---

## 3. ERD

```mermaid
erDiagram
    SITE ||--o{ ROOM : has
    ROOM ||--o| DEVICE : "displayed by"
    ROOM ||--o{ ROOM_FACILITY : has
    FACILITY ||--o{ ROOM_FACILITY : "in"
    ROOM ||--o{ MEETING_CACHE : "scheduled in"
    ROOM ||--o{ BOOKING : "booked as"
    ROOM ||--o| SYNC_STATE : "sync tracked by"
    MEETING_CACHE ||--o{ MEETING_PARTICIPANT : includes
    MEETING_CACHE ||--o| CHECKIN : "check-in for"
    MEETING_CACHE ||--o| BOOKING : "created via"
    USER ||--o{ BOOKING : creates
    USER ||--o{ CHECKIN : performs
    USER ||--o{ SYSTEM_LOG : actor
    DEVICE ||--o{ DEVICE_HEARTBEAT : emits
    ROOM ||--o{ ANALYTICS_DAILY : "aggregated for"
    ANNOUNCEMENT ||--o{ ANNOUNCEMENT_TARGET : targets
    SITE ||--o{ ANNOUNCEMENT_TARGET : "scoped to"
    ROOM ||--o{ ANNOUNCEMENT_TARGET : "scoped to"

    SITE {
        uuid id PK
        string code
        string name
        string timezone
        boolean active
    }
    ROOM {
        uuid id PK
        uuid site_id FK
        string name
        int capacity
        string location
        string google_resource_id
        string display_url
        string photo_url
        enum status
        boolean maintenance
        boolean active
    }
    FACILITY {
        uuid id PK
        string name
        string icon
    }
    ROOM_FACILITY {
        uuid id PK
        uuid room_id FK
        uuid facility_id FK
    }
    USER {
        uuid id PK
        string google_id
        string email
        string name
        string avatar_url
        enum role
        boolean active
        datetime last_login_at
    }
    MEETING_CACHE {
        uuid id PK
        uuid room_id FK
        string google_event_id
        string ical_uid
        string subject
        string description
        string organizer_email
        string organizer_name
        datetime start_time
        datetime end_time
        string meet_url
        string zoom_url
        enum source
        datetime synced_at
    }
    MEETING_PARTICIPANT {
        uuid id PK
        uuid meeting_cache_id FK
        string email
        string name
        enum response_status
    }
    BOOKING {
        uuid id PK
        uuid room_id FK
        uuid created_by FK
        uuid meeting_cache_id FK
        string subject
        string purpose
        datetime start_time
        datetime end_time
        string google_event_id
        enum status
        datetime created_at
    }
    CHECKIN {
        uuid id PK
        uuid meeting_cache_id FK
        uuid checked_in_by FK
        datetime scheduled_start
        datetime checked_in_at
        datetime grace_deadline
        enum state
        datetime released_at
    }
    DEVICE {
        uuid id PK
        uuid room_id FK
        string hostname
        string agent_token_hash
        enum status
        datetime last_heartbeat_at
    }
    DEVICE_HEARTBEAT {
        uuid id PK
        uuid device_id FK
        float cpu_usage
        float ram_usage
        float storage_usage
        boolean internet_ok
        boolean chrome_running
        boolean display_running
        boolean webcam_connected
        boolean microphone_connected
        boolean tv_connected
        datetime last_calendar_sync
        datetime created_at
    }
    ANNOUNCEMENT {
        uuid id PK
        uuid created_by FK
        string title
        string message
        enum scope
        datetime starts_at
        datetime expires_at
        boolean active
    }
    ANNOUNCEMENT_TARGET {
        uuid id PK
        uuid announcement_id FK
        uuid site_id FK
        uuid room_id FK
    }
    ANALYTICS_DAILY {
        uuid id PK
        uuid room_id FK
        date day
        int total_meetings
        int meeting_minutes
        int no_shows
        int occupied_minutes
        float occupancy_rate
    }
    SYSTEM_LOG {
        uuid id PK
        uuid actor_user_id FK
        enum log_type
        string action
        string target_type
        string target_id
        json metadata
        datetime created_at
    }
    SETTING {
        uuid id PK
        string key
        json value
        string scope
        datetime updated_at
    }
    SYNC_STATE {
        uuid id PK
        uuid room_id FK
        string sync_token
        string watch_channel_id
        string watch_resource_id
        datetime watch_expires_at
        enum last_status
        string last_error
        datetime last_synced_at
    }
```

---

## 4. Relationship Notes

- **Site 1—N Room**; **Room 1—0..1 Device** (one NUC per room, optional until installed).
- **Room N—M Facility** through `RoomFacility`.
- **Room 1—N MeetingCache**; a cached meeting has **N participants**.
- **Booking** optionally links to the `MeetingCache` row once the created event
  syncs back (matched by `google_event_id`).
- **CheckIn** is keyed to a specific meeting occurrence (`meeting_cache_id`) and
  never writes to Google Calendar.
- **SyncState** is per-room and stores the incremental `sync_token` and Google
  watch-channel metadata.
- **AnalyticsDaily** is a derived rollup (populated by a worker) for fast dashboards.
- **SystemLog** covers system, activity, and audit logs distinguished by `log_type`.

---

## 5. Enumerations

| Enum | Values |
|------|--------|
| RoomStatus | AVAILABLE, OCCUPIED, STARTING_SOON, MAINTENANCE, RESERVED |
| UserRole | ADMINISTRATOR, EMPLOYEE |
| MeetingSource | GOOGLE_CALENDAR, APP_BOOKING |
| ResponseStatus | ACCEPTED, DECLINED, TENTATIVE, NEEDS_ACTION |
| BookingStatus | CREATED, SYNCED, FAILED, CANCELLED_EXTERNALLY |
| CheckInState | PENDING, CHECKED_IN, NO_SHOW, RELEASED |
| DeviceStatus | ONLINE, OFFLINE, DEGRADED, UNKNOWN |
| AnnouncementScope | GLOBAL, SITE, ROOM |
| LogType | SYSTEM, ACTIVITY, AUDIT |
| SyncStatus | SUCCESS, PARTIAL, FAILED |

---

## 6. Indexing & Integrity (highlights)

- Unique: `Room.google_resource_id`, `User.google_id`, `User.email`,
  `MeetingCache(room_id, google_event_id)`, `Setting.key(+scope)`.
- Hot query indexes: `MeetingCache(room_id, start_time, end_time)`,
  `DeviceHeartbeat(device_id, created_at)`, `SystemLog(created_at, log_type)`,
  `AnalyticsDaily(room_id, day)`.
- FK cascade: deleting a `Room` is discouraged; prefer `active=false`. Cache and
  heartbeat rows are prunable by retention policy.

---

*End of Database ERD.*
