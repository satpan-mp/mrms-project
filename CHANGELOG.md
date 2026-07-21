# Changelog

All notable changes to the Meeting Room Management System (MRMS) are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
During pre-1.0 development, minor versions may include breaking changes; each is
noted explicitly.

## [Unreleased]

### Added
- **Sprint 1A - Foundation.** Working monorepo application skeleton (no business
  features yet), per the approved architecture.
  - Shared packages: `@mrms/config` (ESLint/TS/Tailwind presets + design tokens),
    `@mrms/types` (API/domain/realtime contracts), `@mrms/api-client` (typed Axios
    client), `@mrms/realtime` (typed Socket.IO client), `@mrms/hooks` (React Query
    hooks), `@mrms/ui` (ThemeProvider, tokens, accessible primitives).
  - Backend (`@mrms/backend`, NestJS): ConfigModule with zod env validation,
    structured logging (nestjs-pino) with correlation IDs, global ValidationPipe,
    global exception filter (standard error envelope), CORS, `/api/v1` versioning,
    Swagger at `/api/docs`; Prisma + Redis modules; Terminus `/health` (database +
    redis) plus `/version` and `/ping`; minimal BullMQ worker bootstrap.
  - Database: Prisma schema for `User`/`SystemLog`/`Setting` (foundation subset of
    Doc 08) + initial migration + idempotent settings seed.
  - Frontends: `@mrms/admin` (desktop SPA shell + dashboard) and `@mrms/display`
    (fullscreen kiosk shell) on Vite/React/Tailwind, rendering the approved Design
    System (light/dark) with a live backend status indicator.
  - Tooling: Husky + lint-staged + commitlint; committed `pnpm-lock.yaml`.
  - CI: real lint / typecheck / test / build pipeline; CodeQL, Dependency Review,
    and Dependabot (from the governance branch).
  - Docker: multi-stage `api`/`worker`/`web` images and a runnable Compose stack
    (postgres, redis, migrate, api, worker, web, + dev pgAdmin).

### Notes
- Verified locally with pnpm: typecheck, lint (0 errors/0 warnings), unit + e2e
  tests, and full build all pass across the workspace.

## [0.1.0] - 2026-07-20

### Added
- Initial project foundation and production-ready repository scaffold.
- Complete design documentation set (`docs/01`..`docs/19`): PRD, FRS, NFR,
  Software Architecture, System Context & High-Level Architecture diagrams,
  Database ERD & Schema, API Specification, Google Calendar & Meet integration
  designs, Authentication flow, UI/UX Wireframe, Component Hierarchy, Frontend &
  Backend Architecture, Folder Structure, Development Roadmap, and Sprint Planning.
- Development standards (`docs/standards/`): coding, naming, folder, API,
  database, git, commit, branch, environment-variable, error-handling, and
  logging conventions.
- Monorepo scaffold: pnpm workspaces (`apps/*`, `packages/*`), root tooling
  (`.editorconfig`, `.prettierrc`, `.eslintrc.cjs`, `.nvmrc`, `.gitignore`),
  and `.vscode/` workspace settings.
- Placeholder app and package directories (`apps/backend`, `apps/display`,
  `apps/admin`, `packages/`) and helper scripts (`scripts/setup.*`).
- GitHub project assets: issue templates (bug, feature, task, improvement,
  question), pull request template, recommended labels (`.github/LABELS.md` +
  `labels.yml`), branch protection recommendations, and milestones mapping
  (`docs/MILESTONES.md`).
- CI/CD workflows: `ci.yml` (install, lint, typecheck, test, build) and
  `docker.yml` (image build validation).
- Docker infrastructure: skeleton Dockerfiles (`api`, `worker`, `web`) and
  `docker-compose.yml` / `.dev.yml` / `.prod.yml`; Nginx reverse-proxy config and
  kiosk provisioning reference under `infrastructure/`.
- Environment configuration: `.env.example`, `docs/CONFIGURATION.md`, and
  `docs/SECRETS.md`.
- Proprietary `LICENSE`, `README.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.

### Notes
- No application logic yet. This release is repository initialization only.
- Google Calendar remains the single source of truth; the app will read and
  create events only (never edit or delete).

[Unreleased]: https://github.com/satpan-mp/mrms-project/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/satpan-mp/mrms-project/releases/tag/v0.1.0
