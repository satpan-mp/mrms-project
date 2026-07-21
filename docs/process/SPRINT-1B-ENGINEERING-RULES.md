# Sprint 1B Engineering Rules (Mandatory)

> **Purpose:** Permanent engineering rules that govern all work from Sprint 1B onward.
> **Scope:** Every contributor and every change to the MRMS repository.
> **Version:** 1.0
> **Author:** MRMS Engineering - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Status:** Enforced (branch protection on `main` + `develop`)
> **Related:** [Definition of Done](./definition-of-done.md), [Technical Debt](../backlog/technical-debt.md), [ADR index](../adr/README.md)

These rules are enforced by branch protection on `main` and `develop` (required
PR reviews, required status checks, linear history, conversation resolution,
signed commits, blocked force-push/direct-push).

---

## 1. Development workflow

- **Every change goes through a Pull Request.** No direct commits to `develop` or `main`.
- **CI must be green** (lint, typecheck, tests, coverage gate, build) before merge.
- **At least one approving review** is required; stale reviews are dismissed on new pushes.
- **Signed commits are required.** Configure git commit signing (GPG or SSH) before contributing:
  - `git config commit.gpgsign true` and register your signing key on GitHub.
  - Unsigned commits cannot be merged into protected branches.
- **Linear history** is enforced — use squash or rebase merges (no merge commits).
- **Conversation resolution** is required — resolve all PR threads before merge.
- Branch naming: `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`.
- **Conventional Commits** are mandatory (enforced by commitlint).

## 2. Architecture

- The approved architecture (PRD, Docs 04/15/16/17, ADRs) is authoritative.
- **Core architecture changes require a new ADR** (`docs/adr/ADR-NNN-*.md`) + index update.
- **Cross-layer dependencies are prohibited** (respect Clean Architecture: presentation → application → domain ← infrastructure; dependencies point inward).
- **Injected classes must be value imports** — never `import type` for a constructor-injected provider (breaks NestJS DI metadata; see ADR-010).
- **Shared packages stay framework-agnostic** where possible (`@mrms/types`, `@mrms/config`); UI concerns live in `@mrms/ui`.
- No circular dependencies between packages.

## 3. Testing

- **Every new endpoint requires unit tests.**
- **Business logic requires integration tests** where appropriate.
- **New shared packages require test coverage** (add `@vitest/coverage-v8` where missing — TD-018).
- **Coverage must never drop below the established ratchet floor** (backend jest `coverageThreshold`); raise the floor as coverage improves.
- Backend uses Jest (+ supertest for e2e); frontend/packages use Vitest.

## 4. Database

- Every Prisma migration must include, in the PR description:
  - **Rollback strategy**
  - **Migration notes** (what/why)
  - **Backward-compatibility assessment**
- Migrations are forward-only; destructive changes require an ADR + explicit rollback plan.
- Timestamps stored in UTC; display uses per-site timezone.
- No changes to the approved data model without a new ADR.

## 5. API

- Every API change must update:
  - **OpenAPI** spec (`docs/09-API-Specification.md`) and **Swagger** decorators
  - **DTO documentation**
  - **Response examples**
  - **Error responses** (must use the standard error envelope)
- Preserve backward compatibility within `/api/v1`; breaking changes require a new version.
- Pagination/filtering/sorting/idempotency follow [API Strategy](../API-STRATEGY.md).

## 6. Technical debt

Every newly discovered technical debt must be added to the
[register](../backlog/technical-debt.md) with:
- a **unique TD ID**
- **priority** (Critical/High/Medium/Low)
- **owner**
- **mitigation plan**
- **target milestone**

## 7. Security (every feature)

Review for: **Authentication, Authorization, Input validation, Rate limiting,
Logging (no secrets — pino redaction is configured), Secrets handling, OWASP
Top 10.** New network-exposed endpoints must declare their authn/authz posture
in the PR. Rate limiting is global (`@nestjs/throttler`); tighten per-route with
`@Throttle` for auth/booking endpoints.

## 8. Performance (every feature)

Consider: **database query efficiency (indexes, N+1), bundle size (code-split
new routes), caching opportunities (Redis), memory usage, startup performance,
scalability.** Compare against the recorded baselines; do not regress bundle or
latency budgets without justification.

## 9. Dependencies

- **Versions are frozen** for Sprint 1B (pinned via `pnpm-lock.yaml`, `--frozen-lockfile` in CI).
- Avoid unnecessary upgrades during Sprint 1B; batch dependency upgrades (e.g., NestJS 11 / Vite 6 — TD-012/013) into a dedicated maintenance PR with its own review.
- New dependencies require: license check (permissive only — no GPL/AGPL/SSPL), a security-advisory check, and justification in the PR.

## 10. Documentation

- Docs-first: update the relevant document(s) in the same PR as the behavior change.
- Keep README, CHANGELOG, ADR index, and the technical-debt register current.

---

*These rules are mandatory. Non-compliant PRs will fail protection checks or review.*
