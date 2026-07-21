# ADR-010: Value imports for NestJS DI — disable `consistent-type-imports` on the backend

> **Purpose:** Record the decision to disable `@typescript-eslint/consistent-type-imports` for the NestJS backend to protect dependency-injection metadata.
> **Scope:** `apps/backend` lint configuration and injected-class import style.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [ADR-001 NestJS](./ADR-001-why-nestjs.md), [ADR-009 Foundation tooling](./ADR-009-foundation-tooling.md), [Backend Certification](../certification/PRE-SPRINT-1B-CERTIFICATION.md)
> **References:** TypeScript `emitDecoratorMetadata`; typescript-eslint `consistent-type-imports`

- **Status:** Accepted
- **Date:** 2026-07-21
- **Deciders:** Pre-Sprint 1B certification review

## Context

NestJS resolves constructor dependencies at runtime using metadata emitted by
TypeScript's `emitDecoratorMetadata` (the `design:paramtypes` reflection). That
metadata requires the injected class to be a **value** import. If a class used
only as a constructor parameter type is imported as a **type-only** import
(`import type { X }` or inline `import { type X }`), TypeScript elides it and the
reflected parameter type becomes `Object`, so Nest throws at runtime:
`Nest can't resolve dependencies of the <Provider> (?). ... argument Object at index [0]`.

The shared base ESLint preset enabled
`@typescript-eslint/consistent-type-imports` with `fixStyle: 'inline-type-imports'`.
On `lint --fix` (and via lint-staged pre-commit), this rule **automatically
rewrote injected-class imports to type-only imports**, silently breaking DI. The
pre-Sprint-1B certification found the backend unit and e2e suites failing for
exactly this reason across four files.

## Problem

How do we prevent the lint tooling from converting DI-critical imports to
type-only imports and breaking NestJS dependency injection?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Disable `consistent-type-imports` for the backend preset | Eliminates the whole failure class; zero maintenance | Loses a minor stylistic optimization on the backend |
| Keep rule; manually re-fix injected imports each time | Preserves style rule | Fragile; `--fix`/pre-commit re-breaks it; recurring outages |
| Keep rule but disable autofix only | Warnings remain visible | typescript-eslint can't scope autofix per-symbol; still error-prone |
| Switch DI to explicit `@Inject(Token)` everywhere | Token-based DI is metadata-independent | Verbose; non-idiomatic for concrete class providers |

## Decision

**Disable `@typescript-eslint/consistent-type-imports` in the NestJS ESLint
preset** (`packages/config/eslint/nest.cjs`). On the backend, classes that are
injected (providers, controllers, indicators, framework services like
`ConfigService`, `HealthCheckService`) **must be imported as values**. The rule
remains active for the frontend/shared packages where it is safe and useful.

## Consequences

- **Positive:** NestJS DI can no longer be silently broken by an autofix; the
  failure class is eliminated at the tooling level. CI is green and the app
  bootstraps correctly.
- **Negative / trade-offs:** The backend loses the (cosmetic) enforcement of
  type-only imports; developers should still prefer `import type` for pure types.
- **Neutral:** No runtime or architectural change beyond import style.

## Future Considerations

- If typescript-eslint later ships DI-aware handling (or NestJS moves to a
  metadata-free DI model), revisit re-enabling the rule on the backend.
- Consider a lightweight lint rule/test that asserts injected classes are value
  imports, as an additional safety net.
