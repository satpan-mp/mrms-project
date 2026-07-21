# Decision Log

> **Purpose:** Chronological log of significant project decisions (product & process), lighter-weight than ADRs.
> **Scope:** Runtime tunables, product rules, process choices, and operational decisions.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [ADR index](../adr/README.md), [RFC](../rfc/README.md), [PRD](../01-PRD-Product-Requirement-Document.md), [Configuration](../CONFIGURATION.md)
> **References:** -

This log records **decisions** and their rationale. ADRs cover deep architectural
decisions; this log covers product rules, timing/tunables, and process choices.
Each entry includes Date, Decision, Reason, Related ADR, and Related RFC.

> Several entries below reference open questions from
> [PRD section 15](../01-PRD-Product-Requirement-Document.md). Values marked
> **(proposed default)** are engineering defaults pending stakeholder confirmation.

## How to add an entry

Append a new numbered entry using this shape:

```
### D-NNN <Title>
- Date:
- Decision:
- Reason:
- Related ADR:
- Related RFC:
- Status: Proposed | Accepted | Superseded by D-NNN
```

## Entries

### D-001 Google Calendar is the reservation Single Source of Truth
- **Date:** 2026-07-20
- **Decision:** Google Calendar owns reservations; the app reads + creates events only (no edit/delete). App-only state (check-in, no-show, analytics) lives in PostgreSQL.
- **Reason:** Preserves existing user workflow, avoids dual-write conflicts, least-privilege security. Mandated by the brief.
- **Related ADR:** [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md)
- **Related RFC:** -
- **Status:** Accepted

### D-002 "Starting Soon" lead window = 10 minutes (proposed default)
- **Date:** 2026-07-20
- **Decision:** A room shows 🟡 Starting Soon when its next meeting begins within `STARTING_SOON_LEAD_MINUTES` (default **10**).
- **Reason:** Balances useful pre-meeting signal against premature status changes. Configurable via Settings.
- **Related ADR:** -
- **Related RFC:** -
- **Status:** Proposed (pending stakeholder confirmation - PRD Q2)

### D-003 No-show auto-release grace = 15 minutes
- **Date:** 2026-07-20
- **Decision:** If no check-in occurs within `NO_SHOW_GRACE_MINUTES` (default **15**) of start, the room auto-returns to Available and the meeting is marked No Show. Google Calendar is not modified.
- **Reason:** Mandated by the brief; frees abandoned rooms while giving a reasonable arrival window.
- **Related ADR:** [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md)
- **Related RFC:** -
- **Status:** Accepted (grace configurability pending - PRD Q3)

### D-004 Meeting status model and authority
- **Date:** 2026-07-20
- **Decision:** Statuses are Available / Occupied / Starting Soon / Maintenance / Reserved, computed **server-side** from cache + check-in + maintenance + time, and pushed to clients.
- **Reason:** One authoritative definition avoids divergence across many displays.
- **Related ADR:** [ADR-008](../adr/ADR-008-clean-architecture-ddd.md)
- **Related RFC:** -
- **Status:** Accepted

### D-005 Display behavior: zero-interaction + graceful degradation
- **Date:** 2026-07-20
- **Decision:** The kiosk display requires no interaction to show status/schedule, updates in realtime, and on backend/Google failure shows the last-known cached schedule with a staleness/offline banner.
- **Reason:** Rooms must always show useful information even during outages.
- **Related ADR:** [ADR-004](../adr/ADR-004-why-socketio-over-mqtt.md)
- **Related RFC:** -
- **Status:** Accepted

### D-006 Conferencing return-to-display is driven by scheduled end time
- **Date:** 2026-07-20
- **Decision:** Join Meet/Zoom opens a new Chrome window; the authoritative trigger to close it and return to display mode is the backend `meeting.finished` signal at scheduled `endTime` (+ `JOIN_AUTO_CLOSE_GRACE_MINUTES`, default 5), with optional kiosk-side heuristics.
- **Reason:** The app cannot rely on Meet/Zoom emitting an app-facing "call ended" event.
- **Related ADR:** -
- **Related RFC:** -
- **Status:** Accepted

### D-007 Authentication rules: Google Workspace only + device tokens
- **Date:** 2026-07-20
- **Decision:** Human users authenticate via Google Workspace OAuth only (JWT access + rotating refresh); displays authenticate as devices with room-scoped, hashed, revocable tokens. RBAC roles: ADMINISTRATOR, EMPLOYEE.
- **Reason:** Single corporate identity provider; kiosks are non-human actors and must be isolated/revocable.
- **Related ADR:** -
- **Related RFC:** -
- **Status:** Accepted (on-display action attribution pending - PRD Q1)

### D-008 Calendar sync cadence and freshness
- **Date:** 2026-07-20
- **Decision:** Use Google watch channels (push) when available plus incremental `syncToken` polling every `SYNC_INTERVAL_SECONDS` (default 60) over a `SYNC_WINDOW_DAYS` (default 14) horizon; renew watch channels before expiry.
- **Reason:** Near-realtime updates with a guaranteed convergence fallback and bounded staleness.
- **Related ADR:** [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md)
- **Related RFC:** -
- **Status:** Accepted (manual-sync trigger policy pending - PRD Q4)

### D-009 Versioning and release tagging
- **Date:** 2026-07-20
- **Decision:** SemVer; pre-1.0 during development. Repo init = v0.1.0; each sprint ends with a tagged release (Sprint 1 -> v0.2.0 ... Sprint 12 -> v1.0.0).
- **Reason:** Predictable, auditable release cadence aligned to sprints.
- **Related ADR:** [ADR-006](../adr/ADR-006-why-docker-deployment.md)
- **Related RFC:** -
- **Status:** Accepted (see [MILESTONES](../MILESTONES.md), [Release Management](../process/release-management.md))
