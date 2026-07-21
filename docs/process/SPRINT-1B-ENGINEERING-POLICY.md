# Sprint 1B Engineering Policy

- **Status:** enforceable policy, effective at Sprint 1B kickoff.
- **Date:** 2026-07-20
- **Enforcement:** a mix of automated gates (CI + branch protection) and reviewer responsibility. Each rule notes how it is enforced.

## 1. Mandatory rules

| # | Rule | Enforcement |
|---|---|---|
| 1 | **Every change requires a Pull Request.** No direct pushes. | Branch protection (no direct push; PR review required) — Verified live |
| 2 | **No architecture change without a new ADR.** | PR template Impact Assessment + reviewer; ADR hook reminder |
| 3 | **Every API change updates OpenAPI.** | Reviewer checklist; Swagger doc diff in PR |
| 4 | **Every DB migration includes a rollback plan.** | PR template migration section; reviewer |
| 5 | **Every endpoint has unit tests.** | Coverage floor (CI) + reviewer |
| 6 | **Every feature includes E2E tests where applicable.** | CI `Test` job runs e2e; reviewer |
| 7 | **Every technical-debt item is registered.** | Debt registry + PR-template debt checkbox |
| 8 | **Coverage must never decrease.** | CI coverage ratchet floor (currently 50/65/60/50), raised over time — Verified |
| 9 | **No `any`, `@ts-ignore`, `TODO`, `FIXME`, `HACK`, or dead code.** | ESLint + typecheck (CI) + reviewer; madge/knip advisory |
| 10 | **No dependency updates without review.** | Dependabot PRs routed via CODEOWNERS; `--frozen-lockfile` in CI |
| 11 | **No force push.** | Branch protection `allow_force_pushes=false` — Verified live |
| 12 | **No direct commits to `develop` or `main`.** | Branch protection + required reviews + signed commits — Verified live |

## 2. Additional standing rules

- **Signed commits required** on `develop`/`main` (branch protection). Contributors must configure commit signing.
- **Linear history required** — merges are fast-forward/rebase; no merge commits.
- **Conversation resolution required** before merge.
- **Strict status checks** — branch must be up to date and pass `Lint`, `Typecheck`, `Test`, `Build` (add `Format` after PR #12).
- **Conventional Commits** enforced by commitlint.
- **Security overrides** (`pnpm.overrides`) are reviewed on every NestJS bump; a major framework upgrade requires an ADR.

## 3. Coverage ratchet schedule

| Milestone | statements | branches | functions | lines |
|---|---|---|---|---|
| Foundation (now) | 50 | 65 | 60 | 50 |
| Mid Sprint 1B | 65 | 70 | 70 | 65 |
| End Sprint 1B target | 80 | 80 | 80 | 80 |

The floor is only ever raised, never lowered, and always sits at or below measured coverage.

## 4. Definition of Done (per change)

1. PR opened, CI green (all required checks), 1 approval, conversations resolved.
2. Tests added/updated; coverage not decreased.
3. Docs/OpenAPI/ADR updated if applicable.
4. No new lint/type errors; no banned tokens.
5. Debt (if any) registered.

## 5. Verdict

This policy is **enforceable today**: rules 1, 8, 11, 12 are already enforced by live branch protection + CI; the remainder are enforced by CI checks plus the PR template and reviewer responsibility. Ready to govern Sprint 1B.
