# Folder Convention

Authoritative layout is `docs/17-Folder-Structure.md`. This document summarizes
the rules that must be followed when adding files.

## 1. Monorepo Top Level

```
apps/            # deployable applications (backend, display, admin)
packages/        # shared libraries (@mrms/*)
docker/          # Dockerfiles + docker-compose.*.yml
infrastructure/  # nginx, kiosk / device-agent (non-container infra)
scripts/         # dev/ops helper scripts
docs/            # design docs (01-19), standards/, MILESTONES.md
.github/         # workflows, issue/PR templates, labels, protection docs
.vscode/         # workspace settings
```

## 2. Backend Module Layout (Clean Architecture + DDD)

Every backend module under `apps/backend/src/modules/<name>/` uses:

```
<name>/
├── domain/            # entities, value objects, domain services, errors (no framework)
├── application/
│   ├── use-cases/     # orchestration
│   └── ports/         # repository & gateway interfaces (DI tokens)
├── infrastructure/    # Prisma repositories, external gateways, mappers
├── interface/         # controllers, gateways, processors, DTOs
└── <name>.module.ts
```

Rules:
- New backend feature = new or existing **module**; do not scatter logic across
  unrelated modules.
- Cross-cutting infra (Prisma, Redis, Queue, Config, Logger) lives in
  `apps/backend/src/shared/`.
- The **dependency rule** is enforced: `interface -> application -> domain`,
  with `infrastructure` implementing `application` ports.

## 3. Frontend App Layout

```
apps/<display|admin>/src/
├── providers/     # Theme, Auth/DeviceAuth, Realtime, Query, Router
├── screens|pages/ # route-level components
├── components/    # presentational components
├── hooks/         # data + behavior hooks
├── lib/           # utilities (config parsing, formatters)
└── styles/        # tailwind entry + tokens
```

## 4. Shared Packages

- Reusable UI -> `packages/ui`.
- Anything imported by both apps and stable -> a `packages/*` package, never
  duplicated across apps.
- Frontend imports backend only through `@mrms/api-client`, `@mrms/realtime`,
  `@mrms/types` - never backend internals.

## 5. Placement Rules

- Tests colocated as `*.spec.ts`; integration/e2e in the app's `test/`.
- Docs for a behavior/architecture change go in `docs/` (or `docs/standards/`).
- Infra config never mixed into app source; use `docker/` and `infrastructure/`.
- No files at repo root except the approved root set (see `docs/17`).
