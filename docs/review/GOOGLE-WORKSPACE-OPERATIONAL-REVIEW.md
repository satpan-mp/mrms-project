# Google Workspace Operational Review

> **Purpose:** Validate the Google Workspace / Calendar integration for operational readiness.
> **Scope:** OAuth, scopes, quota, incremental sync, watch channels, webhook renewal, retry/backoff, caching, failure & offline recovery.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin (acting Integrations Engineer)
> **Last Updated:** 2026-07-20
> **Related Documents:** [Google Calendar Integration Design](../10-Google-Calendar-Integration-Design.md), [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md), [Cache Strategy](./CACHE-STRATEGY.md), [Sequence Diagrams](./SEQUENCE-DIAGRAMS.md)
> **References:** [Google Calendar API](https://developers.google.com/calendar/api)

This is a **validation report** against the canonical design (Doc 10) and
operational guide. It confirms readiness and flags follow-ups; it does not
duplicate those documents.

## Validation Matrix

| Area | Designed? | Assessment | Follow-up |
|------|:---------:|------------|-----------|
| OAuth (user login) | Yes (Doc 12) | PASS - auth-code + domain restriction + state | Confirm allowed domain(s) |
| Service credential (calendar access) | Yes | PASS - SA/delegated user behind ACL | Choose SA vs delegated at deploy |
| Scopes (least privilege) | Yes | PASS - `calendar.readonly` + `calendar.events` only; no edit/delete | None |
| Quota management | Yes | PASS - incremental + watch reduce calls; per-room spacing | Monitor usage (R-01) |
| Incremental sync (syncToken) | Yes | PASS - token stored per room; delta lists | Verify token persistence |
| 410 invalid token handling | Yes | PASS - clear token, bounded full resync | Test path explicitly |
| Watch channels (push) | Yes | PASS - registered per resource; trigger-only | Confirm public callback URL/TLS |
| Watch renewal | Yes | PASS - renew before `watchExpiresAt` (lead 60m) | Index `SyncState(watchExpiresAt)` (ERD R6) |
| Webhook failure handling | Yes | PASS - validate token; poll convergence covers misses | Test missed/duplicate push |
| Retry + exponential backoff | Yes | PASS - backoff + jitter; per-room isolation | Set max attempts + DLQ |
| Caching strategy | Yes | PASS - eventual consistency, bounded staleness | See Cache Strategy |
| Failure recovery | Yes | PASS - serve cache; surface status; no data restore (SSOT) | DR drill in P8 |
| Offline synchronization | Yes | PASS - poll guarantees convergence after outage | Verify after simulated outage |

## Key Confirmations

- **Create-only enforced at the permission level** (no edit/delete scope) - the
  single most important integration guarantee (ADR-005).
- **Google Calendar remains the source of truth**; MRMS never mutates existing
  events; cancellations flow from Calendar to MRMS via sync.
- **Convergence is guaranteed** even if push notifications are missed, because a
  scheduled incremental poll always reconciles state.

## Open Items (non-blocking, pre-dependent-sprint)

1. Confirm the **manual-sync trigger policy** (admin-only vs scheduled) - PRD Q4.
2. Confirm the **public HTTPS callback** for watch channels is reachable from
   Google (firewall/DNS) before enabling push in production.
3. Decide **service account vs delegated user** and provision least-privilege
   credentials (kept in the secret store).
4. Add explicit tests for the **410 full-resync** and **missed-webhook** paths
   ([Testing Strategy](../TESTING-STRATEGY.md)).

## Verdict

**PASS - Ready.** The integration design is complete and operationally sound.
Open items are configuration/verification tasks for P1/P8, not design gaps.
