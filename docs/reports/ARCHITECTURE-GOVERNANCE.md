# Architecture Governance

- **Date:** 2026-07-20
- **Method:** static tooling (`madge`, `knip`) run this pass + structural inspection. No architecture redesign performed.

## 1. Checklist

| Aspect | Result | Status |
|---|---|---|
| PRD alignment | Foundation matches documented scope (rooms/booking platform, Google Workspace integration deferred to later sprints) | Verified (docs) |
| ADR alignment | ADR-001..010 present; ADR-009 (tooling), ADR-010 (disable `consistent-type-imports` on backend) reflected in code | Verified |
| API alignment | Health/system endpoints match `@nestjs/swagger` surface; no drift | Verified |
| Database alignment | Prisma schema validates (`prisma validate` in CI Typecheck job) | Verified |
| Folder structure | Clean monorepo layout (apps/packages) | Verified |
| Module boundaries | NestJS modules isolated; SPAs consume shared packages via `workspace:*` | Verified |
| Dependency direction | apps → packages (no reverse); no package → app imports | Verified |
| Shared package ownership | `packages/*` owned via CODEOWNERS (PR #12) | Partially Verified |
| Circular dependency detection | **madge: none** across 102 files | Verified |
| Dead modules | knip: 5 files flagged, all intentional (worker entrypoints, tooling, e2e) | Verified |
| Unused exports | knip: 2 unused exported types (reserved) | Verified |

## 2. Circular dependencies — Verified

```
npx madge@8 --circular --extensions ts,tsx apps packages
Processed 102 files (2.1s)
✔ No circular dependency found!   (exit 0)
```

## 3. Dead modules / unused exports — Verified (advisory)

`npx knip@5` flagged 5 "unused files", each explained and intentional:

| File | Explanation |
|---|---|
| `apps/backend/src/worker.ts`, `worker.module.ts` | BullMQ worker entrypoint scaffolded for Sprint 1B jobs; intentionally present, not yet wired to a runtime process |
| `apps/backend/test/health.e2e-spec.ts` | e2e suite; runs via `jest-e2e.json`, outside knip's default entry set |
| `tools/screenshots/capture.mjs` | Playwright screenshot tooling (TD-016) |
| `.eslintrc.cjs` | root lint config, consumed by eslint |

Unused exported types: `KioskConfig` (`apps/display`), `SpinnerProps` (`packages/ui`) — public API reserved for Sprint 1B consumers.

## 4. Layering & boundaries

- **Backend** follows NestJS module composition: `AppModule` → feature (`health`) + shared (`config`, `logger`, `prisma`, `redis`, `filters`) modules. No feature module imports another feature module.
- **Shared packages** are leaf/utility layers: `types` (zero deps) ← `api-client`, `realtime`, `hooks`, `ui` ← `apps`. Dependency direction is strictly downward (confirmed by madge acyclicity).
- **No app-to-app imports**; SPAs share only through `packages/*`.

## 5. Constraints honored

- No new modules, no boundary changes, no framework swaps this pass. The only code additions are unit tests (`*.spec.ts`) and configuration (jest threshold, pnpm overrides) — none alter architecture.

## 6. Sprint 1B guardrails (architecture)

1. New bounded contexts (rooms, bookings, auth) get their own NestJS modules; cross-module access via explicit providers only.
2. Any deviation from documented architecture requires a **new ADR** (enforced by policy + PR template).
3. `madge --circular` and `knip` remain in CI as advisory `repo-health` (PR #12); promote to blocking once a tuned `knip.json` lands.

## 7. Verdict

Architecture is **clean and enforceable**: zero circular dependencies, correct layering, ADR-backed decisions, no dead runtime modules. Advisory knip noise is understood. Non-blocking for Sprint 1B.
