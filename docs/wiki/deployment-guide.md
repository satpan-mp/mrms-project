# Deployment Guide

> **Purpose:** Deploy MRMS to staging/production (on-premise, Docker).
> **Scope:** Build, migrate, deploy, verify, roll back.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Release Management](../process/release-management.md), [ADR-006 Docker](../adr/ADR-006-why-docker-deployment.md), [Configuration](../CONFIGURATION.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Operations Guide](./operations-guide.md)
> **References:** [Compose](https://compose-spec.io/)

Authoritative process: [Release Management](../process/release-management.md).
This is the quick operational path.

## Prerequisites

- On-prem Linux Docker host prepared (see
  [Infrastructure Backlog IB-001](../backlog/infrastructure-backlog.md)).
- Secrets provided via the host secret store (not committed) - see
  [Secrets](../SECRETS.md).
- Nginx TLS certificates installed (production).

## Deploy (production overrides)

```bash
# 1. Back up the database first (see Disaster Recovery)
# 2. Pull/build pinned image versions
# 3. Apply migrations (Sprint 1+): prisma migrate deploy
# 4. Start the stack
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

## Verify (post-deploy)

- Health endpoints green (`/health`, Nginx `/healthz`).
- A room display renders and updates in realtime.
- A calendar sync cycle succeeds; device heartbeats received.

## Rollback

Redeploy the previous pinned image tags; handle DB per
[Release Management §7](../process/release-management.md) and
[Disaster Recovery](../DISASTER-RECOVERY.md).

> Images are initialization skeletons until application code lands (Sprints 1/5/10).
