# Installation Guide

> **Purpose:** First-time local setup of MRMS.
> **Scope:** Developer workstation setup.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [README](../../README.md), [Configuration](../CONFIGURATION.md), [Secrets](../SECRETS.md), [Development Guide](./development-guide.md)
> **References:** [pnpm](https://pnpm.io/), [Docker](https://docs.docker.com/)

## Prerequisites

- **Node** >= 20.11 (see `.nvmrc`)
- **pnpm** >= 9 (`corepack enable`)
- **Docker** + Docker Compose
- **Git**; access to `https://github.com/satpan-mp/mrms-project.git`

## Steps

```bash
git clone https://github.com/satpan-mp/mrms-project.git
cd mrms-project

# Bootstrap: copies .env.example -> .env and installs workspace deps
./scripts/setup.sh          # Windows: pwsh ./scripts/setup.ps1
```

1. Edit `.env` with real values - see [Configuration](../CONFIGURATION.md) and
   [Secrets](../SECRETS.md). **Never commit `.env`.**
2. Start local infrastructure (Postgres + Redis + services):

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up
```

> During initialization there is no application code yet; installs, containers,
> and scripts are scaffolding until Sprint 1. Backend/DB bootstrap (Prisma
> migrate + seed) is added in Sprint 1 (see
> [Technical Backlog](../backlog/technical-backlog.md)).

## Verify

- `docker compose ... ps` shows services healthy.
- Nginx `/healthz` responds `ok`.

## Next

Proceed to the [Development Guide](./development-guide.md).
