# Architecture Validation Report — Sprint 1A

> **Purpose:** Validate the Sprint 1A implementation against the approved architecture documents.
> **Scope:** Foundation only (tooling, packages, backend skeleton, SPAs, containers, CI).
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [PRD](../../01-PRD-Product-Requirement-Document.md), [NFR](../../03-NFR-Non-Functional-Requirements.md), [Software Architecture](../../04-Software-Architecture.md), [DB Schema](../../08-Database-Schema.md), [API Spec](../../09-API-Specification.md), [Frontend Architecture](../../15-Frontend-Architecture.md), [Backend Architecture](../../16-Backend-Architecture.md), [Folder Structure](../../17-Folder-Structure.md), [ADR index](../../adr/README.md)

---

## Legend

- ✅ **Conforms** — implemented and consistent with the document.
- 🟡 **Partial / Deferred** — foundation-appropriate subset in place; remainder scheduled for a later sprint (by design, not a defect).
- ⛔ **Deviation** — differs from the document (with justification).

Sprint 1A is a **foundation** sprint. Many product requirements are intentionally
out of scope; those are marked 🟡 with the sprint that delivers them, not ⛔.

---

## 1. PRD (Document 01)

| Area | Status | Notes |
|------|:------:|-------|
| Two frontends (Display + Admin) | ✅ | `apps/display` + `apps/admin` scaffolded and rendering. |
| Google Meet-inspired, enterprise, minimal UI | ✅ | Design tokens + ThemeProvider + layout established in `@mrms/ui`. |
| Meeting-room features (booking, check-in, status, analytics) | 🟡 | Out of scope for 1A; delivered Sprints 1B+ per [Sprint Planning](../../19-Sprint-Planning.md). |
| On-prem, Google Workspace org | ✅ | No external hosting assumptions introduced; Docker/Nginx foundation present. |

**Verdict:** Conforms for foundation scope; product features correctly deferred.

## 2. ADRs (Documents adr/ADR-001..008)

| ADR | Decision | Status | Evidence |
|-----|----------|:------:|----------|
| ADR-001 | NestJS backend | ✅ | `apps/backend` is NestJS 10 with modules, DI, pipes, filters. |
| ADR-002 | PostgreSQL datastore | ✅ | Prisma `datasource` = postgresql; `DATABASE_URL` env. |
| ADR-003 | React + TS + Vite | ✅ | Both SPAs use React + TypeScript + Vite. |
| ADR-004 | Socket.IO over MQTT | 🟡 | `@mrms/realtime` defines the typed Socket.IO contract; server gateway lands with realtime features. |
| ADR-005 | Google Calendar SSOT (read+create only) | 🟡 | No Calendar code yet; **no edit/delete scopes or endpoints introduced** — invariant preserved. |
| ADR-006 | Docker on-prem | ✅ | Multi-stage Dockerfiles + compose + Nginx reverse proxy. |
| ADR-007 | Prisma ORM | ✅ | Prisma schema + migration + generated client. |
| ADR-008 | Clean Architecture + DDD | 🟡 | Module boundaries and separation established; full layer/use-case structure grows with features. |

New foundation-tooling decisions (pnpm workspaces, Zod env validation, nestjs-pino, Vitest/Jest split) are captured in **[ADR-009](../../adr/ADR-009-foundation-tooling.md)**.

**Verdict:** Conforms; no ADR invariant violated. Notably the ADR-005 "never edit/delete" invariant is structurally preserved (no such code paths exist).

## 3. Software Architecture (Document 04)

| Aspect | Status | Notes |
|--------|:------:|-------|
| Frontend/backend separation | ✅ | Distinct apps; SPAs talk to API via `@mrms/api-client`. |
| Stateless API + shared Redis/DB | ✅ | Redis + Postgres modules; no in-process session state. |
| Worker tier (queue) | 🟡 | `worker.ts` bootstrap present; BullMQ processors added with sync features. |
| Nginx reverse proxy (HTTP + WS) | ✅ | Nginx config proxies `/api`, `/realtime`, and static assets. |

## 4. API Specification (Document 09)

| Convention | Status | Notes |
|------------|:------:|-------|
| Base path `/api/v1` | ✅ | Global prefix + URI versioning configured. |
| JSON error envelope (`error.code`, `message`, `details`, `correlationId`) | ✅ | Global exception filter emits this exact shape; correlation ID from pino. |
| OpenAPI 3.x at `/api/docs` (non-prod) | ✅ | Swagger UI wired, non-prod only. |
| DTO validation via class-validator | ✅ | Global `ValidationPipe` enabled. |
| `GET /health` public | ✅ | Terminus health with DB + Redis indicators. |
| Feature endpoints (auth, rooms, bookings, sync, devices, analytics…) | 🟡 | Not in 1A; `/version` and `/ping` added as operational endpoints. |
| WebSocket `/realtime` (Socket.IO) | 🟡 | Contract defined in `@mrms/realtime`; gateway lands with realtime features. |

**Minor note:** `/version` and `/ping` are operational endpoints not listed in Doc 09's summary table. They are additive and non-conflicting; recommend adding them to the API spec's operational section (tracked as a docs follow-up).

## 5. Database Schema (Document 08)

| Model | In 1A schema? | Status | Notes |
|-------|:-------------:|:------:|-------|
| `User` (+ `UserRole` enum) | Yes | ✅ | Matches Doc 08 fields (googleId, email, role, etc.). |
| `SystemLog` (+ `LogType` enum) | Yes | ✅ | Matches Doc 08 (logType, action, metadata, indexes). |
| `Setting` | Yes | ✅ | Matches Doc 08 (`@@unique([key, scope])`). |
| `Site`, `Room`, `Facility`, `MeetingCache`, `Booking`, `CheckIn`, `Device`, `Announcement`, `AnalyticsDaily`, `SyncState`, … | No | 🟡 | Intentionally deferred; materialized as features arrive. See [DB migration report](./database-migration-report.md). |

The three materialized models are **field-for-field consistent** with Document 08
(names, enums, `@@map`, `@@unique`, `@@index`). No schema drift. RBAC uses the
approved enum-based `UserRole` (ADMINISTRATOR/EMPLOYEE) — **no separate
roles/permissions tables** were introduced, consistent with the approved design.

## 6. UI Design System (Documents 13 UI/UX, 14 Component Hierarchy, 15 Frontend Architecture)

| Aspect | Status | Notes |
|--------|:------:|-------|
| Light + Dark mode (NFR-USE-2) | ✅ | ThemeProvider with persisted preference. |
| Design tokens (Google Meet-inspired) | ✅ | Central tokens in `@mrms/ui` + Tailwind preset. |
| Shared component library | ✅ | `@mrms/ui` primitives with a11y considerations (labelled titles). |
| Display: zero-interaction legibility (NFR-USE-1/6) | 🟡 | Layout shell present; full display board arrives with room-status features. |
| Admin desktop usability (NFR-USE-4) | ✅ | Admin layout targets desktop resolutions. |
| WCAG 2.1 AA contrast (NFR-USE-5) | 🟡 | Token contrast chosen with AA intent; full validation requires manual assistive-tech testing (see [UI screenshots report](./ui-screenshots.md)). |

## 7. NFR cross-check (Document 03) — foundation-relevant items

| NFR | Status | Evidence |
|-----|:------:|----------|
| NFR-MAINT-1/2/3 (Clean Arch, SOLID, FE/BE separation) | 🟡/✅ | Boundaries + separation in place; layering deepens with features. |
| NFR-MAINT-4 (lint/format gates in CI) | ✅ | CI runs lint + typecheck; 0/0 locally. |
| NFR-MAINT-5 (OpenAPI docs) | ✅ | Swagger enabled. |
| NFR-OBS-1 (structured JSON logging + correlation IDs) | ✅ | nestjs-pino with correlation IDs. |
| NFR-OBS-3 (health/readiness per service) | ✅ | Terminus `/health` (DB + Redis). |
| NFR-SEC-4 (secrets outside source control) | ✅ | `.env` untracked; `.env.example` documents keys. |
| NFR-SEC-7 (server-side input validation) | ✅ | Global ValidationPipe. |
| NFR-COMPAT-2/3 (Linux/Docker, Nginx HTTP+WS) | ✅ | Docker + Nginx foundation. |

---

## Summary

- **Deviations (⛔): 0.**
- **Conforms (✅):** all foundation-scoped requirements.
- **Partial/Deferred (🟡):** product features and deeper layering, correctly scheduled for later sprints.

**Overall:** The Sprint 1A implementation is **consistent with the approved
architecture**. The only follow-ups are documentation additions (record
`/version` and `/ping` in Doc 09) and the deferred items that later sprints
deliver by design.

---

*End of Architecture Validation Report.*
