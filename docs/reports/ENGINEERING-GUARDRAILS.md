# Engineering Guardrails Report

> **Purpose:** Document the automated guardrails that continuously protect quality during Sprint 1B and beyond.
> **Scope:** CI/CD gates, repository-health automation, engineering metrics, PR standards, ownership, scalability.
> **Version:** 1.0
> **Author:** MRMS Engineering - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related:** [Sprint 1B Engineering Rules](../process/SPRINT-1B-ENGINEERING-RULES.md), [Sprint Kickoff Checklist](../process/SPRINT-KICKOFF-CHECKLIST.md)

---

## 1. CI/CD quality gates (Phase 1)

Every PR into `main`/`develop` runs the CI workflow. Gates now present:

| Gate | Job / step | Blocking |
|------|-----------|:--------:|
| Formatting | `Format` job (`prettier --check`) — **added** | ✅ |
| Lint | `Lint` job (ESLint, 0/0) | ✅ |
| Typecheck | `Typecheck` job (`tsc --noEmit`, 9/9) | ✅ |
| Prisma schema validation | `Validate Prisma schema` step — **added** | ✅ |
| Unit tests | `Test` job (`pnpm -r test`) | ✅ |
| Integration/e2e | `Backend e2e` step (supertest) | ✅ |
| Coverage ratchet | `Backend coverage` step (`test:cov` threshold) + lcov artifact | ✅ |
| Build | `Build` job (all packages + SPAs) | ✅ |
| CodeQL | `codeql.yml` (security-and-quality) — **added** | ✅ |
| Dependency review | `dependency-review.yml` (fail high; deny GPL/AGPL/SSPL) — **added** | ✅ (PRs) |
| Docker build | `docker.yml` (image build validation) | ✅ |

Branch protection requires these checks + 1 review + linear history + signed
commits (enforced on `main` and `develop`). No feature code merges if any
required gate fails.

## 2. Automated repository health (Phase 2)

Added an **advisory** `Repo Health` CI job (`continue-on-error`, non-blocking
until thresholds are agreed):
- **Circular dependency detection** — `madge --circular` over `apps`/`packages`.
- **Unused dependency / export / dead-file detection** — `knip`.

Recommended follow-ups (promote to blocking once tuned):
- Bundle-size regression budget (e.g., `size-limit` per SPA entry, compared to the recorded baselines).
- Dependency drift / freshness report (Dependabot — **added**, weekly, grouped minor/patch).
- Duplicate-package detection (`pnpm dedupe --check`).

## 3. Engineering metrics (Phase 3)

Metrics to monitor over time (captured via CI artifacts/logs; dashboard optional):
- Build duration, lint/typecheck/test execution time (from CI job timings).
- Bundle-size history (Vite build output; compare per PR).
- Coverage trend (lcov artifact per run; ratchet floor in `jest.config.cjs`).
- Dependency count + advisory count (`pnpm audit`), technical-debt count (register), lint-warning trend.

Implementation note: these are low-cost to collect from existing CI output; a
lightweight metrics job writing a JSON artifact per run is the recommended next
step (no new runtime dependencies).

## 4. Pull Request standards (Phase 4)

`PULL_REQUEST_TEMPLATE.md` now requires an explicit **Impact Assessment**:
architecture, database, API, security, performance, testing evidence,
documentation, rollback strategy, and technical-debt registration.

## 5. CODEOWNERS (Phase 5)

Added `.github/CODEOWNERS` mapping backend, frontend, shared packages,
infrastructure, CI/CD, database, and docs to `@satpan-mp`. As the team grows,
split ownership into squads (backend/frontend/platform) and require code-owner
review in branch protection.

## 6. Repository scalability (Phase 6)

The pnpm monorepo scales cleanly to more developers, apps, services, and shared
SDKs:
- **More apps/services:** add under `apps/*`; shared code via `packages/*` (acyclic graph).
- **More frontends / mobile / PWA:** consume `@mrms/ui`, `@mrms/api-client`, `@mrms/types`.
- **Shared SDKs:** publishable from `packages/*` (currently `workspace:*`).
- **Worker services:** `worker.ts` seam already exists; promote to its own app when independent scaling is needed.

Low-risk improvements that reduce future maintenance cost:
- Add `size-limit` bundle budgets before the UI grows.
- Add `@vitest/coverage-v8` to SPAs/packages (TD-018) so coverage is enforced everywhere.
- Move throttler to Redis storage before multi-instance deploy (TD-021).
- Consider TypeScript project references / Turborepo-style task caching if build times grow.

## 7. Long-term engineering recommendations (Phase 8)

Meaningful, non-cosmetic:
1. **Raise coverage via the ratchet** as features land; enforce per-package thresholds (maintainability + reliability).
2. **Batch the NestJS 11 / Vite 6 upgrades** (TD-012/013) in a dedicated maintenance PR to clear transitive advisories (security).
3. **Runtime-validate the Docker stack in CI** (service containers) to close TD-015 (operational excellence).
4. **Promote the advisory repo-health checks to blocking** once thresholds are agreed (maintainability).
5. **Add request metrics + OpenTelemetry** when the first feature endpoints ship (observability/DX).

## 8. Deliverables summary

- Engineering Guardrails Report — this document
- CI/CD improvements — `ci.yml` (Format + Prisma validate + Repo Health), `codeql.yml`, `dependency-review.yml`, `dependabot.yml`
- Repository-health automation — advisory `Repo Health` job + recommendations
- Sprint Kickoff Checklist — `docs/process/SPRINT-KICKOFF-CHECKLIST.md`
- PR standards — enhanced `PULL_REQUEST_TEMPLATE.md`
- CODEOWNERS — `.github/CODEOWNERS`

---

*End of Engineering Guardrails Report.*
