# GitHub Milestones (Program View)

> **Purpose:** Prepare the program-level GitHub Milestones requested for Sprint 1 readiness and map them to the detailed sprint/phase plan.
> **Scope:** Milestone creation and mapping for `satpan-mp/mrms-project`.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Sprint-level Milestones](../MILESTONES.md), [Development Roadmap](../18-Development-Roadmap.md), [Sprint Planning](../19-Sprint-Planning.md), [Release Strategy](./RELEASE-STRATEGY.md)
> **References:** GitHub Docs - About milestones

> **Two milestone views, one plan.** The repository already has a **sprint-level**
> milestone list in [`docs/MILESTONES.md`](../MILESTONES.md) (Sprint 1..12 mapped
> to phases P0..P8). This file adds the **program-level** milestones requested for
> release governance (Sprint 1-5, MVP, Beta, Release Candidate, Version 1.0) and
> maps them to that plan. Teams may use either or both; the program milestones are
> recommended for GitHub tracking, iterations for sprint execution.

## 1. Program Milestones to create

| # | Milestone | Maps to (roadmap phases / sprints) | Definition (exit) | Target tag |
|---|-----------|-------------------------------------|-------------------|------------|
| 1 | **Sprint 1** | P0 - Foundation (detailed S1) | Monorepo, Docker, PostgreSQL, Redis, NestJS, React, Vite, Prisma, CI all boot; health green; DB seeded | `v0.2.0` |
| 2 | **Sprint 2** | P0 - Auth (detailed S2) | Google OAuth + JWT + RBAC; device-token scaffold; CI gates enforced | `v0.3.0` |
| 3 | **Sprint 3** | P1 - Calendar + Master Data (detailed S3) | Sites/Buildings/Rooms/Capacity/Facilities CRUD; Google Calendar incremental sync + resources | `v0.4.0` |
| 4 | **Sprint 4** | P1 - Status + Schedule API (detailed S4) | Computed room status + schedule endpoints; watch-channel/webhook + poll fallback | `v0.5.0` |
| 5 | **Sprint 5** | P2 - Realtime + Display (detailed S5) | Socket.IO realtime; Display SPA shows live room status on the NUC/TV | `v0.6.0` |
| 6 | **MVP** | P2-P4 (S5-S8) | Core value usable end-to-end: live display + in-app booking + check-in/no-show | `v0.9.0` |
| 7 | **Beta** | P5-P7 (S9-S11) | Conferencing launch, Admin portal, monitoring, analytics, announcements; pilot-ready | `v0.12.0` |
| 8 | **Release Candidate** | P8 (S12, stabilization) | Hardening complete; NFRs verified on staging; `release/1.0.0` cut; RC checks pass | `v1.0.0-rc.1` |
| 9 | **Version 1.0** | P8 (S12, production) | Production on-prem release; phased rollout BB -> GP -> Jembrana | `v1.0.0` |

> Sprint 1-5 are the first five 2-week sprints. MVP/Beta/RC/v1.0 are release gates
> that span multiple sprints. The finer Sprint 6-12 milestones remain available in
> [`docs/MILESTONES.md`](../MILESTONES.md) for per-sprint tracking.

## 2. Sprint 1 phase mapping

The program "Sprint 1" milestone corresponds to **Sprint 1A** (Foundation) in
[SPRINT-1-PLAN](./SPRINT-1-PLAN.md). Phases 1B-1F of that plan map to program
milestones Sprint 2-5 + MVP, per the table above. This keeps a single coherent
delivery order.

## 3. Create milestones (admin)

Milestones are **not** created automatically from this environment. An admin runs:

```bash
# Requires: gh auth login (admin). Set due dates per your 2-week cadence.
for m in \
  "Sprint 1|P0 Foundation: monorepo, Docker, PostgreSQL, Redis, NestJS, React, Vite, Prisma, CI" \
  "Sprint 2|P0 Auth: Google OAuth, JWT, RBAC" \
  "Sprint 3|P1 Master data + Google Calendar sync" \
  "Sprint 4|P1 Room status + schedule API + webhook" \
  "Sprint 5|P2 Realtime + Display client (Smart TV/kiosk)" \
  "MVP|Live display + booking + check-in end-to-end" \
  "Beta|Conferencing + Admin + monitoring + analytics" \
  "Release Candidate|Hardening complete; NFRs verified; release/1.0.0" \
  "Version 1.0|Production release; phased rollout"; do
  title="${m%%|*}"; desc="${m##*|}"
  gh api repos/satpan-mp/mrms-project/milestones -f title="$title" -f state=open -f description="$desc"
done
```

Or **UI:** *Issues -> Milestones -> New milestone* for each row in §1.

## 4. Usage

- Assign every issue/PR to exactly one milestone.
- Close a milestone when its exit definition is met and the target tag is cut
  (see [RELEASE-STRATEGY](./RELEASE-STRATEGY.md)).
