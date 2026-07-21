# Request For Change (RFC)

> **Purpose:** Process and index for proposing significant architectural or product changes.
> **Scope:** Any change large enough to need review before implementation.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [ADR index](../adr/README.md), [Decision Log](../decisions/README.md), [Git Convention](../standards/git-convention.md)
> **References:** IETF RFC process (inspiration)

An **RFC** proposes a change and gathers review/approval **before** work starts.
Use an RFC when a change is likely to affect architecture, security, data model,
external integrations, or product behavior. Small, local changes do not need one.

## When to write an RFC

- New bounded context/module or a cross-cutting change.
- Changing an accepted ADR, or anything touching Google integration semantics.
- Security-relevant changes (auth, RBAC, secrets, data exposure).
- Database schema changes with migration/rollback impact.
- Anything a reviewer would reasonably want to weigh in on before coding.

## Lifecycle

`Draft` -> `In Review` -> `Approved` / `Rejected` -> `Implemented` (or `Withdrawn`).

An approved RFC that establishes an architectural decision should be recorded as
an [ADR](../adr/README.md); runtime/product rule changes should be added to the
[Decision Log](../decisions/README.md).

## Index

| RFC | Title | Status | Date |
|-----|-------|--------|------|
| _(none yet)_ | Use [`rfc-template.md`](./rfc-template.md) for the first RFC | - | - |

## How to submit

1. Copy [`rfc-template.md`](./rfc-template.md) to `RFC-NNN-short-title.md`.
2. Fill all sections; open a PR labeled `documentation` targeting `develop`.
3. Collect review; update **Approval Status**.
4. On approval, link the resulting ADR/Decision-Log entries and implement per the
   plan (tracked as issues/milestones).
