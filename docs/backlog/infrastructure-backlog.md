# Infrastructure Backlog

> **Purpose:** Deployment, CI/CD, observability, and operations work.
> **Scope:** Non-application infrastructure required for staging/production readiness.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Observability](../OBSERVABILITY.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Release Management](../process/release-management.md), [Operations Guide](../wiki/operations-guide.md), [Backlog index](./README.md)
> **References:** -

| ID | Item | Priority | Sprint/Phase | Est |
|----|------|:--------:|--------------|:---:|
| IB-001 | Provision on-prem Linux Docker host (staging + prod) | H | S1 / P0 | 5 |
| IB-002 | Nginx TLS termination + certificates (HTTPS/WSS) | H | S1/P8 | 5 |
| IB-003 | PostgreSQL backup + PITR + restore drills | H | S1/P8 | 8 |
| IB-004 | Redis persistence (AOF) + monitoring | M | S1 | 3 |
| IB-005 | CI: enable frozen-lockfile install + real gates | H | S1 | 3 |
| IB-006 | Image registry + tagging/publish on release | M | P8 | 5 |
| IB-007 | Observability stack: Prometheus + Grafana + Loki | M | P8 | 13 |
| IB-008 | Centralized log shipping + retention policy | M | P8 | 5 |
| IB-009 | Alerting rules (device offline, sync failure, resource) | M | P8 | 5 |
| IB-010 | Secret store / Docker secrets integration | H | S2/P8 | 5 |
| IB-011 | Dependabot + secret scanning + push protection enablement | M | S1 | 2 |
| IB-012 | NUC provisioning image (auto-login, kiosk, agent) | H | S6/S9 | 8 |
| IB-013 | Network topology validation (sites -> central backend) | H | P8 | 5 |
| IB-014 | Backup restore + DR drill automation/runbook | M | P8 | 5 |
