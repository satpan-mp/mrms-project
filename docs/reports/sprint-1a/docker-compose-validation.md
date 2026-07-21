# Docker Compose Validation — Sprint 1A

> **Purpose:** Record the validation of the container stack and the runtime-validation gap.
> **Scope:** `docker/` Dockerfiles, `docker-compose`, and Nginx reverse proxy.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [ADR-006 Docker](../../adr/ADR-006-why-docker-deployment.md), [Software Architecture](../../04-Software-Architecture.md), [NFR §10 Compatibility](../../03-NFR-Non-Functional-Requirements.md)

---

## 1. Requirement

Requirement #8 asks to **validate Docker Compose by running the complete stack.**

## 2. Environment limitation (honest status)

The build/verification sandbox **does not have Docker installed** (no Docker
daemon; `docker --version` and `docker compose version` are unavailable). It is
therefore **not possible to run the stack** here. This is an environment
constraint, not a defect in the compose definitions.

**Status: NOT RUNTIME-VALIDATED in this environment.** A runtime smoke test must
be performed on a host with Docker (developer machine or CI runner).

## 3. What was validated

| Check | Method | Result |
|-------|--------|--------|
| Multi-stage Dockerfiles (api/worker/web) present | Review | ✅ Present in `docker/`. |
| Dev `docker-compose` defines Postgres, Redis, pgAdmin + app services | Review | ✅ Present. |
| Nginx reverse proxy config for `/api`, `/realtime`, static | Review | ✅ Present. |
| Service wiring (env, ports, depends_on) internally consistent | Review | ✅ Consistent with the architecture. |
| Images build in CI | CI docker workflow | Validates image build (not full runtime orchestration). |

## 4. Required runtime smoke test (to run where Docker exists)

```bash
# From repo root, on a host with Docker + Docker Compose:
docker compose -f docker/docker-compose.yml up -d --build

# Wait for services, then verify:
curl -fsS http://localhost/api/v1/health     # expect 200 with DB+Redis up
curl -fsS http://localhost/api/v1/version     # expect version payload
curl -fsS http://localhost/api/v1/ping        # expect pong

# Apply the database migration inside the api container:
docker compose exec api pnpm --filter @mrms/backend prisma migrate deploy

# Tear down:
docker compose -f docker/docker-compose.yml down -v
```

**Pass criteria:** all services reach a healthy state; `/health` reports DB and
Redis healthy; SPAs are served through Nginx; the migration applies cleanly.

## 5. Action

| ID | Action | When |
|----|--------|------|
| TD-015 | Execute the compose runtime smoke test on a Docker-capable host / CI runner and attach logs here | Before relying on the stack for feature work |
| — | Add a CI job that runs `docker compose up` + health probes (service-container based) | Next infra sprint |

---

*End of Docker Compose Validation.*
