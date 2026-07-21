# State Machines

> **Purpose:** State diagrams for the core MRMS entities and lifecycles.
> **Scope:** Meeting, meeting room, booking, check-in, device status, Google sync status.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Software Architecture](../04-Software-Architecture.md), [Database Schema](../08-Database-Schema.md), [Decision Log](../decisions/README.md), [Sequence Diagrams](./SEQUENCE-DIAGRAMS.md)
> **References:** -

All diagrams use Mermaid `stateDiagram-v2`. Enum values reference
[Database Schema](../08-Database-Schema.md).

## 1. Meeting (lifecycle from cache + check-in)

```mermaid
stateDiagram-v2
    [*] --> Scheduled: synced from Google Calendar
    Scheduled --> StartingSoon: within lead window (10m)
    StartingSoon --> AwaitingCheckIn: start time reached
    AwaitingCheckIn --> Active: organizer checks in
    AwaitingCheckIn --> NoShow: no check-in within grace (15m)
    Active --> Finished: end time reached
    NoShow --> [*]
    Finished --> [*]
    Scheduled --> Cancelled: removed in Google Calendar (sync)
    StartingSoon --> Cancelled: removed in Google Calendar (sync)
    AwaitingCheckIn --> Cancelled: removed in Google Calendar (sync)
    Cancelled --> [*]
```

## 2. Meeting Room (RoomStatus - computed, server-authoritative)

```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Reserved: upcoming meeting today
    Reserved --> StartingSoon: next meeting within lead window
    StartingSoon --> Occupied: meeting active (checked in)
    StartingSoon --> Available: no-show grace expired (room released)
    Reserved --> Occupied: active + checked in
    Occupied --> Available: meeting finished
    Available --> Maintenance: admin toggle
    Reserved --> Maintenance: admin toggle
    StartingSoon --> Maintenance: admin toggle
    Occupied --> Maintenance: admin toggle
    Maintenance --> Available: admin clears maintenance
    note right of Maintenance
        Unbookable while in maintenance.
        Status is recomputed from cache +
        check-in + maintenance + now.
    end note
```

## 3. Booking (app-initiated, create-only)

```mermaid
stateDiagram-v2
    [*] --> Created: events.insert succeeded
    [*] --> Failed: events.insert failed (502)
    Created --> Synced: linked to MeetingCache by googleEventId
    Synced --> CancelledExternally: event cancelled in Google Calendar
    Failed --> [*]
    Synced --> [*]
    CancelledExternally --> [*]
    note right of Created
        App never edits/deletes the event.
        Cancellation happens in Google Calendar
        and is detected on sync.
    end note
```

## 4. Check-In (app-only; PostgreSQL)

```mermaid
stateDiagram-v2
    [*] --> Pending: created when meeting enters check-in window
    Pending --> CheckedIn: organizer presses Check-In
    Pending --> NoShow: grace deadline passed with no check-in
    NoShow --> Released: room auto-returned to Available
    CheckedIn --> [*]: meeting finished
    Released --> [*]
    note right of NoShow
        Analytics updated (no-show count).
        Google Calendar NOT modified.
    end note
```

## 5. Device Status (Intel NUC)

```mermaid
stateDiagram-v2
    [*] --> Unknown: device provisioned, no heartbeat yet
    Unknown --> Online: first heartbeat received
    Online --> Online: heartbeat within threshold
    Online --> Degraded: heartbeat ok but telemetry unhealthy (e.g., cam/mic/TV down)
    Degraded --> Online: telemetry healthy again
    Online --> Offline: no heartbeat > 120s
    Degraded --> Offline: no heartbeat > 120s
    Offline --> Online: heartbeat resumes
    note right of Offline
        Admin alert raised.
        Recovery via Display Client Recovery guide.
    end note
```

## 6. Google Sync Status (per room, SyncState)

```mermaid
stateDiagram-v2
    [*] --> Success: initial/successful sync
    Success --> Success: incremental sync ok (nextSyncToken)
    Success --> Partial: some changes applied, some errors
    Success --> Failed: sync error (quota/network/auth)
    Partial --> Success: retry succeeds
    Failed --> Success: retry/backoff succeeds
    Failed --> FullResync: 410 invalid token -> clear token
    FullResync --> Success: bounded full resync completes
    note right of Failed
        Backoff + jitter; surfaced in admin
        sync status; display shows staleness.
    end note
```
