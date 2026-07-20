# Folder Structure

**Project:** Meeting Room Management System (MRMS)
**Document:** 17 of 19 — Repository / Folder Structure
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Approach

A **monorepo** (pnpm workspaces) holds backend, both frontends, shared packages,
infrastructure, and docs. This keeps API contracts and types synchronized across
frontend and backend and simplifies CI.

---

## 2. Top-Level Layout

```
mrms-project/
├── apps/
│   ├── backend/            # NestJS API + WebSocket gateway + workers
│   ├── display/            # React kiosk SPA (Vite)
│   └── admin/              # React admin SPA (Vite)
├── packages/
│   ├── ui/                 # @mrms/ui shared component library
│   ├── api-client/         # typed REST client (generated from OpenAPI)
│   ├── realtime/           # Socket.IO client + typed event contracts
│   ├── hooks/              # shared React Query hooks
│   ├── types/              # shared DTO/domain types
│   └── config/             # shared eslint/tsconfig/tailwind presets
├── docker/                 # Dockerfiles (api, worker, web) + docker-compose.*.yml
├── infrastructure/
│   ├── nginx/              # reverse proxy config (HTTP + WS upgrade, TLS)
│   └── kiosk/              # NUC Chrome kiosk + device agent scripts
├── scripts/                # dev/ops helper scripts (setup, seed, release)
├── docs/                   # 01..19 design documents (this set)
├── .github/                # workflows (CI/CD), ISSUE_TEMPLATE/, PR template, labels
├── .vscode/                # workspace settings & recommended extensions
├── README.md
├── LICENSE
├── CHANGELOG.md            # Keep a Changelog format
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.cjs
├── package.json            # workspace root
└── pnpm-workspace.yaml
```

> Note: Dockerfiles and all `docker-compose.*.yml` files live under `docker/`.
> Non-container infrastructure config (Nginx, kiosk/device-agent) lives under
> `infrastructure/`. This supersedes the earlier single-`infra/` grouping.

---

## 3. Backend (`apps/backend`)

Clean Architecture + DDD; one folder per module, each internally layered.

```
apps/backend/
├── prisma/
│   ├── schema.prisma       # from Doc 08
│   ├── migrations/
│   └── seed.ts             # sites (BB/GP/Jembrana), facilities, settings, admin
├── src/
│   ├── main.ts             # API bootstrap
│   ├── worker.ts           # BullMQ worker bootstrap
│   ├── app.module.ts
│   ├── shared/
│   │   ├── prisma/         # PrismaModule/service
│   │   ├── redis/
│   │   ├── queue/          # BullMQ setup
│   │   ├── config/         # env + Setting cache
│   │   ├── logger/         # structured logging, correlationId
│   │   ├── filters/        # global exception filter -> error envelope
│   │   ├── interceptors/   # logging, transform, audit
│   │   ├── guards/         # JwtAuthGuard, DeviceAuthGuard, RolesGuard
│   │   └── domain/         # shared VOs (TimeRange), base classes, events
│   └── modules/
│       ├── auth/
│       │   ├── domain/ application/ infrastructure/ interface/
│       │   └── auth.module.ts
│       ├── users/
│       ├── sites/
│       ├── rooms/
│       ├── facilities/
│       ├── google/         # ACL: calendar client, token mgmt, watch channels
│       ├── sync/           # jobs: syncRoom, renewWatch
│       ├── booking/        # create-only
│       ├── meetings/       # RoomStatusService (domain), cache queries
│       ├── checkin/        # jobs: noShowSweep
│       ├── monitoring/     # heartbeat ingest, deviceOfflineSweep
│       ├── analytics/      # rollupDaily, KPIs, trends
│       ├── notification/   # Socket.IO gateway, announcements, event bus
│       └── admin/          # logs, settings aggregation
├── test/                   # unit/integration/e2e
├── openapi.json            # generated spec (source for api-client)
├── Dockerfile              # (image build centralized in /docker)
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 3.1 Module internal layering (canonical)

```
modules/<name>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   └── errors/
├── application/
│   ├── use-cases/
│   └── ports/              # repository & gateway interfaces (DI tokens)
├── infrastructure/
│   ├── repositories/       # Prisma implementations of ports
│   ├── gateways/           # external adapters (e.g., Google)
│   └── mappers/            # entity <-> persistence/DTO
├── interface/
│   ├── <name>.controller.ts
│   ├── <name>.gateway.ts   # (notification only)
│   ├── <name>.processor.ts # (BullMQ processors where applicable)
│   └── dto/
└── <name>.module.ts
```

---

## 4. Display App (`apps/display`)

```
apps/display/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── providers/          # Theme, Realtime, DeviceAuth, Query
│   ├── screens/
│   │   └── RoomDisplayScreen.tsx
│   ├── components/         # DisplayHeader, StatusPill(usage), cards, ActionBar,
│   │   │                     TodayScheduleList, AnnouncementBanner, MaintenanceOverlay
│   │   └── booking/BookingModal.tsx
│   ├── hooks/              # useRoomStatus, useRoomSchedule, useConferenceLaunch
│   ├── lib/                # kiosk config parsing (room id + device token)
│   └── styles/             # tailwind entry, tokens
└── package.json
```

---

## 5. Admin App (`apps/admin`)

```
apps/admin/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── providers/          # Theme, Auth, Realtime, Query, Router
│   ├── routes/             # RequireRole guard, route definitions
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── SitesPage.tsx
│   │   ├── RoomsPage.tsx
│   │   ├── FacilitiesPage.tsx
│   │   ├── DevicesPage.tsx
│   │   ├── SyncPage.tsx
│   │   ├── AnnouncementsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── LogsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/         # KpiCards, LiveRoomGrid, DeviceHealthTable, charts…
│   ├── hooks/              # useRooms, useDevices, useAnalytics, useSyncStatus…
│   └── styles/
└── package.json
```

---

## 6. Shared Packages (`packages/`)

| Package | Contents | Consumers |
|---------|----------|-----------|
| `ui` | Theme, Button, StatusPill, Clock, Table, Modal, charts | display, admin |
| `api-client` | Typed fetch client generated from `openapi.json` | display, admin |
| `realtime` | Socket.IO client, typed event map | display, admin |
| `hooks` | Shared React Query hooks over api-client | display, admin |
| `types` | Shared DTO/domain/enum types | all |
| `config` | eslint, tsconfig base, tailwind preset | all |

---

## 7. Infrastructure (`docker/` + `infrastructure/`)

```
docker/
├── api.Dockerfile
├── worker.Dockerfile
├── web.Dockerfile              # builds display+admin static, served by nginx
├── docker-compose.yml          # base: api, worker, postgres, redis, nginx
├── docker-compose.dev.yml      # dev overrides (hot reload, exposed ports)
└── docker-compose.prod.yml     # prod overrides (replicas, restart policies)

infrastructure/
├── nginx/
│   ├── nginx.conf              # TLS, reverse proxy /api, /realtime (WS upgrade), static
│   └── conf.d/
└── kiosk/
    ├── chrome-kiosk.md         # kiosk flags, autostart, autologin guidance
    └── device-agent/           # heartbeat/telemetry agent for NUC (Windows)

scripts/
├── setup.sh / setup.ps1        # local bootstrap
├── seed.ts                     # convenience wrapper around prisma seed
└── release.sh                  # version bump + changelog + tag helper
```

---

## 8. Conventions

- **Naming:** `kebab-case` files, `PascalCase` React components/classes,
  `camelCase` vars; DB tables `snake_case` (Prisma `@@map`).
- **Boundaries:** frontend never imports backend internals — only `api-client`,
  `realtime`, `types`.
- **Contracts first:** `openapi.json`/AsyncAPI drive `api-client`/`realtime`
  types so FE/BE stay in sync.
- **Env:** `.env.example` per app; secrets never committed (NFR-SEC-4).
- **Tests:** colocated `*.spec.ts` for unit; `test/` for integration/e2e.

---

*End of Folder Structure.*
