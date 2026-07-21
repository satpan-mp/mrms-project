# Known Issues

> **Purpose:** Track current limitations and initialization-phase gaps.
> **Scope:** Repository state at v0.1.0 and known product constraints.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Technical Debt](../backlog/technical-debt.md), [Risk Register](../RISK-REGISTER.md), [PRD open questions](../01-PRD-Product-Requirement-Document.md)
> **References:** -

## Initialization-Phase Gaps (v0.1.0)

These are expected at this stage and tracked in
[Technical Debt](../backlog/technical-debt.md):

- No application code yet; `lint`/`typecheck`/`test`/`build` are placeholders
  (TD-001).
- Dockerfiles are buildable skeletons without app build stages (TD-002).
- CI install tolerates a missing lockfile (TD-003); no automated tests yet
  (TD-004).
- Branch protection, labels, and milestones are documented but not applied in
  GitHub (TD-006).
- Secret scanning (gitleaks) not yet wired into CI (TD-007).

## Product Constraints (by design)

- No in-app edit/delete of Google Calendar events (cancel/reschedule via Google
  Calendar) - [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md).
- Display freshness is bounded by the sync interval; brief staleness is possible
  during Google/network issues (mitigated by cache + banner).
- Conferencing return-to-display relies on scheduled end time (+ grace), since
  Meet/Zoom do not emit an app-facing "call ended" signal
  ([D-006](../decisions/README.md)).

## Open Questions (pending stakeholder input)

Tracked from [PRD §15](../01-PRD-Product-Requirement-Document.md):
on-display action attribution, exact Starting-Soon window, grace-period
configurability, manual-sync trigger policy, and log retention.

> As implementation proceeds, bugs are tracked as GitHub issues (Bug template),
> not here. This page lists standing limitations.
