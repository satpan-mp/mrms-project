# FAQ

> **Purpose:** Answer frequently asked questions about MRMS.
> **Scope:** Product behavior, integration, and development.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [PRD](../01-PRD-Product-Requirement-Document.md), [Google Calendar Integration Design](../10-Google-Calendar-Integration-Design.md), [Decision Log](../decisions/README.md)
> **References:** -

**Q: Can the app edit or delete a Google Calendar event?**
No. The app has **read + create** permissions only. To cancel or reschedule, use
Google Calendar; the change syncs back to MRMS
([ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md)).

**Q: Where is the source of truth for reservations?**
Google Calendar. MRMS keeps a read cache (`MeetingCache`) and app-only state
(check-in/no-show/analytics) in PostgreSQL.

**Q: How does check-in work and what is a no-show?**
The organizer checks in from the display; the meeting becomes Occupied. If no
check-in occurs within the grace period (default **15 min**), the room
auto-releases and the meeting is marked No Show. Google Calendar is not modified
([Decision Log D-003](../decisions/README.md)).

**Q: When does a room show "Starting Soon"?**
When the next meeting begins within the lead window (default **10 min**,
configurable) ([Decision Log D-002](../decisions/README.md)).

**Q: What happens if the internet or Google is down?**
The display shows the last-known schedule with a staleness banner and recovers
automatically ([Display Recovery](../DISPLAY-CLIENT-RECOVERY.md)).

**Q: How do displays authenticate?**
As devices, using room-scoped, revocable device tokens - not user logins
([Auth Flow](../12-Authentication-Flow.md)).

**Q: How many rooms/sites are supported?**
Configurable per site. Current deployment: BB=5, GP=3, Jembrana=6; architecture
targets 100+ rooms.

**Q: Which browsers/devices run the display?**
Chrome in Kiosk mode on an Intel NUC (Windows) driving a Smart TV
([kiosk setup](../../infrastructure/kiosk/chrome-kiosk.md)).

**Q: Is there application code yet?**
Not yet. The repo is at `v0.1.0` (documentation + scaffolding). Implementation
begins at Sprint 1 ([Roadmap](../18-Development-Roadmap.md)).

**Q: How do I propose a change?**
Open an [RFC](../rfc/README.md) for significant changes; small changes go straight
to a branch + PR ([CONTRIBUTING](../../CONTRIBUTING.md)).
