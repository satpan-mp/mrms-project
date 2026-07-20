# Coding Standards

Applies to all TypeScript across backend (NestJS) and frontend (React/Vite).

## 1. Language & Tooling

- **TypeScript strict mode** everywhere (`strict: true`, `noUncheckedIndexedAccess`,
  `noImplicitOverride`). No implicit `any`.
- **ESLint** (baseline in root `.eslintrc.cjs`, extended per app) + **Prettier**
  (`.prettierrc`) are the source of truth for style. Do not hand-format against them.
- Node `>=20.11`, package manager **pnpm** (`packageManager` pinned in root
  `package.json`).
- Every commit must pass: **lint, typecheck, build, tests** (see workflow policy).

## 2. General Rules

- Prefer **pure functions** and immutability; avoid shared mutable state.
- Keep functions small and single-purpose (SRP). Extract when a function does
  more than one thing.
- No **magic numbers/strings** - use named constants or config/`Setting`.
- No **commented-out code**, `console.log` debug output, or `TODO` without an
  issue reference in committed code.
- Prefer `async/await` over raw promises; always handle rejections.
- Use `const` by default; `let` only when reassignment is required; never `var`.
- Explicit return types on exported functions and public methods.
- Avoid deep nesting; use early returns / guard clauses.

## 3. Clean Architecture Rules

- **Domain layer** has zero framework imports (no NestJS, Prisma, Express, React).
- **Application layer** depends only on domain + ports (interfaces).
- **Infrastructure** implements ports; it is the only layer that imports Prisma,
  Google client, Redis, etc.
- Dependencies are injected via interfaces/DI tokens - never `new` a concrete
  infrastructure class inside a use case.

## 4. Backend (NestJS)

- One responsibility per provider/service; use cases orchestrate, domain services
  hold business rules.
- Validate all input with DTOs + `class-validator`; never trust request bodies.
- Controllers stay thin: parse/validate -> call use case -> map response.
- Use the global exception filter for errors (see error-handling convention).
- No business logic in controllers, gateways, or repositories.

## 5. Frontend (React)

- Function components + hooks only. No class components.
- Presentational components are pure; data/side-effects live in hooks
  (React Query) and providers.
- No direct `fetch` in components - use the typed `api-client` via hooks.
- Derive UI from server-authoritative state; do not re-implement status logic
  client-side.
- Clean up subscriptions/timers in `useEffect` return callbacks (kiosk runs 24/7).

## 6. Comments & Documentation

- Code should be self-explanatory; comment the **why**, not the **what**.
- Public/exported APIs get concise JSDoc/TSDoc.
- Update relevant `docs/` when behavior or architecture changes (docs-first).

## 7. Testing

- Unit tests for domain services and use cases (ports mocked).
- Integration tests for repositories and jobs.
- Contract tests for REST/WS.
- Tests live beside code (`*.spec.ts`) or in `test/` for integration/e2e.
- New features and bug fixes ship with tests.

## 8. Performance & Security

- Consider realtime and kiosk longevity (no memory leaks, bounded caches).
- Parameterized DB access (Prisma); never string-concatenate queries.
- Escape/validate all external input; treat calendar/API/device data as untrusted.
- No secrets in code, logs, or client bundles.
