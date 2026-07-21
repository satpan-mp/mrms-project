# ADR-006: Why Docker for on-premise deployment

> **Purpose:** Record the deployment/packaging choice.
> **Scope:** Backend API, workers, web (SPAs via Nginx), Postgres, Redis.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [High-Level Architecture](../06-High-Level-Architecture-Diagram.md), [Release Management](../process/release-management.md), [Operations Guide](../wiki/operations-guide.md)
> **References:** [Docker docs](https://docs.docker.com/), [Compose spec](https://compose-spec.io/)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team, IT/Ops

## Context

MRMS runs **on-premise** on a Linux server behind Nginx, with multiple services
(API, workers, Postgres, Redis, web). The Master Brief mandates Docker + Nginx.

## Problem

How do we package and run multiple services reproducibly on an on-premise Linux
host with minimal environment drift?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Docker + Docker Compose** | Reproducible images, isolated services, simple multi-service orchestration, easy local/prod parity, mandated | Team manages host, volumes, backups |
| Bare-metal / systemd services | No container overhead | Environment drift; manual dependency management; harder parity |
| Kubernetes | Powerful orchestration, self-healing | Excessive operational overhead for a single on-prem host at this scale |

## Decision

Adopt **Docker with Docker Compose** for v1. Compose orchestrates api, worker,
web (Nginx), postgres, and redis with health checks and named volumes. This gives
reproducible deployments and local/prod parity without Kubernetes overhead.

## Consequences

- **Positive:** Consistent, versioned images; simple `up`/`down`; clear service
  boundaries; straightforward on-prem operation and rollback (retag/redeploy).
- **Negative / trade-offs:** Ops owns volume backups and host hardening; Compose
  is single-host (acceptable for current topology).
- **Neutral:** Multi-stage Dockerfiles keep images small.

## Future Considerations

If the deployment must span multiple hosts or require auto-scaling/self-healing,
migrate the same images to a lightweight orchestrator (Docker Swarm or
Kubernetes) via a future RFC. Images are built to be orchestrator-agnostic.
