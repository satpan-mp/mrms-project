# Workspace Structure Report — Sprint 1A

> **Purpose:** Document the monorepo layout established in Sprint 1A and validate it against the approved folder structure.
> **Scope:** pnpm workspace (apps + packages + tooling).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [Folder Structure (Doc 17)](../../17-Folder-Structure.md), [Software Architecture (Doc 04)](../../04-Software-Architecture.md)

---

## 1. Top-level layout

```
mrms-project/
├─ apps/
│  ├─ admin/        # Admin SPA (React + Vite + TS)
│  ├─ display/      # Display/kiosk SPA (React + Vite + TS)
│  └─ backend/      # NestJS API + worker bootstrap (worker.ts) + Prisma
├─ packages/
│  ├─ config/       # Shared ESLint / TS / Tailwind presets + design tokens
│  ├─ types/        # Shared domain & API types
│  ├─ ui/           # Design system: ThemeProvider, tokens, primitives
│  ├─ api-client/   # Typed HTTP client (health/version/ping)
│  ├─ realtime/     # Typed Socket.IO event contract
│  └─ hooks/        # Shared React hooks
├─ docker/          # Dockerfiles, compose, nginx config
├─ infrastructure/  # Infra-as-config assets
├─ scripts/         # Repo scripts
├─ tools/           # Dev tooling (e.g., screenshots/capture.mjs)
├─ docs/            # Documentation (design set, ADRs, reports, backlog)
├─ .github/         # CI, templates, governance
├─ .husky/          # Git hooks
├─ pnpm-workspace.yaml, package.json, tsconfig.json, tsconfig.base equivalent
└─ .npmrc, .editorconfig, .prettierrc, .eslintrc.cjs, commitlint.config.cjs, ...
```

## 2. Workspaces

- **Package manager:** pnpm workspaces (`pnpm-workspace.yaml` globs `apps/*`, `packages/*`).
- **Apps (3):** `@mrms/admin`, `@mrms/display`, `@mrms/backend`.
- **Packages (6):** `@mrms/config`, `@mrms/types`, `@mrms/ui`, `@mrms/api-client`, `@mrms/realtime`, `@mrms/hooks`.
- **Total typecheck targets:** 9 (matches `pnpm -r typecheck` = 9/9).

> The BullMQ worker is a bootstrap entry (`apps/backend/src/worker.ts`) rather
> than a separate app, sharing the backend's modules and Prisma client. It can
> be promoted to its own app if independent deploy cadence is later required.

## 3. Dependency direction

```
apps/admin  ─┐
apps/display ┼─▶ @mrms/ui ─▶ @mrms/config (tokens/presets)
             ├─▶ @mrms/api-client ─▶ @mrms/types
             ├─▶ @mrms/realtime  ─▶ @mrms/types
             └─▶ @mrms/hooks
apps/backend ─▶ @mrms/types (+ @mrms/realtime contract), Prisma
```

- Apps depend on packages; packages do **not** depend on apps (acyclic).
- Shared types flow one direction, preserving clean boundaries (NFR-MAINT-1/3).

## 4. Shared tooling

| Concern | Source of truth |
|---------|-----------------|
| TypeScript base config | root `tsconfig` + per-package extends |
| ESLint | `@mrms/config` presets (resolved via `require.resolve`) |
| Tailwind + design tokens | `@mrms/config` preset consumed by SPAs and `@mrms/ui` |
| Commit format | `commitlint.config.cjs` + Husky `commit-msg` |
| Pre-commit | Husky + `lint-staged` (`.lintstagedrc.json`) |
| Node version | `.nvmrc` |

## 5. Validation against Document 17 (Folder Structure)

| Expectation (Doc 17) | Status | Notes |
|----------------------|:------:|-------|
| Monorepo with apps + shared packages | ✅ | pnpm workspace as above. |
| Frontend/backend separation | ✅ | Distinct apps. |
| Shared UI/design-system package | ✅ | `@mrms/ui` + tokens in `@mrms/config`. |
| Shared types package | ✅ | `@mrms/types`. |
| Backend + worker | ✅ | `apps/backend` + `worker.ts` bootstrap. |
| Docker/infra directories | ✅ | `docker/`, `infrastructure/`. |
| Docs-first structure | ✅ | `docs/` design set + ADRs + reports + backlog. |

**Verdict:** The materialized structure conforms to the approved folder
structure. Package granularity (config/types/ui/api-client/realtime/hooks) is
consistent with the approved Option A decomposition.

---

*End of Workspace Structure Report.*
