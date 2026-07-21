# ADR-009: Foundation tooling — pnpm workspaces, Zod env validation, pino logging, and split test runners

> **Purpose:** Record the foundation tooling decisions introduced during Sprint 1A implementation.
> **Scope:** Monorepo tooling, backend configuration/logging, and the test-runner strategy across the workspace.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [ADR-001 NestJS](./ADR-001-why-nestjs.md), [ADR-003 React/Vite](./ADR-003-why-react.md), [ADR-008 Clean Architecture + DDD](./ADR-008-clean-architecture-ddd.md), [Folder Structure](../17-Folder-Structure.md), [Backend Architecture](../16-Backend-Architecture.md), [Observability](../OBSERVABILITY.md), [Configuration](../CONFIGURATION.md), [Testing Strategy](../TESTING-STRATEGY.md)
> **References:** [Conventional Commits](https://www.conventionalcommits.org), [Zod](https://zod.dev), [Pino](https://getpino.io)

- **Status:** Accepted
- **Date:** 2026-07-21
- **Deciders:** MRMS Engineering (implementation of the approved Option A)

## Context

Sprint 1A builds the foundation for a multi-app system (two SPAs, a NestJS API,
and a worker) that share types, a design system, and API/realtime contracts. The
approved architecture (ADR-001/003/008, Docs 15/16/17) fixes the major choices
(NestJS, React/Vite, Prisma, Clean Architecture). It does **not** pin the
supporting tooling needed to make a shared monorepo cohesive: the workspace
manager, environment-config validation, the logging library, and how tests run
across heterogeneous packages. These are architecturally significant (they shape
DX, safety, and boundaries) yet were left to implementation, so they are recorded
here per the "update ADRs whenever a new architectural decision is introduced"
policy.

## Problem

Which supporting tools should the foundation standardize on for (a) workspace
management, (b) backend environment-variable validation, (c) structured logging,
and (d) test running across backend vs frontend/packages?

## Alternatives Considered

| Decision | Option | Pros | Cons |
|----------|--------|------|------|
| Workspace mgr | **pnpm workspaces** | Fast, strict, content-addressed store; first-class monorepo; disk-efficient | Team must use pnpm (not npm/yarn) |
| | npm/yarn workspaces | Ubiquitous | Slower, looser hoisting, weaker monorepo ergonomics |
| Env validation | **Zod schema at boot** | Fail-fast, typed config, single source of truth | Extra dep; schema upkeep |
| | Raw `process.env` / Joi | No/less deps | Untyped or non-TS-native; runtime surprises |
| Logging | **nestjs-pino (Pino)** | Fast async JSON logs, correlation IDs, low hot-path overhead (NFR-OBS-1) | JSON logs need a pretty-printer in dev |
| | Nest default logger / Winston | Simple / flexible | Slower or less structured by default |
| Test runners | **Vitest (FE/pkgs) + Jest (backend)** | Vitest is native to Vite SPAs/packages; Jest+supertest is idiomatic for Nest e2e | Two runners to maintain |
| | One runner everywhere | Uniform | Friction against each ecosystem's defaults |

## Decision

Adopt, for the foundation:

1. **pnpm workspaces** as the monorepo manager (`pnpm-workspace.yaml`; `apps/*`, `packages/*`), with Conventional Commits enforced via commitlint + Husky + lint-staged.
2. **Zod** for backend environment-variable validation at application boot (fail-fast, typed config surfaced through Nest `ConfigModule`).
3. **nestjs-pino (Pino)** for structured JSON logging with request correlation IDs (satisfies NFR-OBS-1/4).
4. **Split test runners**: Vitest for SPAs and shared packages; Jest + supertest for backend unit/e2e — each ecosystem uses its idiomatic runner.

Shared ESLint/TypeScript/Tailwind presets live in `@mrms/config` to keep these
choices consistent across the workspace.

## Consequences

- **Positive:** Fast, reproducible installs; fail-fast typed configuration; low-overhead structured logs aligned with observability NFRs; each app tests with the tool its ecosystem expects; consistent lint/format/commit gates.
- **Negative / trade-offs:** The team is committed to pnpm; two test runners must be maintained; JSON logs require a dev pretty-printer.
- **Neutral:** These choices are reversible relative to the core architecture (they do not alter module boundaries or the Clean Architecture layering in ADR-008).

## Future Considerations

- Revisit if the team standardizes on a single cross-stack test runner, or if a config platform (e.g., a secrets manager) supersedes Zod-validated env for some values.
- If the worker needs an independent deploy cadence, promote `worker.ts` to its own workspace app (noted in the Workspace Structure Report).
