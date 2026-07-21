# CI/CD Optimization

- **Date:** 2026-07-20
- **Method:** inspection of `.github/workflows/*` + observed live run behavior. Recommendations only — no behavior changed unless objectively safe and beneficial (none applied this pass to avoid unreviewed workflow edits).

## 1. Current workflows

| Workflow | Jobs | Triggers |
|---|---|---|
| CI (`ci.yml`) | Lint, Typecheck, Test, Build (+ Format & repo-health on PR #12) | push/PR to main/develop |
| CodeQL | analyze | schedule/PR (PR #12) |
| Dependency Review | review | PR (PR #12) |
| Docker | build | push/PR |

Concurrency: `ci-${{ github.ref }}` with `cancel-in-progress: true` (good — cancels superseded runs).

## 2. Optimization assessment

| Lever | Current | Recommendation | Priority |
|---|---|---|---|
| pnpm cache | `actions/setup-node@v4` with `cache: pnpm` | ✅ already enabled | — |
| Redundant installs | each job runs `pnpm install --frozen-lockfile` (4–6×) | Acceptable for now; a reusable "setup" composite action would DRY this | Low |
| Turbo/Nx remote cache | none | Adopt Turborepo when the task graph grows (1B); enables cross-job/build caching | Medium (1B) |
| Artifact retention | coverage lcov uploaded `if: always()` | Set explicit `retention-days: 7` to cap storage | Low |
| Matrix strategy | single Node (20.11.0) | Add Node 22 to matrix only if multi-version support is required | Low |
| Parallel execution | Lint/Typecheck/Test run in parallel; Build `needs` them | ✅ already parallel | — |
| Workflow permissions | not pinned per-workflow | Add least-privilege `permissions:` blocks (e.g., `contents: read`) | **Medium (security)** |
| Reusable workflows | none | Extract shared setup into `workflow_call` reusable | Low |
| Workflow duplication | install/setup repeated across jobs | Composite action reduces ~20 duplicated lines | Low |
| Node runtime | Node 20 (runners warn: forced to Node 24; actions target Node 20 deprecated) | Bump `NODE_VERSION`/action majors when convenient | **Medium** |

## 3. Safe, objectively-beneficial changes to make (in a dedicated PR)

1. **Least-privilege `permissions:`** on every workflow (security hardening, no behavior change).
2. **`retention-days` on artifacts** (cost control).
3. **Pin action major versions** and plan the Node 20→22 move ahead of GitHub's Node 20 deprecation.

These were **not** applied this pass to avoid unreviewed workflow edits mixing into the certification PR; they are queued as a small follow-up.

## 4. Verdict

CI is well-structured (parallel jobs, pnpm cache, concurrency cancellation). Optimizations are incremental (permissions hardening, retention, Node bump, optional Turbo cache). **Not blocking** Sprint 1B.
