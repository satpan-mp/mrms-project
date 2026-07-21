# Definition of Ready (DoR)

> **Purpose:** Define when a backlog item is allowed to enter a development sprint.
> **Scope:** All Product/Technical/Infrastructure backlog items before they are worked.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Definition of Done](./definition-of-done.md), [Backlog index](../backlog/README.md), [Sprint Planning](../19-Sprint-Planning.md), [FRS](../02-FRS-Functional-Requirement-Specification.md)
> **References:** -

An item is **Ready** only when a reviewer can confidently start it without
blocking questions. Items that fail the DoR stay in the backlog and are refined.

## Mandatory Checklist

A backlog item is Ready when ALL of the following are true:

- [ ] **Clear description** of the desired outcome (the "what" and "why").
- [ ] **Traceability**: linked to a requirement (FRS `FR-*`), ADR, or RFC where
      applicable.
- [ ] **Acceptance criteria** are explicit and testable (bullet list).
- [ ] **Scope is bounded** and fits within a single sprint (else split it).
- [ ] **Dependencies identified** and either resolved or scheduled (no hard
      blockers).
- [ ] **Design references** available (relevant `docs/` sections, API/schema
      shapes) so no architectural discovery is required mid-task.
- [ ] **Data/schema impact** understood (new tables/migrations flagged).
- [ ] **Security impact** considered (auth, RBAC, secrets, data exposure).
- [ ] **Test approach** identified (unit/integration/e2e as appropriate).
- [ ] **Estimate** agreed by the team (story points).
- [ ] **Assigned to a sprint/milestone** with a priority.
- [ ] **Non-functional expectations** noted where relevant (performance,
      accessibility, realtime latency).

## For items touching Google integration

- [ ] Confirms read/create-only semantics (never edit/delete) - ref
      [ADR-005](../adr/ADR-005-google-calendar-source-of-truth.md).
- [ ] Quota/rate-limit and failure handling considered.

## For items touching the database

- [ ] Migration + rollback approach noted (see
      [Database Strategy](../DATABASE-STRATEGY.md)).

## Refinement

Items are refined in backlog grooming until they meet this checklist. An item may
not be pulled into a sprint task board until it is Ready. When work completes, it
must additionally satisfy the [Definition of Done](./definition-of-done.md).
