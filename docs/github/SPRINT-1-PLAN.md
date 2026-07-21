# Sprint 1 Implementation Plan (Phased)

> **Purpose:** Split Sprint 1 into implementation phases (1A-1F) with a recommended, dependency-driven order.
> **Scope:** Planning only. Implementation begins after explicit approval.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Development Roadmap](../18-Development-Roadmap.md), [Sprint Planning](../19-Sprint-Planning.md), [Milestones](./MILESTONES.md), [Backend Architecture](../16-Backend-Architecture.md), [Folder Structure](../17-Folder-Structure.md)
> **References:** Roadmap phases P0-P6

> **Framing.** "Sprint 1" here is the **first delivery increment** of MRMS, split
> into six phases (1A-1F). Each phase is an independently demoable slice and maps
> to the roadmap phases and to the finer 2-week sprints in
> [Sprint Planning](../19-Sprint-Planning.md). At a 2-week cadence, **1A is the
> literal first sprint**; 1B-1F follow as subsequent sprints. This ordering is the
> **recommended adjustment** (see §3) - it front-loads the highest-risk external
> dependency (Google) and delivers the visible room display early.

## 1. Phase Breakdown

### Sprint 1A - Project Foundation  (Roadmap P0 / Sprint 1)
Monorepo, containers, data stores, framework skeletons, CI.
- pnpm monorepo + workspaces + shared configs (eslint/tsconfig/tailwind/prettier)
- Docker images (api/worker/web) + Nginx (TLS, WS upgrade) + `docker-compose.{dev,prod}`
- PostgreSQL + Redis provisioning; env/secret loading (`docs/CONFIGURATION.md`)
- NestJS app skeleton (health/readiness, config module, logging + correlationId)
- React + Vite skeletons for Display and Admin (routing, providers, theme)
- Prisma schema (Doc 08) + initial migration + seed (sites BB/GP/Jembrana, facilities, settings, bootstrap admin)
- CI: enable `ci.yml` real steps (lint/typecheck/test/build) once configs land
- **Exit:** `docker compose up` boots the stack; health endpoints green; DB seeded; CI passes on a real PR.

### Sprint 1B - Authentication  (Roadmap P0 / Sprint 2)
- Google OAuth 2.0 login (auth-code); JWT issue + refresh rotation
- RBAC: role resolution (admin allowlist/domain) + guards
- Device-token auth scaffold (issue/verify, hashed) for kiosks
- `/me`, `/auth/*`; audit logging of auth events
- **Exit:** admin/employee login with correct roles; device token verified; auth events audited.

### Sprint 1C - Master Data  (Roadmap P1 / Sprint 3, data side)
- Entities: Site, Building, Room, Capacity, Facilities (+ maintenance toggle)
- CRUD APIs + validation + pagination/filtering per `docs/API-STRATEGY.md`
- Admin UI forms for master data (or seed-first + API, UI in 1F)
- **Exit:** rooms and their attributes are manageable and queryable via API.

### Sprint 1D - Google Calendar Integration  (Roadmap P1 / Sprint 3-4)
- GoogleModule ACL (read + create clients; encrypted token mgmt)
- Room **resource** mapping to Calendars (Doc 10)
- **Incremental sync** (syncToken) into the meeting cache; sync state + `/sync/*`
- **Webhook** (watch channel) register/renew with poll fallback
- **Exit:** a room's real Google schedule populates the cache; manual + scheduled + push sync work; failures surfaced.

### Sprint 1E - Display Client  (Roadmap P2 / Sprint 5-6)
- Socket.IO gateway + Redis adapter; emit `room.status`, `calendar.updated`
- Computed `RoomStatusService`; `/rooms/{id}/status` + `/schedule`
- Display SPA: RoomDisplayScreen (clock, status, current/next, today), realtime binding
- Kiosk mode (Chrome kiosk config, room id + device token), offline/reconnect handling
- **Exit:** a NUC in kiosk shows the live, auto-updating room status on a TV.

### Sprint 1F - Admin Portal  (Roadmap P6 / Sprint 10, core)
- Admin SPA shell (auth, layout, routing, RequireRole)
- Dashboard (KPIs, live room grid, sync widget)
- Room management UI (master data from 1C) + settings
- Device monitoring (heartbeat ingest + offline sweep) + Devices page
- **Exit:** admins manage configuration centrally and see device health live.

## 2. Phase -> Roadmap/Sprint/Milestone mapping

| Phase | Roadmap phase | Detailed sprint(s) | Program milestone | Suggested tag |
|-------|---------------|--------------------|-------------------|---------------|
| 1A Foundation | P0 | S1 | Sprint 1 | `v0.2.0` |
| 1B Authentication | P0 | S2 | Sprint 2 | `v0.3.0` |
| 1C Master Data | P1 | S3 | Sprint 3 | `v0.4.0` |
| 1D Calendar Integration | P1 | S3-S4 | Sprint 3-4 | `v0.4.0`-`v0.5.0` |
| 1E Display Client | P2 | S5-S6 | Sprint 5 | `v0.6.0` |
| 1F Admin Portal | P6 | S10 | Beta | `v0.11.0` |

## 3. Recommended Order & Adjustments

The requested 1A-1F order is sound with two **risk-driven** notes (consistent with
[Roadmap §7](../18-Development-Roadmap.md)):

1. **Do 1A -> 1B first (foundation + auth), then 1C + 1D together.** Master data
   (1C) and Calendar sync (1D) are tightly coupled (rooms map to Calendars), so
   run them in the same phase/sprint to avoid rework.
2. **Bring 1E (Display) before 1F (Admin).** The room display is the core user
   value and the highest-visibility demo; the Admin portal (1F) can start with a
   thin shell and grow. This matches the roadmap's "display early" principle.
3. **De-risk Google early:** secure Google Workspace API access, OAuth consent,
   and **Resource Calendar IDs** during/before 1B so 1D is not blocked. Provision
   at least one **NUC + TV** before 1E for real kiosk validation.

> Net recommendation: **1A -> 1B -> (1C+1D) -> 1E -> 1F.** Only 1A is committed as
> the immediate next sprint; the rest are sequenced but re-estimated at each
> Sprint Planning.

## 4. Entry Criteria (before starting 1A)

- This governance PR and the design-system PR merged (or explicitly deferred).
- Branch protection + CI required checks active (so 1A PRs are gated).
- PRD §15 open questions triaged (timing windows, sync trigger policy) - they
  affect 1D/1E acceptance.
- Google API credentials + Resource IDs request initiated.
