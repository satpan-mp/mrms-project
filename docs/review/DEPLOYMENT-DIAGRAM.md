# Deployment & Infrastructure Diagrams

> **Purpose:** Deployment topology and infrastructure (containers, networks, volumes) for MRMS.
> **Scope:** On-premise Docker deployment: internet, firewall, reverse proxy, services, datastores, NUC/Chrome, Google.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [High-Level Architecture](../06-High-Level-Architecture-Diagram.md), [ADR-006 Docker](../adr/ADR-006-why-docker-deployment.md), [Deployment Guide](../wiki/deployment-guide.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Observability](../OBSERVABILITY.md)
> **References:** -

## 1. Deployment Diagram (topology)

```mermaid
flowchart TB
    subgraph Rooms["Meeting Rooms (BB / GP / Jembrana)"]
        NUC["Intel NUC (Windows)\nChrome Kiosk + Device Agent"]
        TV["Smart TV / Webcam / Mic"]
        NUC --- TV
    end
    subgraph GoogleCloud["Google Workspace (external)"]
        OAUTH[("Google OAuth")]
        GCAL[("Google Calendar API")]
        MEET[("Google Meet")]
    end
    ZOOM[("Zoom")]

    INET{{"Internet / Corporate WAN"}}
    FW["Firewall"]

    subgraph Server["On-Prem Linux Server (Docker Host)"]
        NGINX["Nginx\nTLS termination + reverse proxy + WS upgrade"]
        subgraph Compose["Docker Compose (project: mrms)"]
            API["NestJS API + Socket.IO Gateway\n(N replicas)"]
            WORKER["BullMQ Workers\n(M replicas)"]
            WEB["Web (static SPAs via Nginx)"]
            PG[("PostgreSQL\n+ volume pgdata")]
            REDIS[("Redis\n+ volume redisdata")]
        end
    end

    NUC -->|HTTPS/WSS| INET
    NUC -->|launch| MEET
    NUC -->|launch| ZOOM
    INET --> FW --> NGINX
    NGINX --> API
    NGINX --> WEB
    API --> PG
    API --> REDIS
    WORKER --> PG
    WORKER --> REDIS
    API -->|OAuth| OAUTH
    API -->|events.insert| GCAL
    WORKER -->|read events / watch| GCAL
```

## 2. Infrastructure Diagram (containers, networks, volumes)

```mermaid
flowchart TB
    subgraph Host["Docker Host (Linux)"]
        subgraph edgeNet["network: mrms-edge"]
            NGINX["nginx:1.27-alpine\n:80 (:443 prod)"]
        end
        subgraph appNet["network: mrms-internal (private)"]
            API["mrms/api\nexpose 3000"]
            WORKER["mrms/worker\n(no ports)"]
            WEB["mrms/web\n(nginx static)"]
            PG[("postgres:16-alpine\n:5432 (internal)")]
            REDIS[("redis:7-alpine\n:6379 (internal)")]
        end
        subgraph monNet["network: mrms-observability (P8)"]
            PROM["Prometheus"]
            GRAF["Grafana"]
            LOKI["Loki"]
        end
        VPG[["volume: pgdata"]]
        VRD[["volume: redisdata"]]
        VBK[["backups (off-host, encrypted)"]]
    end

    NGINX --> API
    NGINX --> WEB
    API --- PG
    API --- REDIS
    WORKER --- PG
    WORKER --- REDIS
    PG --- VPG
    REDIS --- VRD
    PG -. scheduled dump/WAL .-> VBK
    PROM -. scrape /metrics .-> API
    PROM -. scrape .-> WORKER
    GRAF --> PROM
    GRAF --> LOKI
    API -. logs .-> LOKI
    WORKER -. logs .-> LOKI
```

## 3. Networks

| Network | Purpose | Members |
|---------|---------|---------|
| `mrms-edge` | Public-facing entry | Nginx (only inbound surface) |
| `mrms-internal` | Private service/data traffic (not published) | API, worker, web, Postgres, Redis |
| `mrms-observability` | Metrics/logs (P8) | Prometheus, Grafana, Loki, exporters |

Only Nginx exposes ports to the host/network edge; datastores are never published
externally. Egress to Google APIs is outbound-only.

## 4. Volumes & Persistence

| Volume | Data | Backup |
|--------|------|--------|
| `pgdata` | PostgreSQL data | Daily `pg_dump` + WAL PITR, encrypted off-host (see DR) |
| `redisdata` | Redis AOF | Rebuildable; short-lived |
| backups target | DB dumps/WAL | Off-host, encrypted, retained per policy |

## 5. Notes

- Single-host Compose for v1 (ADR-006); HA/orchestrator is a documented future
  path. TLS certs + 443 are enabled in production (Phase P8).
- The observability network/stack is provisioned in Phase P8; the app is
  instrumented from Sprint 1 (metrics, logs, health).
