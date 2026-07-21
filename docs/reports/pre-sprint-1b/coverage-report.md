# Code Coverage Report — Pre-Sprint 1B

> **Purpose:** Record measured test coverage and the enforcement/ratchet plan.
> **Scope:** Backend (Jest) + frontend/packages (Vitest).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Tools:** Jest (V8 provider) for backend; Vitest for SPAs/packages.

---

## 1. Headline

While measuring coverage, a **production-blocking defect was discovered and fixed**: the
backend unit and e2e suites were **failing** (NestJS DI could not resolve
constructor dependencies), so CI was effectively **red**. See
[the certification](../../certification/PRE-SPRINT-1B-CERTIFICATION.md) §"Critical fixes".
After the fix, all suites pass and coverage is measurable.

## 2. Measured coverage (after fixes)

### Backend (Jest, V8, unit specs)

| Metric | Coverage | Target | Status |
|--------|:--------:|:------:|:------:|
| Statements | 12.38% (42/339) | ≥ 80% | ❌ below target |
| Branches | 25.0% (3/12) | ≥ 80% | ❌ |
| Functions | 27.27% (3/11) | ≥ 80% | ❌ |
| Lines | 12.38% (42/339) | ≥ 80% | ❌ |

> The e2e suite additionally exercises `HealthController`, both indicators, the
> Terminus aggregation, routing, and the validation pipeline at the HTTP level;
> those paths are covered functionally even though they are not counted in the
> unit-coverage instrumentation above.

### Frontend / shared packages (Vitest)

Tests pass (api-client 3, ui 2, admin 2, display 1). A coverage **number** was
not collected in this pass because `@vitest/coverage-v8` is not yet a dev
dependency in those workspaces. Adding it is a one-line dependency + config
change scheduled below.

## 3. Honest assessment

The absolute coverage is low because Sprint 1A is a **foundation** with very
little branching logic — most code is module wiring, DTO/config declarations,
and framework glue. Enforcing the 80/70/85 targets **today** is premature and
would not reflect meaningful risk. The correct approach is a **ratchet**: set a
no-regression floor now and raise it as real feature logic (and its tests) lands
in Sprint 1B onward.

## 4. Enforcement implemented

- **`coverageProvider: 'v8'`** set in `apps/backend/jest.config.cjs` (the default
  `babel` provider stripped decorator metadata and broke DI under coverage).
- **`coverageThreshold`** floor added (statements 12 / branches 20 / functions 25
  / lines 12) — CI fails if backend coverage regresses below today's baseline.
- **CI step** `pnpm --filter @mrms/backend run test:cov` added to the test job,
  plus lcov artifact upload.

## 5. Ratchet plan (targets)

| Scope | Current | Sprint 1B | Sprint 1C | Target |
|-------|:-------:|:---------:|:---------:|:------:|
| Backend | ~12% | ≥ 40% | ≥ 60% | ≥ 80% |
| Frontend | (add tooling) | ≥ 40% | ≥ 55% | ≥ 70% |
| Shared packages | (add tooling) | ≥ 60% | ≥ 75% | ≥ 85% |

Actions:
- Add `@vitest/coverage-v8` + `test:cov` scripts to SPAs and shared packages.
- Raise `coverageThreshold` each sprint in lockstep with new feature tests.
- Generate HTML + LCOV reports in CI and publish as artifacts (backend lcov already uploaded).

## 6. Verdict

**Coverage tooling: FIXED and enforced (ratchet floor).** Absolute targets
(80/70/85) are **not yet met** and are scheduled to be reached as features are
implemented. This is the primary "minor revision" gating item.

---

*End of Coverage Report.*
