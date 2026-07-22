# Engineering Standards Audit

- **Date:** 2026-07-20
- **Method:** inspection of code, configs, and conventions across the workspace.

## 1. Standards matrix

| Standard | Status | Evidence |
|---|---|---|
| Naming conventions | ✅ | PascalCase classes, camelCase vars, kebab-case files, `@mrms/*` scoped packages |
| Commit conventions | ✅ | Conventional Commits enforced by commitlint + husky |
| Folder naming | ✅ | `apps/*`, `packages/*`, feature/shared module folders |
| File naming | ✅ | `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.spec.ts`, `*.e2e-spec.ts` |
| TypeScript standards | ✅ | strict configs via `packages/config/tsconfig`; typecheck 9/9; no `any`/`@ts-ignore` in source |
| React standards | ✅ | function components, hooks, shared `packages/ui`; Vite + RTL setup |
| NestJS standards | ✅ | module composition, DI, global pipes/filters, Terminus health, `@nestjs/config` + Zod validation |
| Prisma standards | ✅ | schema validated (`prisma validate` in CI); env-gated query logging; seed script present |
| Testing standards | ⚠ | Jest (backend, v8 coverage) + Vitest/RTL (frontend); coverage ratchet 50/65/60/50; broaden to services/indicators in 1B |

## 2. Notable good practices

- **ADR-010** deliberately disables `@typescript-eslint/consistent-type-imports` on the backend to prevent a NestJS DI regression (type-only imports stripping decorator metadata) — a documented, reasoned standard.
- **v8 coverage provider** chosen over babel to preserve `emitDecoratorMetadata` under coverage (documented in `jest.config.cjs`).
- **Global error envelope** (`AllExceptionsFilter`) enforces a consistent API error contract.
- **Fail-fast env validation** (Zod) standardizes configuration handling.

## 3. Gaps / recommendations (non-blocking)

1. **Testing breadth:** unit coverage concentrated in config/filter; extend to services and health indicators as they gain logic in 1B (ratchet enforces upward progress).
2. **Lint strictness:** promote `no-console` from warn to error in production code paths once logging is uniformly via Pino (currently only `tools/screenshots` uses console with an eslint-disable).
3. **Enforce shared configs in review:** ensure new packages extend `packages/config` rather than declaring standalone rules.

## 4. Verdict

The repository follows **modern enterprise standards** consistently across naming, commits, TS/React/NestJS/Prisma, and tooling. Testing breadth is the one axis to grow, governed by the coverage ratchet. **Not blocking** Sprint 1B.
