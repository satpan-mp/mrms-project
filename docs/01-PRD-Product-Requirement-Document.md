# Product Requirement Document (PRD)

**Project:** Meeting Room Management System (MRMS)
**Client:** PT Mitra Prodin
**Document:** 01 of 19 — Product Requirement Document
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Document Purpose

This PRD defines the product vision, goals, target users, scope, and high-level
requirements for the Meeting Room Management System (MRMS). It is the anchor
document for the Functional Requirement Specification (FRS), Non-Functional
Requirements (NFR), and all downstream architecture and design deliverables.

This document describes **what** we are building and **why**. The **how** is
deferred to the architecture and design documents.

---

## 2. Product Vision

> Provide PT Mitra Prodin with a modern, enterprise-grade meeting room
> management platform that turns every meeting room into a self-service,
> always-on information and booking point, while giving facilities and IT teams
> centralized visibility and control across all factory sites.

MRMS makes Google Calendar the single source of truth for reservations, layers
on-premise check-in and analytics on top of it, and drives a fullscreen room
display on an Intel NUC in every room.

---

## 3. Business Objectives

| ID | Objective | Success Indicator |
|------|-----------|-------------------|
| BO-1 | Eliminate ambiguity about room availability | Zero double-booking incidents reported per quarter |
| BO-2 | Increase effective room utilization | Occupancy analytics available; no-show rate reduced measurably after 1 quarter |
| BO-3 | Reduce friction to start meetings | One-tap Join Meet / Join Zoom from the display |
| BO-4 | Provide centralized multi-site administration | All sites/rooms managed from a single Admin Panel |
| BO-5 | Provide device visibility to IT | Real-time health of every NUC visible centrally |
| BO-6 | Keep Google Calendar authoritative | 100% of reservations reflected from Google Calendar |

---

## 4. Target Users & Personas

### 4.1 Employee (Standard User)
- Authenticates via Google Workspace.
- Views schedules, checks availability, books available rooms, checks in, joins
  Google Meet / Zoom.
- Primary touchpoints: the room display (kiosk) and, in future, personal devices.

### 4.2 Meeting Organizer
- An Employee who created (or owns) a meeting.
- Additional capability: performs Check-In for their meeting.

### 4.3 Administrator (Facilities / IT)
- Manages sites, rooms, capacity, facilities, maintenance mode.
- Triggers and monitors Google Calendar sync.
- Monitors devices, views logs, broadcasts announcements.
- Reviews analytics dashboards.

### 4.4 Room Display (System Actor / Kiosk)
- Not a human user. An Intel NUC in Chrome Kiosk mode rendering a room-specific
  display URL. Consumes real-time updates, requires no interaction to show
  schedule, and offers Book/Check-In/Join actions on touch or where enabled.

---

## 5. Deployment Context

- **On-premise** backend running on a Linux server, containerized with Docker,
  fronted by an Nginx reverse proxy over HTTPS.
- Each meeting room has an **Intel NUC (Windows)** that auto-logs-in, auto-starts
  Chrome in **Kiosk Mode**, and opens a room-specific **Display URL** fullscreen.
- Room hardware: Smart TV, webcam, microphone, Google account pre-authenticated
  with camera/mic permissions granted.
- **Google Workspace** is the identity provider and the reservation system of
  record (Google Calendar Resources).

---

## 6. Scope

### 6.1 In Scope (v1)

1. Google Workspace OAuth authentication (Employee + Administrator roles).
2. Room display client (kiosk) showing real-time room status and schedule.
3. Room availability and today's schedule views.
4. Booking of available rooms — creates a **new** Google Calendar event.
5. Google Calendar synchronization (read) — Calendar is single source of truth.
6. Check-in workflow with no-show auto-release (stored in PostgreSQL).
7. Google Meet launch from display; Zoom launch from display.
8. Real-time updates via WebSocket.
9. Admin Panel: sites, rooms, capacity, facilities, maintenance mode, sync
   control/status, logs, device monitoring, announcements, analytics.
10. Device (NUC) monitoring via heartbeat and telemetry.
11. Analytics and utilization reporting.
12. Multi-site support (BB: 5 rooms, GP: 3 rooms, Jembrana: 6 rooms — all
    configurable).

### 6.2 Explicitly Out of Scope (v1)

- **Editing** existing Google Calendar events.
- **Deleting** existing Google Calendar events.
- Non-Google identity providers.
- Native mobile apps, touch booking panels outside rooms, visitor check-in, AI
  assistant, speech-to-text, occupancy sensors, Microsoft Teams integration
  (all in Future Roadmap).

### 6.3 Constraints on Google Calendar

Application permissions are strictly:

| Operation | Allowed |
|-----------|:-------:|
| Read Calendar | ✔ |
| Create Event | ✔ |
| Edit Existing Event | ✘ |
| Delete Existing Event | ✘ |

Any capability that would require edit/delete (e.g., cancelling a booking) must
be handled by directing the user to Google Calendar, never by the application
mutating the event.

---

## 7. Key Product Capabilities (High Level)

| Capability | Summary |
|------------|---------|
| Room Display | Fullscreen, no-interaction schedule + status per room |
| Availability | Real-time status: Available, Occupied, Starting Soon, Maintenance, Reserved |
| Booking | Create new Google Calendar event for an available room |
| Calendar Sync | One-way read from Google Calendar (source of truth) into a local cache |
| Check-In | App-managed check-in; 15-min no-show auto-release; Calendar untouched |
| Meet / Zoom Launch | Open conferencing in new Chrome window; return to display when done |
| Admin Panel | Centralized configuration, monitoring, announcements, analytics |
| Device Monitoring | Heartbeat + telemetry from every NUC |
| Analytics | Utilization, occupancy, peak hours, no-shows, trends |
| Real-time | WebSocket push so displays update instantly |

---

## 8. Meeting Status Model (Product View)

| Status | Meaning |
|--------|---------|
| 🟢 Available | No active meeting; room can be booked now |
| 🔴 Occupied | Meeting active (checked-in or in progress) |
| 🟡 Starting Soon | Meeting begins within the configured lead window |
| ⚪ Maintenance | Administratively unavailable |
| 🔵 Reserved | Upcoming meeting reserved but not yet active |

Status is derived automatically from calendar data, check-in state, maintenance
flag, and the current time; it updates in real time.

---

## 9. Core User Journeys

### 9.1 Book an available room (from display)
1. Employee sees room is 🟢 Available on the display.
2. Taps **Book Now**, selects time, subject, purpose, participants.
3. App creates a new Google Calendar event on the room resource.
4. Sync reflects the event; display updates to 🔵 Reserved / 🟡 Starting Soon.

### 9.2 Check-in and no-show
1. Meeting reaches start time → status 🟡 Starting Soon then 🔵 Reserved/active window.
2. Organizer presses **Check-In** → meeting becomes 🔴 Occupied (Active).
3. If no check-in within 15 minutes → room auto-returns to 🟢 Available, meeting
   marked **No Show**, analytics updated. Google Calendar is not modified.

### 9.3 Join Google Meet
1. Meeting has a Meet link → display shows **Join Meeting**.
2. On press, Google Meet opens in a new Chrome window (account + permissions ready).
3. When the meeting ends, Meet closes and the display returns automatically.

### 9.4 Administer rooms and sites
1. Admin signs in via Google Workspace.
2. Configures sites/rooms/capacity/facilities, toggles maintenance, triggers sync,
   monitors devices, broadcasts announcements, reviews analytics.

---

## 10. Assumptions

- Google Calendar Resources for all rooms already exist and are correctly mapped.
- Each NUC has a stable network path to the on-premise backend.
- Google account on each NUC has webcam/microphone permissions pre-granted.
- Room resource IDs are known and configurable per room.
- Server time and NUC time are synchronized (NTP) for accurate status.

---

## 11. Dependencies

- Google Workspace (OAuth, Calendar API, Calendar Resources).
- Google Meet / Zoom for conferencing links (provided within events).
- On-premise Linux server, Docker runtime, Nginx, PostgreSQL, Redis.

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google API rate limits / outages | Stale display data | Local Meeting Cache + Redis; incremental sync; graceful degradation banner |
| No edit/delete permission limits UX | Cancellations awkward | Clear UX directing users to Google Calendar; document limitation |
| NUC offline | Blank/stale room display | Heartbeat monitoring + last-sync display + cached schedule |
| Clock drift | Wrong status | Enforce NTP; server-authoritative status computation |
| Kiosk lockdown gaps | Users escape kiosk | Chrome kiosk policy hardening (deployment concern) |

---

## 13. Success Metrics (Product KPIs)

- Reduction in reported double-bookings and "who has this room" disputes.
- No-show rate trend after check-in rollout.
- Occupancy rate and peak-hour insight availability per site.
- Display uptime per room (from heartbeat data).
- Median time from "open display" to "join meeting".

---

## 14. Release Approach

Documentation-first (this brief's 19-document sequence), then module-by-module
implementation only after design approval. Detailed phasing is defined in the
Development Roadmap and Sprint Planning documents (18 and 19).

---

## 15. Open Questions (for stakeholder confirmation)

1. Should the display be **touch-enabled** for Book/Check-In in v1, or is v1
   display-only with booking done from personal devices? (Brief implies on-display
   actions; confirming interaction model affects UI.)
2. Confirm the **"Starting Soon"** lead window (e.g., 10 or 15 minutes).
3. Confirm the **no-show grace period** is fixed at 15 minutes or configurable
   per room/site.
4. Who may trigger a manual **Calendar Sync** — Admin only, or also scheduled?
5. Any data residency / audit retention requirements for logs and analytics?

---

*End of PRD.*
