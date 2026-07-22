# Monorepo Governance Audit

- **Date:** 2026-07-20
- **Method:** inspection of workspace + shared config files; `madge` acyclicity (this pass). No config changes made — recommendations only.

## 1. Checklist

| Aspect | Result | Status |
|---|---|---|
| Workspace consistency | `pnpm-workspace.yaml`: `apps/*`, `packages/*` — 10 projects resolve | Verified |
| Package boundaries | apps → packages only; no reverse; no app↔app | Verified (madge) |
| Dependency direction | strictly downward; 0 circular deps (102 files) | Verified |
| Package visibility | internal packages `private`/`workspace:*`; not published | Verified |
| Internal package versioning | `workspace:*` protocol throughout | Verified |
| Path alias consistency | `@mrms/*` mapped via workspace + jest `moduleNameMapper` | Verified |
| tsconfig inheritance | root + each project extend `packages/config/tsconfig/{base,nest,react}.json` | Verified |
| eslint inheritance | root `.eslintrc.cjs` baseline; per-project extend `packages/config/eslint/{base,nest,react}.cjs` | Verified |
| prettier inheritance | single root prettier config applied repo-wide | Verified |
| Shared config reuse | `packages/config` centralizes tsconfig, eslint, tailwind preset | Verified |

## 2. Shared configuration model — Verified

`packages/config` is the single source of shared tooling config:
- `tsconfig/{base,nest,react}.json` — extended by every app/package (root `tsconfig.json` extends `base.json`, `noEmit`, editor/tooling only; each project owns its build/typecheck config, checked independently via `pnpm -r typecheck`).
- `eslint/{base,nest,react}.cjs` — layered lint rules; root `.eslintrc.cjs` is the baseline (`eslint:recommended` + `prettier`, `no-console: warn`, `no-debugger: error`).
- `tailwind-preset.cjs` — shared design tokens for both SPAs.

This is a healthy, DRY configuration topology with minimal duplication.

## 3. Opportunities to reduce duplication (recommendations, non-blocking)

1. **knip config:** ship a tuned `knip.json` so workspace type-only deps and string-referenced eslint plugins stop showing as false-positive "unused" (see DEPENDENCY-GOVERNANCE).
2. **Turborepo/Nx (optional):** a task runner with caching would remove per-project script duplication and speed CI (see CI-CD-OPTIMIZATION). Defer until task graph grows in Sprint 1B.
3. **Per-app eslintrc:** confirm each app extends the shared `nest`/`react` config rather than re-declaring rules (currently consistent; keep enforcing in review).

## 4. Verdict

Monorepo governance is **strong**: consistent workspace, correct boundaries, acyclic dependencies, and centralized shared config. No structural changes needed before Sprint 1B; the listed opportunities are incremental optimizations.
