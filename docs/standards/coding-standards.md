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

---

## 9. Expanded Standards (Engineering Documentation Pack)

> Added as part of the pre-Sprint-1 Engineering Documentation Pack. These extend
> sections 1-8 above and cross-reference the
> [Folder Convention](./folder-convention.md), [Naming Convention](./naming-convention.md),
> [Error Handling](./error-handling-convention.md), and
> [Logging](./logging-convention.md) rather than repeating them.

### 9.1 Module Structure (backend)

Each NestJS module is a bounded context and is internally layered
`domain -> application -> interface/infrastructure` (see
[Folder Convention §2](./folder-convention.md) and
[ADR-008](../adr/ADR-008-clean-architecture-ddd.md)).

- A module owns its entities, use cases, ports, and adapters; it does not reach
  into another module's internals - collaborate via public providers or events.
- Register providers and bind ports to implementations (DI tokens) in the
  `<name>.module.ts`.
- Cross-cutting infrastructure (Prisma, Redis, Queue, Config, Logger) lives in
  `src/shared/` and is imported, not re-implemented.

### 9.2 DTO Rules

- One DTO per request/response shape; suffix with intent (`CreateBookingDto`,
  `RoomStatusResponseDto`).
- Validate every field with `class-validator`; **whitelist** properties (reject
  unknown fields) and transform types explicitly.
- DTOs live in the module's `interface/dto/`; they are boundary objects, **not**
  domain entities - map DTO <-> domain in mappers, never leak Prisma models as DTOs.
- No business logic in DTOs.

### 9.3 Repository Rules

- Define a **repository port** (interface) in `application/ports/`; implement it
  in `infrastructure/repositories/` with Prisma.
- Repositories expose **domain-oriented** methods (`findActiveRoomsBySite`), not
  raw query builders; return domain entities/value objects, not Prisma types.
- Only repositories (and gateways) import Prisma. No Prisma in domain/application.
- Encapsulate transactions inside repository/use-case boundaries; keep them short.

### 9.4 Use Case Rules

- One use case = one application operation (`CreateBookingUseCase`,
  `CheckInMeetingUseCase`); expose a single `execute(input)`.
- Use cases orchestrate: validate pre-conditions, call domain services, call
  ports, emit domain events. They contain **no** framework or SQL code.
- Depend on **ports**, injected via DI - never instantiate infrastructure directly.
- Throw typed domain/application errors; do not format HTTP responses.

### 9.5 Controller Rules

- Controllers are **thin**: validate input (DTO + pipe), invoke a use case, map
  the result to a response DTO, set the status code. No business logic.
- Apply guards (auth/RBAC) and interceptors (logging/audit) declaratively.
- Never access repositories or Prisma directly from a controller.
- One controller per resource area; keep routes aligned with the
  [API Strategy](../API-STRATEGY.md).

### 9.6 Service Rules

- Distinguish **domain services** (pure business rules, e.g., `RoomStatusService`
  - no framework/IO) from **application services/use cases** (orchestration).
- Domain services are deterministic and unit-tested without mocks where possible;
  inject time/clock so time-based logic is testable.
- Keep services cohesive (SRP); split when a service grows multiple
  responsibilities.

### 9.7 Exception Rules

- Define typed errors in each module's `domain/errors/` extending a shared base
  error carrying a stable `code`.
- Throw the most specific error; never throw bare strings.
- A **global exception filter** maps errors to the standard API envelope; handlers
  do not build error responses themselves. See
  [Error Handling Convention](./error-handling-convention.md).
- No empty `catch`; never swallow errors silently; unexpected errors -> `500
  INTERNAL_ERROR` with detail in logs only.

### 9.8 Validation Rules

- Validate at the boundary (DTOs + `ValidationPipe`, `whitelist: true`,
  `forbidNonWhitelisted: true`).
- Enforce types, ranges, formats (emails, ISO dates, enums). Reject early with
  `400 VALIDATION_ERROR`.
- Treat all external input (requests, calendar data, device telemetry) as
  untrusted; re-validate at trust boundaries.
- Do not rely on client-side validation for security.

### 9.9 Logging Rules (in code)

- Use the shared structured logger; never `console.log` in committed code.
- Include `correlationId` and relevant `context`; **never log secrets/PII**
  beyond necessary identifiers. Full rules:
  [Logging Convention](./logging-convention.md).
- Log at appropriate levels (error/warn/info/debug); no debug logs in production
  paths.

### 9.10 Import Order

Group imports top-to-bottom, separated by a blank line; alphabetize within groups:

1. Node built-ins (`node:fs`, `node:path`).
2. External packages (`@nestjs/*`, `react`, third-party).
3. Internal workspace packages (`@mrms/*`).
4. Module-local absolute/relative imports (domain -> application -> infrastructure).
5. Type-only imports (`import type { ... }`) last within their group.

Enforced via ESLint import-order rules (configured in Sprint 1). No unused imports.

### 9.11 File Naming

- Follows the [Naming Convention](./naming-convention.md): `kebab-case` for TS
  files with role suffixes (`create-booking.use-case.ts`,
  `booking.controller.ts`, `prisma-booking.repository.ts`), `PascalCase.tsx` for
  React components, `useX.ts` for hooks, `*.spec.ts` for tests.
- One primary export per file where practical; co-locate tests with the unit.

### 9.12 Comments Policy

- Comment the **why**, not the **what**; keep comments accurate and current
  (stale comments are bugs).
- Public/exported APIs get concise TSDoc.
- No commented-out code in commits; no `TODO`/`FIXME` without a linked issue.
- Prefer clear names and small functions over explanatory comments.
