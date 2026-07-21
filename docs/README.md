# MRMS Documentation Index

> **Purpose:** Master index and navigation for all MRMS documentation.
> **Scope:** Every design, engineering, process, and operational document.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Project README](../README.md), [Development Standards](standards/README.md)
> **References:** -

This is the single entry point to MRMS documentation. It follows
**Documentation-First Development**: docs stay synchronized with implementation,
and changes to architecture/behavior update the relevant document(s) before a
task is considered done.

## 1. Design Documents (01-19)

The core design set, produced before implementation and kept authoritative:

| # | Document |
|---|----------|
| 01 | [Product Requirement Document (PRD)](01-PRD-Product-Requirement-Document.md) |
| 02 | [Functional Requirement Specification (FRS)](02-FRS-Functional-Requirement-Specification.md) |
| 03 | [Non-Functional Requirements (NFR)](03-NFR-Non-Functional-Requirements.md) |
| 04 | [Software Architecture](04-Software-Architecture.md) |
| 05 | [System Context Diagram](05-System-Context-Diagram.md) |
| 06 | [High-Level Architecture Diagram](06-High-Level-Architecture-Diagram.md) |
| 07 | [Database ERD](07-Database-ERD.md) |
| 08 | [Database Schema](08-Database-Schema.md) |
| 09 | [API Specification](09-API-Specification.md) |
| 10 | [Google Calendar Integration Design](10-Google-Calendar-Integration-Design.md) |
| 11 | [Google Meet Integration Flow](11-Google-Meet-Integration-Flow.md) |
| 12 | [Authentication Flow](12-Authentication-Flow.md) |
| 13 | [UI/UX Wireframe](13-UIUX-Wireframe.md) |
| 14 | [Component Hierarchy](14-Component-Hierarchy.md) |
| 15 | [Frontend Architecture](15-Frontend-Architecture.md) |
| 16 | [Backend Architecture](16-Backend-Architecture.md) |
| 17 | [Folder Structure](17-Folder-Structure.md) |
| 18 | [Development Roadmap](18-Development-Roadmap.md) |
| 19 | [Sprint Planning](19-Sprint-Planning.md) |

## 2. Architecture Decision Records (ADR)

[ADR index](adr/README.md) · [template](adr/adr-template.md)

ADR-001 NestJS · ADR-002 PostgreSQL · ADR-003 React · ADR-004 Socket.IO vs MQTT ·
ADR-005 Google Calendar SSOT · ADR-006 Docker · ADR-007 Prisma ·
ADR-008 Clean Architecture + DDD · ADR-009 Foundation tooling (pnpm/Zod/pino/test runners).

## 3. Change & Decision Governance

| Document | Purpose |
|----------|---------|
| [RFC process + template](rfc/README.md) | Propose significant changes before implementation |
| [Decision Log](decisions/README.md) | Product/process decisions (D-001..) |
| [Risk Register](RISK-REGISTER.md) | Risks (R-01..) with mitigation/contingency |

## 4. Strategy & Engineering References

| Document | Purpose |
|----------|---------|
| [API Strategy](API-STRATEGY.md) | Versioning, pagination, filtering, sorting, idempotency |
| [Database Strategy](DATABASE-STRATEGY.md) | Migrations, rollback, seed, indexing, retention |
| [Security Guide](SECURITY.md) | OAuth, JWT, RBAC, CORS, Helmet, OWASP, audit |
| [Secrets Management](SECRETS.md) | Handling sensitive values |
| [Configuration Guide](CONFIGURATION.md) | Env vars + runtime settings |
| [Testing Strategy](TESTING-STRATEGY.md) | Test levels, matrix, coverage |
| [Monitoring & Observability](OBSERVABILITY.md) | Logs, metrics, traces, alerting |
| [Backup & Disaster Recovery](DISASTER-RECOVERY.md) | RTO/RPO, backup, restore |
| [Google Workspace Integration Guide](GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md) | Operational Google/Calendar guide |
| [Display Client Recovery](DISPLAY-CLIENT-RECOVERY.md) | Kiosk/NUC recovery scenarios |

## 5. Development Standards

[Standards index](standards/README.md): coding, naming, folder, API, database,
git, commit, branch, environment-variable, error-handling, and logging
conventions.

## 6. Process

| Document | Purpose |
|----------|---------|
| [Definition of Ready](process/definition-of-ready.md) | When work may start |
| [Definition of Done](process/definition-of-done.md) | When work is complete |
| [Release Management](process/release-management.md) | Versioning, RC, release, rollback, hotfix |
| [Milestones](MILESTONES.md) | Sprint-to-milestone + release-tag mapping |

## 7. Backlogs

[Backlog index](backlog/README.md): [product](backlog/product-backlog.md),
[technical](backlog/technical-backlog.md), [technical debt](backlog/technical-debt.md),
[infrastructure](backlog/infrastructure-backlog.md),
[future improvements](backlog/future-improvements.md).

## 7a. Releases & Sprint Reports

| Document | Purpose |
|----------|---------|
| [Release Notes — v0.1.0 (Sprint 1A)](releases/v0.1.0-sprint-1a.md) | Foundation release notes |
| [Sprint 1A Report Pack](reports/sprint-1a/README.md) | Architecture validation, dependency audit, bundle size, backend performance, DB migration, Docker validation, workspace structure, git statistics, sprint progress, UI screenshots, repository health |
| [Final Foundation Completion Report](reports/FINAL-FOUNDATION-COMPLETION-REPORT.md) | v0.2.0-foundation consolidation, enterprise scorecard, GO/NO-GO |
| [Enterprise Certification](reports/SPRINT-1A-ENTERPRISE-CERTIFICATION.md) · [Final Engineering Review](reports/FINAL-ENGINEERING-REVIEW.md) · [Engineering Checklist](reports/final-engineering-checklist.md) | Certification passes |
| [Pre-Sprint-1B Certification](certification/PRE-SPRINT-1B-CERTIFICATION.md) · [Executive Summary](certification/EXECUTIVE-SUMMARY.md) | Certification |
| [Sprint 1B Engineering Rules](process/SPRINT-1B-ENGINEERING-RULES.md) | Mandatory rules (enforced by branch protection) |
| Release **v0.2.0-foundation** | Consolidated baseline / rollback point (GitHub Releases) |

## 8. Project Wiki (operational)

[Wiki index](wiki/README.md): installation, development, deployment,
troubleshooting, FAQ, known issues, maintenance, monitoring, disaster recovery,
operations.

## 9. Document Conventions

Every document includes a metadata header: **Purpose, Scope, Version, Author,
Last Updated, Related Documents, References**. Cross-references use relative
links. Deep content is authoritative in one place; other docs link to it rather
than duplicating.

## 10. Key Project Invariants (quick reference)

- **Google Calendar is the single source of truth**; the app **reads + creates**
  events only - **never edits/deletes** ([ADR-005](adr/ADR-005-google-calendar-source-of-truth.md)).
- **Check-in/no-show** are app-only (PostgreSQL); 15-min no-show auto-release
  never touches Calendar ([D-003](decisions/README.md)).
- **Room status** is computed server-side and pushed in realtime.
- **Clean Architecture + DDD**, SOLID, Repository Pattern
  ([ADR-008](adr/ADR-008-clean-architecture-ddd.md)).
- Stack: React/TS/Vite/Tailwind · NestJS · PostgreSQL/Prisma · Redis · BullMQ ·
  Socket.IO · Google OAuth · Docker · Nginx.
