# Definition of Done (DoD)

> **Purpose:** Define the completion requirements every task must meet before it is "done".
> **Scope:** All development tasks (features, fixes, refactors, infrastructure).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Definition of Ready](./definition-of-ready.md), [Coding Standards](../standards/coding-standards.md), [Git Convention](../standards/git-convention.md), [Testing Strategy](../TESTING-STRATEGY.md), [Release Management](./release-management.md)
> **References:** Project "Development Workflow & Reporting Policy"

A task is **Done** only when ALL applicable criteria are satisfied. This mirrors
the project's mandatory quality bar and the PR template checklist.

## Mandatory Checklist

- [ ] **Acceptance criteria met** (all criteria from the item satisfied).
- [ ] **Documentation updated** (docs-first: any architecture/behavior change is
      reflected in `docs/` before the task is closed).
- [ ] **Build successful** (`pnpm run build`).
- [ ] **Lint passed** (`pnpm run lint`).
- [ ] **Type checking passed** (`pnpm run typecheck`).
- [ ] **Tests passed** (unit/integration/e2e as applicable; new code covered).
- [ ] **Code reviewed** and approved via PR.
- [ ] **Git committed** using Conventional Commits.
- [ ] **Git pushed** to the remote.
- [ ] **No TODOs** left without a tracked issue reference.
- [ ] **No debug code / debug logs** (use the structured logger).
- [ ] **No commented-out code**.
- [ ] **No hardcoded secrets** or credentials.
- [ ] **No duplicated code**; reusable pieces extracted appropriately.
- [ ] **No unused files** or dead code introduced.

## Quality Gates (from the Workflow Policy)

- [ ] Clean Architecture maintained; SOLID respected.
- [ ] Naming conventions and folder structure followed.
- [ ] Proper input validation implemented.
- [ ] Error handling implemented per the
      [error-handling convention](../standards/error-handling-convention.md).
- [ ] Logging implemented per the
      [logging convention](../standards/logging-convention.md).
- [ ] Security best practices applied.
- [ ] Performance considered; no obvious regressions.
- [ ] Readability maintained.

## Additional for specific work

- **Database change:** migration created + rollback considered + seed updated if
  needed (see [Database Strategy](../DATABASE-STRATEGY.md)).
- **API change:** OpenAPI/AsyncAPI updated; error codes documented; backward
  compatibility assessed (see [API Strategy](../API-STRATEGY.md)).
- **New technical debt:** recorded in
  [technical-debt.md](../backlog/technical-debt.md) with a repayment plan.
- **New risk:** added to the [Risk Register](../RISK-REGISTER.md).

## Task closeout (per project policy)

- [ ] Development Progress Report generated.
- [ ] Milestone changes pushed; sprint ends with a tagged release where applicable
      (see [Release Management](./release-management.md) and
      [MILESTONES](../MILESTONES.md)).
