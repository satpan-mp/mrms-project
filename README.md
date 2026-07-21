<div align="center">

# Meeting Room Management System (MRMS)

**Enterprise meeting room display & booking platform for PT Mitra Prodin**

Integrated with Google Workspace - on-premise, real-time, multi-site.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-initialization-orange.svg)](./docs/18-Development-Roadmap.md)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](./LICENSE)

</div>

---

## Overview

MRMS turns every meeting room into a self-service, always-on information and
booking point. Each room runs an Intel NUC in Chrome Kiosk mode driving a Smart
TV that shows the room's live schedule and status, while facilities and IT teams
get centralized administration, device monitoring, and utilization analytics
across all factory sites.

**Google Calendar is the single source of truth.** The application reads
reservations and can create new events, but never edits or deletes existing
events. App-managed check-in, no-show handling, monitoring, and analytics are
stored in PostgreSQL.

> **Project status:** Sprint 1A - Foundation. The monorepo, shared packages,
> NestJS backend skeleton (health/version/ping), both SPA shells, database
> migration, CI, and Docker stack are in place; business features follow in
> later sprints. See the [Development Roadmap](./docs/18-Development-Roadmap.md).

### Key Capabilities

- Real-time room display: status, current/next meeting, today's schedule
- Room availability and in-app booking (creates a Google Calendar event)
- Google Calendar sync (read) with the app as a live cache
- Check-in with 15-minute no-show auto-release (Calendar untouched)
- One-tap Join Google Meet / Zoom from the display
- Centralized Admin Panel: sites, rooms, facilities, maintenance, sync, logs
- Device (NUC) monitoring via heartbeat + telemetry
- Utilization analytics and multi-site support

---

## Architecture

MRMS follows **Clean Architecture + Domain-Driven Design**, SOLID, and the
Repository Pattern, with a clear frontend/backend split and both REST and
WebSocket interfaces.

```
Rooms (Intel NUC / Chrome Kiosk)        Admin (browser)
        |  HTTPS / WSS                        |  HTTPS / WSS
        v                                     v
                    Nginx (TLS, reverse proxy, WS upgrade)
                                   |
             +---------------------+----------------------+
             |                     |                      |
        NestJS API           Socket.IO Gateway      BullMQ Workers
        (REST + use cases)   (realtime push)        (sync, sweeps, rollups)
             |                     |                      |
             +----------+----------+----------+-----------+
                        |                     |
                   PostgreSQL              Redis (cache, pub/sub, queue)
                        |
             Google Calendar / OAuth (external, source of truth)
```

Full detail: [System Context](./docs/05-System-Context-Diagram.md) and
[High-Level Architecture](./docs/06-High-Level-Architecture-Diagram.md).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, NestJS |
| Database | PostgreSQL (Prisma ORM) |
| Realtime | WebSocket (Socket.IO) |
| Auth | Google Workspace OAuth 2.0 + JWT |
| Cache / Queue | Redis, BullMQ |
| Deployment | Docker, Nginx (on-premise) |
| Tooling | pnpm workspaces, ESLint, Prettier |

---

## Repository Structure

```
mrms-project/
├── apps/               # backend (NestJS), display (kiosk SPA), admin (SPA)
├── packages/           # shared libraries (@mrms/*): ui, api-client, realtime, hooks, types, config
├── docker/             # Dockerfiles + docker-compose.{,dev,prod}.yml
├── infrastructure/     # nginx config, kiosk / device-agent
├── scripts/            # setup / release helper scripts
├── docs/               # design docs (01-19), standards/, MILESTONES.md
├── .github/            # CI/CD workflows, issue/PR templates, labels, protection
└── .vscode/            # workspace settings
```

Details: [Folder Structure](./docs/17-Folder-Structure.md).

---

## Installation

> Prerequisites: Node `>= 20.11`, pnpm `>= 9` (`corepack enable`), Docker +
> Docker Compose.

```bash
git clone https://github.com/satpan-mp/mrms-project.git
cd mrms-project

# Enable pnpm (via Corepack) and install the workspace
corepack enable
pnpm install

# Copy env and fill in real values (see docs/CONFIGURATION.md)
cp .env.example .env
```

> The foundation is functional: after `pnpm install`, generate the Prisma client
> (`pnpm --filter @mrms/backend exec prisma generate`) and bring up datastores
> via Docker Compose before running the backend.

---

## Development

```bash
# Workspace quality gates (run across all packages/apps)
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build

# Run an app in dev (Vite dev servers proxy /api and /realtime to the backend)
pnpm run dev:backend    # NestJS API on http://localhost:3000 (Swagger at /api/docs)
pnpm run dev:admin      # Admin SPA on http://localhost:5173
pnpm run dev:display    # Display SPA on http://localhost:5174
```

Local infrastructure via Docker Compose (postgres, redis, migrate, api, worker,
web, + pgAdmin in dev):

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up
```

Contribution workflow (Git Flow + Conventional Commits) is in
[CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/standards/](./docs/standards/README.md).

---

## Deployment

On-premise via Docker on a Linux host, fronted by Nginx (TLS termination + WS
upgrade). Displays across sites connect back to the central backend.

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

Configuration and secrets: [docs/CONFIGURATION.md](./docs/CONFIGURATION.md),
[docs/SECRETS.md](./docs/SECRETS.md). Production hardening (TLS, backups, log
shipping) is finalized in Phase P8.

---

## Screenshots

_Placeholder - UI screenshots will be added as the Display and Admin apps are
implemented (Sprints 5+ and 10+)._

| Room Display (Kiosk) | Admin Dashboard |
|----------------------|-----------------|
| _coming soon_ | _coming soon_ |

Wireframes: [UI/UX Wireframe](./docs/13-UIUX-Wireframe.md).

---

## Roadmap

Phased delivery (see [Development Roadmap](./docs/18-Development-Roadmap.md) and
[Sprint Planning](./docs/19-Sprint-Planning.md)):

| Phase | Theme |
|-------|-------|
| P0 | Foundation & scaffolding |
| P1 | Calendar read + Rooms |
| P2 | Display (Kiosk) + Realtime |
| P3 | Booking (create-only) |
| P4 | Check-in + No-show |
| P5 | Conferencing (Meet/Zoom) |
| P6 | Admin Panel + Monitoring |
| P7 | Analytics + Announcements |
| P8 | Hardening & Deployment |

Future: booking panels outside rooms, touch displays, mobile app, visitor
check-in, AI meeting assistant, occupancy sensors, Microsoft Teams integration.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). Use the issue and pull request templates,
follow the [development standards](./docs/standards/README.md), and adhere to the
Git Flow + Conventional Commits workflow.

---

## License

Proprietary and confidential. Copyright (c) 2026 PT Mitra Prodin. All rights
reserved. See [LICENSE](./LICENSE).
