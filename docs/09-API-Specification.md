# API Specification

**Project:** Meeting Room Management System (MRMS)
**Document:** 09 of 19 — API Specification (REST + WebSocket)
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Conventions

- **Base URL:** `https://<host>/api/v1`
- **Format:** JSON; UTF-8; timestamps ISO-8601 UTC (e.g., `2026-07-20T09:30:00Z`).
- **Auth:** `Authorization: Bearer <JWT>` for user/admin; device endpoints use a
  room-scoped device token (`X-Device-Token`).
- **RBAC:** `EMPLOYEE` and `ADMINISTRATOR`; admin-only routes are marked 🔒ADM.
- **Errors:** consistent envelope:

```json
{
  "error": {
    "code": "ROOM_NOT_AVAILABLE",
    "message": "The room is not available for the requested time.",
    "details": {}
  },
  "correlationId": "b1f9..."
}
```

- **Pagination:** `?page=1&pageSize=25` → `{ "data": [...], "meta": { "page", "pageSize", "total" } }`.
- **Idempotency:** `POST /bookings` accepts `Idempotency-Key` header to prevent
  duplicate event creation.

---

## 2. Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth/google` | public | Start Google OAuth |
| GET | `/auth/google/callback` | public | OAuth callback → issues JWT |
| POST | `/auth/refresh` | refresh token | Refresh access token |
| POST | `/auth/logout` | user | Invalidate session |
| GET | `/me` | user | Current user profile/role |
| GET | `/sites` | user | List sites |
| POST | `/sites` | 🔒ADM | Create site |
| PATCH | `/sites/{id}` | 🔒ADM | Update site |
| GET | `/rooms` | user | List rooms (filter by site, status) |
| GET | `/rooms/{id}` | user | Room detail |
| POST | `/rooms` | 🔒ADM | Create room |
| PATCH | `/rooms/{id}` | 🔒ADM | Update room / maintenance toggle |
| GET | `/rooms/{id}/schedule` | user/device | Today's schedule + current/next |
| GET | `/rooms/{id}/status` | user/device | Computed room status |
| GET | `/facilities` | user | List facilities |
| POST | `/facilities` | 🔒ADM | Create facility |
| POST | `/bookings` | user | Create booking (creates Google event) |
| GET | `/bookings` | user | List own bookings (admin: all) |
| GET | `/bookings/{id}` | user | Booking detail |
| POST | `/meetings/{eventId}/check-in` | user | Check in a meeting |
| GET | `/meetings/{eventId}` | user/device | Meeting detail (from cache) |
| POST | `/sync/rooms/{id}` | 🔒ADM | Trigger sync for a room |
| POST | `/sync/all` | 🔒ADM | Trigger full sync |
| GET | `/sync/status` | 🔒ADM | Sync status per room |
| POST | `/devices/{roomId}/heartbeat` | device | Submit heartbeat/telemetry |
| GET | `/devices` | 🔒ADM | Device status list |
| GET | `/devices/{id}` | 🔒ADM | Device detail + recent telemetry |
| POST | `/announcements` | 🔒ADM | Create/broadcast announcement |
| GET | `/announcements` | user/device | Active announcements (scoped) |
| GET | `/analytics/summary` | 🔒ADM | KPIs (filter site/room/date range) |
| GET | `/analytics/trends` | 🔒ADM | Monthly/yearly trends |
| GET | `/logs` | 🔒ADM | System/activity/audit logs |
| GET | `/settings` | 🔒ADM | Runtime settings |
| PATCH | `/settings` | 🔒ADM | Update settings |
| GET | `/health` | public | Liveness/readiness |

---

## 3. Representative Request/Response Contracts

### 3.1 Get room status (display polls or receives via WS)
`GET /rooms/{id}/status`
```json
{
  "roomId": "…",
  "status": "STARTING_SOON",
  "now": "2026-07-20T09:52:00Z",
  "current": null,
  "next": {
    "eventId": "abc",
    "subject": "Sprint Review",
    "organizerName": "Andi",
    "organizerEmail": "andi@company.com",
    "startTime": "2026-07-20T10:00:00Z",
    "endTime": "2026-07-20T11:00:00Z",
    "durationMinutes": 60,
    "participants": [{ "email": "…", "name": "…", "responseStatus": "ACCEPTED" }],
    "meetUrl": "https://meet.google.com/…",
    "zoomUrl": null
  },
  "maintenance": false
}
```

### 3.2 Create booking (create-only against Google Calendar)
`POST /bookings`  (headers: `Authorization`, `Idempotency-Key`)
```json
{
  "roomId": "…",
  "subject": "Design Sync",
  "purpose": "Finalize wireframes",
  "startTime": "2026-07-20T13:00:00Z",
  "endTime": "2026-07-20T13:30:00Z",
  "participants": ["a@company.com", "b@company.com"]
}
```
Success `201`:
```json
{
  "bookingId": "…",
  "status": "CREATED",
  "googleEventId": "evt_…",
  "roomId": "…",
  "startTime": "2026-07-20T13:00:00Z",
  "endTime": "2026-07-20T13:30:00Z"
}
```
Errors: `409 ROOM_NOT_AVAILABLE`, `403 ROOM_IN_MAINTENANCE`,
`422 INVALID_TIME_RANGE`, `502 GOOGLE_CREATE_FAILED`.

> The API never edits or deletes events. Cancellation is not supported here; the
> response documentation directs users to Google Calendar.

### 3.3 Check-in (PostgreSQL only; Calendar untouched)
`POST /meetings/{eventId}/check-in`
```json
{ "roomId": "…" }
```
Success `200`:
```json
{
  "eventId": "evt_…",
  "state": "CHECKED_IN",
  "checkedInAt": "2026-07-20T10:03:00Z",
  "roomStatus": "OCCUPIED"
}
```
Errors: `404 MEETING_NOT_FOUND`, `409 ALREADY_CHECKED_IN`,
`410 CHECKIN_WINDOW_EXPIRED` (already marked NO_SHOW/released).

### 3.4 Device heartbeat
`POST /devices/{roomId}/heartbeat`  (header: `X-Device-Token`)
```json
{
  "cpuUsage": 22.5, "ramUsage": 41.0, "storageUsage": 60.2,
  "internetOk": true, "chromeRunning": true, "displayRunning": true,
  "webcamConnected": true, "microphoneConnected": true, "tvConnected": true,
  "lastCalendarSync": "2026-07-20T09:50:00Z"
}
```
Success `202 Accepted`.

### 3.5 Analytics summary
`GET /analytics/summary?siteId=…&from=2026-07-01&to=2026-07-20`
```json
{
  "range": { "from": "2026-07-01", "to": "2026-07-20" },
  "totalMeetings": 412,
  "meetingHours": 618.5,
  "occupancyRate": 0.57,
  "mostUsedRoom": { "roomId": "…", "name": "BB-Aula", "meetings": 74 },
  "leastUsedRoom": { "roomId": "…", "name": "GP-Small-2", "meetings": 6 },
  "peakHours": [{ "hour": 10, "count": 88 }, { "hour": 14, "count": 79 }],
  "noShowMeetings": 23,
  "averageMeetingMinutes": 47,
  "siteUtilization": [{ "siteId": "…", "code": "BB", "occupancyRate": 0.62 }]
}
```

---

## 4. WebSocket API (Socket.IO)

**Endpoint:** `wss://<host>/realtime` (Nginx upgrades). Auth via JWT (users/admin)
or device token (displays) in the connection handshake.

### 4.1 Rooms / channels
| Channel | Join rule | Purpose |
|---------|-----------|---------|
| `room:{roomId}` | display for that room; any authed user | Room status & meeting events |
| `site:{siteId}` | admin; displays of the site | Site-scoped announcements |
| `global` | all connections | Global announcements |
| `admin` | 🔒ADM only | Device/sync/system events |

### 4.2 Server → Client events
| Event | Payload | Trigger (FRS) |
|-------|---------|---------------|
| `room.status` | `{ roomId, status, current, next }` | Status recompute / FR-NOTIF-2 |
| `meeting.started` | `{ roomId, eventId }` | Check-in → active |
| `meeting.finished` | `{ roomId, eventId }` | End time reached |
| `meeting.cancelled` | `{ roomId, eventId }` | Detected removed at sync |
| `meeting.noshow` | `{ roomId, eventId }` | No-show sweep |
| `calendar.updated` | `{ roomId }` | Sync applied changes |
| `room.maintenance` | `{ roomId, maintenance }` | Admin toggle |
| `announcement` | `{ id, title, message, scope }` | Broadcast |
| `device.status` | `{ deviceId, status }` (admin) | Heartbeat/offline |

### 4.3 Client → Server events
| Event | Payload | Notes |
|-------|---------|-------|
| `subscribe` | `{ roomId }` | Display subscribes to its room |
| `resync` | `{ roomId }` | On reconnect, request current state |
| `ping` | `{}` | Liveness (optional; heartbeat is REST) |

---

## 5. Status Codes & Error Codes

| HTTP | Meaning | Example codes |
|------|---------|---------------|
| 200/201/202 | Success | — |
| 400 | Bad request | `VALIDATION_ERROR` |
| 401 | Unauthenticated | `TOKEN_INVALID`, `TOKEN_EXPIRED` |
| 403 | Forbidden | `FORBIDDEN_ROLE`, `ROOM_IN_MAINTENANCE` |
| 404 | Not found | `ROOM_NOT_FOUND`, `MEETING_NOT_FOUND` |
| 409 | Conflict | `ROOM_NOT_AVAILABLE`, `ALREADY_CHECKED_IN` |
| 410 | Gone | `CHECKIN_WINDOW_EXPIRED` |
| 422 | Unprocessable | `INVALID_TIME_RANGE` |
| 429 | Rate limited | `RATE_LIMITED` |
| 502/503 | Upstream/Google | `GOOGLE_CREATE_FAILED`, `GOOGLE_UNAVAILABLE` |

---

## 6. Documentation & Contracts

- REST documented via **OpenAPI 3.1** (`/api/docs` Swagger UI in non-prod).
- WebSocket documented via **AsyncAPI** for event contracts.
- DTOs validated with `class-validator`; schemas generated from Nest decorators.

---

*End of API Specification.*
