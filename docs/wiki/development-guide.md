# Development Guide

> **Purpose:** Daily development workflow for MRMS contributors.
> **Scope:** Coding, testing, branching, and PRs.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [CONTRIBUTING](../../CONTRIBUTING.md), [Development Standards](../standards/README.md), [Definition of Ready](../process/definition-of-ready.md), [Definition of Done](../process/definition-of-done.md), [Testing Strategy](../TESTING-STRATEGY.md)
> **References:** -

## Workflow (Git Flow + Conventional Commits)

1. Pick a Ready item (see [Definition of Ready](../process/definition-of-ready.md)).
2. Branch from `develop`: `feature/<id>-<summary>` or `bugfix/<id>-<summary>`
   ([Branch Convention](../standards/branch-convention.md)).
3. Implement following the [Coding Standards](../standards/coding-standards.md)
   (Clean Architecture + DDD, module layering).
4. Commit with [Conventional Commits](../standards/commit-convention.md).
5. Ensure it builds and passes lint/typecheck/tests before pushing.
6. Open a PR into `develop` using the PR template; satisfy the
   [Definition of Done](../process/definition-of-done.md).

## Common Commands

```bash
pnpm run lint        # lint (placeholder until Sprint 1)
pnpm run typecheck   # types (placeholder until Sprint 1)
pnpm run test        # tests (placeholder until Sprint 1)
pnpm run build       # build (placeholder until Sprint 1)
```

## Project Structure

See [Folder Structure](../17-Folder-Structure.md) and
[Folder Convention](../standards/folder-convention.md). Backend modules are
layered `domain -> application -> interface/infrastructure`.

## Testing

Follow the [Testing Strategy](../TESTING-STRATEGY.md): unit (mock ports),
integration (Testcontainers), contract, and E2E for critical flows. New code
ships with tests.

## Documentation-First

If your change affects architecture or behavior, update the relevant `docs/`
(and ADR/Decision Log/RFC as appropriate) **before** the task is Done.
