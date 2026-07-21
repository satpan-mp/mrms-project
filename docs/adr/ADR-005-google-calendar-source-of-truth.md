# ADR-005: Why Google Calendar is the Single Source of Truth

> **Purpose:** Record that Google Calendar owns reservations; the app reads and creates only.
> **Scope:** Reservations, booking, sync, cancellation semantics.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Google Calendar Integration Design](../10-Google-Calendar-Integration-Design.md), [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [Database Schema](../08-Database-Schema.md)
> **References:** [Google Calendar API](https://developers.google.com/calendar/api)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team, stakeholders (PT Mitra Prodin)

## Context

The organization already manages room resources in Google Workspace (Google
Calendar Resources). Employees book rooms through Google Calendar today. The
Master Brief mandates Google Calendar as the source of truth and grants the app
**read + create** permissions only (no edit, no delete).

## Problem

Where does authoritative reservation state live, and how does the app avoid
conflicting with Google Calendar?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Google Calendar as SSOT (read + create only)** | Zero migration; users keep existing workflow; no dual-write conflicts; org-wide visibility | App cannot edit/delete events; must guide users to Calendar for changes; sync latency |
| App database as SSOT (two-way sync) | Full control in-app | Dual-write conflicts; risky two-way sync; contradicts brief; requires edit/delete scopes |
| Hybrid (app owns some events) | Flexible | Ambiguous ownership; conflict-prone; violates mandate |

## Decision

**Google Calendar is the single source of truth.** The app maintains a read-only
projection (`MeetingCache`) and may **create** new events (booking) but never
edits or deletes. App-only concerns (check-in, no-show, analytics) live in
PostgreSQL and never mutate Calendar. Edit/delete scopes are never requested,
enforcing the constraint at the permission level.

## Consequences

- **Positive:** No migration; preserves user workflow; eliminates dual-write
  conflicts; least-privilege security; resilient (cache serves during outages).
- **Negative / trade-offs:** Cancellation/reschedule must be done in Google
  Calendar (UI directs users there); eventual consistency bounded by sync interval;
  the app depends on Google API availability and quotas.
- **Neutral:** Requires robust incremental sync + watch channels (see Doc 10).

## Future Considerations

If the organization ever wants in-app cancellation, it would require additional
Google scopes and a formal RFC re-evaluating this decision and its security impact.
