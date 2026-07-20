# MRMS Development Standards

These standards are **mandatory** for all contributions to the Meeting Room
Management System. They complement the design documents in `../` (01-19) and the
Development Workflow & Reporting Policy.

| # | Standard | Scope |
|---|----------|-------|
| 1 | [Coding Standards](./coding-standards.md) | Language, style, quality rules (TypeScript, React, NestJS) |
| 2 | [Naming Convention](./naming-convention.md) | Files, symbols, DB, API, branches |
| 3 | [Folder Convention](./folder-convention.md) | Monorepo & module layout |
| 4 | [API Convention](./api-convention.md) | REST + WebSocket contracts |
| 5 | [Database Convention](./database-convention.md) | Prisma / PostgreSQL |
| 6 | [Git Convention](./git-convention.md) | Git Flow workflow |
| 7 | [Commit Convention](./commit-convention.md) | Conventional Commits |
| 8 | [Branch Convention](./branch-convention.md) | Branch naming & lifecycle |
| 9 | [Environment Variable Convention](./environment-variable-convention.md) | Config & secrets |
| 10 | [Error Handling Convention](./error-handling-convention.md) | Errors across layers |
| 11 | [Logging Convention](./logging-convention.md) | Structured logging & audit |

**Guiding principles (all standards inherit these):**

- Clean Architecture + Domain-Driven Design; dependencies point inward.
- SOLID principles and the Repository Pattern.
- Security by default; never commit secrets.
- Documentation stays synchronized with implementation.
- Every change is verifiable (build + lint + typecheck + tests).
