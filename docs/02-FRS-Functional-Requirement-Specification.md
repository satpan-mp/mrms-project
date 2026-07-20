# Functional Requirement Specification (FRS)

**Project:** Meeting Room Management System (MRMS)
**Client:** PT Mitra Prodin
**Document:** 02 of 19 — Functional Requirement Specification
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Purpose & Conventions

This FRS enumerates the functional behavior of MRMS. Each requirement has a
stable ID (`FR-<MODULE>-<n>`), a priority, and acceptance criteria phrased so
they can later become test cases.

**Priority:** `MUST` (v1 mandatory), `SHOULD` (v1 desired), `COULD` (nice to
have), `WON'T` (explicitly deferred — see Future Roadmap).

**Actors:** Employee (EMP), Organizer (ORG), Administrator (ADM), Display/Kiosk
(DSP), System/Scheduler (SYS).

---

## 2. Module: Authentication (AUTH)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-AUTH-1 | MUST | The system MUST authenticate users exclusively via Google Workspace OAuth 2.0. |
| FR-AUTH-2 | MUST | On successful OAuth, the system MUST issue a signed JWT containing user id, email, and role. |
| FR-AUTH-3 | MUST | The system MUST assign a role (Employee or Administrator) to each authenticated user. |
| FR-AUTH-4 | MUST | The system MUST enforce Role-Based Access Control (RBAC) on all protected API and WebSocket operations. |
| FR-AUTH-5 | MUST | The system MUST reject expired/invalid tokens and support token refresh. |
| FR-AUTH-6 | SHOULD | The system SHOULD restrict login to the organization's Workspace domain(s). |
| FR-AUTH-7 | MUST | The system MUST record authentication events in the audit log. |
| FR-AUTH-8 | SHOULD | The Display/Kiosk MUST authenticate as a device (room-scoped credential/token), not as a person. |

**Acceptance (sample):** Given a valid Workspace account in the allowed domain,
when the user completes OAuth, then a JWT with the correct role is issued and an
`auth.login` audit entry is written.

---

## 3. Module: Room (ROOM)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-ROOM-1 | MUST | Admin MUST be able to create, view, and update rooms (no calendar-affecting deletes required). |
| FR-ROOM-2 | MUST | Each room MUST store: name, site, capacity, facilities, location, Google Resource ID, status, display URL, optional photo. |
| FR-ROOM-3 | MUST | Each room MUST belong to exactly one site. |
| FR-ROOM-4 | MUST | Admin MUST be able to set a room to Maintenance (⚪), making it unbookable. |
| FR-ROOM-5 | MUST | The system MUST expose a unique, room-specific Display URL per room. |
| FR-ROOM-6 | MUST | Facilities MUST be manageable as a configurable list associated with rooms. |
| FR-ROOM-7 | SHOULD | Admin SHOULD be able to deactivate a room without deleting historical data. |

---

## 4. Module: Site / Administration (SITE / ADMIN)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-SITE-1 | MUST | Admin MUST be able to create, view, and update sites (e.g., BB, GP, Jembrana). |
| FR-SITE-2 | MUST | Number of rooms per site MUST be configurable (BB=5, GP=3, Jembrana=6 as current defaults). |
| FR-ADMIN-1 | MUST | Admin MUST manage rooms, capacity, facilities, and maintenance mode from a central panel. |
| FR-ADMIN-2 | MUST | Admin MUST be able to trigger a Google Calendar sync and view sync status/history. |
| FR-ADMIN-3 | MUST | Admin MUST be able to view system logs, activity logs, and audit logs. |
| FR-ADMIN-4 | MUST | Admin MUST be able to monitor devices (all NUCs). |
| FR-ADMIN-5 | MUST | Admin MUST be able to broadcast announcements to displays. |
| FR-ADMIN-6 | MUST | Admin MUST be able to view the analytics dashboard. |
| FR-ADMIN-7 | MUST | Admin MUST manage global settings (e.g., lead windows, grace period) where configurable. |

---

## 5. Module: Calendar Sync (SYNC)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-SYNC-1 | MUST | The system MUST treat Google Calendar as the single source of truth for reservations. |
| FR-SYNC-2 | MUST | The system MUST read events for each room's Google Resource and store them in a local Meeting Cache. |
| FR-SYNC-3 | MUST | Sync MUST run on a schedule (periodic) and on demand (Admin-triggered). |
| FR-SYNC-4 | SHOULD | Sync SHOULD use incremental sync (sync tokens) and fall back to full sync when tokens are invalid. |
| FR-SYNC-5 | MUST | The system MUST record last successful sync time per room and expose it. |
| FR-SYNC-6 | MUST | The system MUST NOT edit or delete Google Calendar events under any workflow. |
| FR-SYNC-7 | SHOULD | The system SHOULD subscribe to Google push notifications (watch channels) where feasible to reduce latency; otherwise poll. |
| FR-SYNC-8 | MUST | On sync, the system MUST extract Meet/Zoom links, organizer, participants, subject, and time range. |
| FR-SYNC-9 | MUST | Sync failures MUST be logged and surfaced in sync status. |

---

## 6. Module: Booking (BOOK)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-BOOK-1 | MUST | An authenticated user MUST be able to book a room only when it is Available. |
| FR-BOOK-2 | MUST | Booking MUST capture: time, subject, purpose, participants, and target room. |
| FR-BOOK-3 | MUST | Booking MUST create a new Google Calendar event on the room's resource. |
| FR-BOOK-4 | MUST | The system MUST NOT allow editing or deleting an existing event as part of booking. |
| FR-BOOK-5 | MUST | The system MUST validate no time conflict against the current cache before creating an event, and rely on Calendar as the final authority. |
| FR-BOOK-6 | MUST | On successful creation, the system MUST reflect the new event after sync and push a real-time update to the room display. |
| FR-BOOK-7 | SHOULD | Booking SHOULD support inviting participants by email as event attendees. |
| FR-BOOK-8 | MUST | Booking failures (conflict, permission, API error) MUST return a clear reason to the user and be logged. |

---

## 7. Module: Meeting (MEET) & Display (DSP)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-MEET-1 | MUST | The system MUST compute and expose the current meeting and next meeting per room. |
| FR-MEET-2 | MUST | The system MUST compute room status (Available/Occupied/Starting Soon/Maintenance/Reserved) automatically. |
| FR-DSP-1 | MUST | The display MUST show: company logo, current date, realtime clock, room name, capacity, current status, current meeting, next meeting, today's schedule. |
| FR-DSP-2 | MUST | The display MUST show organizer, organizer email, participants, and meeting duration for the current/next meeting. |
| FR-DSP-3 | MUST | The display MUST update in real time without manual refresh. |
| FR-DSP-4 | MUST | The display MUST require no user interaction to show the schedule. |
| FR-DSP-5 | MUST | The display MUST be optimized for Smart TV (large, readable typography) and support Light/Dark modes. |
| FR-DSP-6 | SHOULD | The display SHOULD show a maintenance state clearly when the room is in Maintenance. |
| FR-DSP-7 | SHOULD | The display SHOULD show announcements broadcast by an Admin. |

---

## 8. Module: Check-In (CHECKIN)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-CHECKIN-1 | MUST | The Organizer MUST be able to Check-In a meeting from the display. |
| FR-CHECKIN-2 | MUST | On check-in, the meeting MUST become Active (🔴 Occupied) and be recorded in PostgreSQL. |
| FR-CHECKIN-3 | MUST | Check-in MUST NOT modify the Google Calendar event. |
| FR-CHECKIN-4 | MUST | If no check-in occurs within 15 minutes of start, the room MUST auto-return to Available and the meeting MUST be marked No Show. |
| FR-CHECKIN-5 | MUST | No-show and check-in events MUST update analytics. |
| FR-CHECKIN-6 | SHOULD | The grace period (default 15 min) SHOULD be configurable (global, and optionally per site/room). |
| FR-CHECKIN-7 | MUST | Check-in state transitions MUST be logged. |

---

## 9. Module: Google Meet / Zoom (CONF)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-CONF-1 | MUST | If a meeting has a Google Meet link, the display MUST show Join Meeting. |
| FR-CONF-2 | MUST | Pressing Join Meeting MUST launch Google Meet in a new Chrome window. |
| FR-CONF-3 | MUST | After the meeting ends, Google Meet MUST close and the display MUST return automatically to display mode. |
| FR-CONF-4 | MUST | If a Zoom URL exists, the display MUST show Join Zoom and open the Zoom meeting. |
| FR-CONF-5 | MUST | After the Zoom meeting finishes, the display MUST return automatically to display mode. |
| FR-CONF-6 | SHOULD | The system SHOULD assume webcam/mic/account permissions are pre-granted on the NUC and not prompt. |

---

## 10. Module: Notification / Real-time (NOTIF)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-NOTIF-1 | MUST | The system MUST push real-time updates to displays over WebSocket. |
| FR-NOTIF-2 | MUST | The system MUST notify displays on: Meeting Started, Meeting Finished, Meeting Cancelled, Room Maintenance, Calendar Updated. |
| FR-NOTIF-3 | MUST | Displays MUST reflect status changes without a page refresh. |
| FR-NOTIF-4 | SHOULD | The system SHOULD scope real-time channels per room so a display only receives its room's events (plus site/global broadcasts). |
| FR-NOTIF-5 | SHOULD | On reconnect, a display SHOULD resynchronize current state. |

---

## 11. Module: Monitoring (MON)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-MON-1 | MUST | Each NUC MUST send a periodic heartbeat to the backend. |
| FR-MON-2 | MUST | The system MUST report per device: Online/Offline, CPU, RAM, storage, internet status, Chrome running, Display running, last calendar sync, webcam connected, microphone connected, TV connected. |
| FR-MON-3 | MUST | Admin MUST see device status centrally and be alerted to offline devices. |
| FR-MON-4 | SHOULD | The system SHOULD flag a device Offline after a configurable missed-heartbeat threshold. |
| FR-MON-5 | MUST | Device telemetry MUST be persisted for monitoring and history. |

---

## 12. Module: Analytics (ANALYTICS)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-ANALYTICS-1 | MUST | The system MUST compute: total meetings, meeting hours, occupancy rate, most/least used room, peak hours, no-show meetings, average meeting duration, site utilization. |
| FR-ANALYTICS-2 | MUST | The system MUST provide monthly and yearly trends. |
| FR-ANALYTICS-3 | MUST | Analytics MUST be filterable by site, room, and date range. |
| FR-ANALYTICS-4 | SHOULD | Analytics data SHOULD be exportable (e.g., CSV) for reporting. |
| FR-ANALYTICS-5 | MUST | Analytics MUST derive from calendar cache + check-in logs, not by mutating Calendar. |

---

## 13. Module: Announcements (ANN)

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-ANN-1 | MUST | Admin MUST be able to create an announcement targeted to all displays, a site, or specific rooms. |
| FR-ANN-2 | MUST | Announcements MUST be delivered to targeted displays in real time. |
| FR-ANN-3 | SHOULD | Announcements SHOULD support a start/expiry time. |

---

## 14. Cross-Cutting Functional Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-X-1 | MUST | All state-changing actions MUST be recorded in an activity/audit log with actor, action, target, and timestamp. |
| FR-X-2 | MUST | The system MUST never perform edit or delete on Google Calendar events. |
| FR-X-3 | MUST | Room status MUST be computed server-side (authoritative) and pushed to clients. |
| FR-X-4 | SHOULD | Where an operation would require a forbidden Calendar mutation (e.g., cancel), the system SHOULD direct the user to Google Calendar instead. |

---

## 15. Traceability (Capability → Requirements)

| Capability (PRD §7) | FRS IDs |
|---------------------|---------|
| Room Display | FR-DSP-1..7, FR-MEET-1..2 |
| Availability / Status | FR-MEET-2, FR-X-3 |
| Booking | FR-BOOK-1..8 |
| Calendar Sync | FR-SYNC-1..9 |
| Check-In | FR-CHECKIN-1..7 |
| Meet / Zoom | FR-CONF-1..6 |
| Admin Panel | FR-ADMIN-1..7, FR-SITE-1..2, FR-ROOM-1..7 |
| Device Monitoring | FR-MON-1..5 |
| Analytics | FR-ANALYTICS-1..5 |
| Real-time | FR-NOTIF-1..5 |
| Authentication | FR-AUTH-1..8 |

---

*End of FRS.*
