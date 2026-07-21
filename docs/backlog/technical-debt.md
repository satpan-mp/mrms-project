# Technical Debt

> **Purpose:** Track deliberate shortcuts and known debt to be repaid, with rationale.
> **Scope:** Debt introduced during initialization and (going forward) during implementation.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Definition of Done](../process/definition-of-done.md), [CI workflows](../../.github/workflows/ci.yml), [Backlog index](./README.md)
> **References:** -

Each item: what the debt is, why it exists, and the plan to repay it.

| ID | Debt | Why it exists | Repayment plan | Priority | Status |
|----|------|---------------|----------------|:--------:|--------|
| TD-001 | Root `lint`/`typecheck`/`test`/`build` scripts are placeholders (echo + exit 0) | No application code during initialization | Replace with real workspace commands in Sprint 1 (TB-003) | H | Open |
| TD-002 | Dockerfiles are buildable skeletons (no app build stages) | App code not written yet | Enable build stages when backend/SPAs exist (Sprints 1/5/10) | H | Open |
| TD-003 | CI `install` step tolerates missing `pnpm-lock.yaml` | No dependencies/lockfile yet | Switch to `--frozen-lockfile` once deps added (Sprint 1) | H | Open |
| TD-004 | No automated tests yet | Pre-implementation | Establish test harness + coverage gates (TB-015, Sprint 1-2) | H | Open |
| TD-005 | ESLint config is a minimal baseline | Framework rules need app context | Extend with Nest/React rule sets per app in Sprint 1 | M | Open |
| TD-006 | Branch protection / labels / milestones documented but not applied | Cannot auto-configure GitHub per instruction | Admin applies from `.github/BRANCH_PROTECTION.md`, `LABELS.md`, `MILESTONES.md` | M | Open |
| TD-007 | Secret scanning (gitleaks) recommended but not wired into CI | Kept init lean | Add pre-commit + CI secret scan in Sprint 1 | M | Open |

## Policy

- New debt must be recorded here in the same PR that introduces it, with a
  repayment plan (per the Definition of Done).
- High-priority debt that affects safety (tests, secrets) is repaid before the
  dependent feature is considered production-ready.
