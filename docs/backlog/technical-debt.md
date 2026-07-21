# Technical Debt

> **Purpose:** Track deliberate shortcuts and known debt to be repaid, with rationale.
> **Scope:** Debt introduced during initialization and (going forward) during implementation.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [Definition of Done](../process/definition-of-done.md), [CI workflows](../../.github/workflows/ci.yml), [Backlog index](./README.md), [Sprint 1A Reports](../reports/sprint-1a/README.md)
> **References:** -

Each item: what the debt is, why it exists, and the plan to repay it.

| ID | Debt | Why it exists | Repayment plan | Priority | Status |
|----|------|---------------|----------------|:--------:|--------|
| TD-001 | Root `lint`/`typecheck`/`test`/`build` scripts are placeholders (echo + exit 0) | No application code during initialization | Replace with real workspace commands in Sprint 1 (TB-003) | H | ✅ Resolved (Sprint 1A `101f077`) |
| TD-002 | Dockerfiles are buildable skeletons (no app build stages) | App code not written yet | Enable build stages when backend/SPAs exist (Sprints 1/5/10) | H | ✅ Resolved (Sprint 1A `abb0a65`; runtime test → TD-015) |
| TD-003 | CI `install` step tolerates missing `pnpm-lock.yaml` | No dependencies/lockfile yet | Switch to `--frozen-lockfile` once deps added (Sprint 1) | H | ✅ Resolved (lockfile committed `a6403b8`) |
| TD-004 | Only smoke-level tests; no coverage thresholds | Foundation sprint | Add real suites + coverage gates as features land (Sprint 1B+) | H | Open |
| TD-005 | ESLint config is a minimal baseline | Framework rules need app context | Extend with Nest/React rule sets per app in Sprint 1 | M | ✅ Resolved (Sprint 1A: react/import presets in `@mrms/config`) |
| TD-006 | Branch protection / labels / milestones documented but not applied | Cannot auto-configure GitHub per instruction | Admin applies from `.github/BRANCH_PROTECTION.md`, `LABELS.md`, `MILESTONES.md` | M | Open |
| TD-007 | Secret scanning (gitleaks) recommended but not wired into CI | Kept init lean | Add pre-commit + CI secret scan in Sprint 1 | M | Open |
| TD-010 | Commit hooks bypassed with `--no-verify` | Husky `commit-msg`/pre-commit invoke `pnpm`, which is not on PATH in the build sandbox → false failure; all gates were run manually | Restore verified hooks once `pnpm`/corepack is on PATH in the working environment | M | Open |
| TD-011 | Bootstrap Administrator not reconciled to a real Google `googleId` | `User.googleId` is `@unique`/non-null; requires the OAuth identity flow which is out of 1A scope | Bootstrap first admin during the auth flow | M | Open (Sprint 1B) |
| TD-012 | Vite 5 / Vitest 2 carry dev-tooling advisories (esbuild, vite, vitest incl. 1 critical) | Foundation pinned to Vite 5 / Vitest 2 | Upgrade Vite → 6 and Vitest → 3 | M | Open |
| TD-013 | NestJS 10 toolchain carries transitive advisories (multer, lodash, js-yaml, @nestjs/core, express chain) | Foundation pinned to NestJS 10 | Upgrade NestJS 10 → 11 (coordinated) | M | Open |
| TD-014 | No dependency-audit / bundle-size gates in CI | Kept foundation CI lean | Add `pnpm audit` (advisory) + bundle-size checks to CI | M | Open |
| TD-015 | Docker Compose stack not runtime-validated | No Docker daemon in the build sandbox | Run the compose smoke test on a Docker-capable host / CI runner (see [report](../reports/sprint-1a/docker-compose-validation.md)) | H | Open |
| TD-016 | UI screenshots not generated | Playwright browser not fully provisioned + shell became unresponsive in sandbox | Regenerate via committed `tools/screenshots/capture.mjs` on a Playwright-capable host | L | Open |
| TD-017 | Enterprise HTTP hardening not fully installed (helmet, `@nestjs/throttler`, compression, body-size limit, log redaction) | Avoided changing the runtime dependency graph during the pre-Sprint-1B certification freeze; baseline no-dep headers applied instead | Install + wire at Sprint 1B start (exact snippets in [security-hardening](../reports/pre-sprint-1b/security-hardening.md)) | M | Open |
| TD-018 | Frontend/shared-package coverage not measured/enforced | `@vitest/coverage-v8` not yet a dev dependency in SPAs/packages | Add coverage provider + `test:cov` scripts + thresholds; raise ratchet per sprint | M | Open |
| TD-019 | Backend DI silently breakable by lint autofix (RESOLVED) | `consistent-type-imports` (inline) rewrote injected imports to type-only, breaking NestJS DI; caused red CI | Disabled the rule for the backend preset (ADR-010); injected classes must be value imports | H | ✅ Resolved (cert branch) |

## Policy

- New debt must be recorded here in the same PR that introduces it, with a
  repayment plan (per the Definition of Done).
- High-priority debt that affects safety (tests, secrets) is repaid before the
  dependent feature is considered production-ready.
