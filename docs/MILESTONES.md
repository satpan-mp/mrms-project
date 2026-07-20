# GitHub Milestones

> **Status:** Recommendation. Milestones are not created automatically. An admin
> can create them under **Issues -> Milestones**, or via the GitHub CLI (examples
> below). Milestones map 1:1 to the sprints in `docs/19-Sprint-Planning.md` and
> the phases in `docs/18-Development-Roadmap.md`.

---

## 1. Milestone List

| Milestone | Roadmap Phase | Theme | Key deliverable (Definition of Done) |
|-----------|---------------|-------|--------------------------------------|
| **Sprint 1 - Foundation** | P0 | Monorepo, infra, Prisma, seed | Stack boots via compose; health green; DB seeded; CI runs |
| **Sprint 2 - Auth & CI** | P0 | Google OAuth, JWT, RBAC, device token, CI gates | Login with correct roles; device token verified; audit logged |
| **Sprint 3 - Google Sync + Rooms** | P1 | Calendar ACL, incremental sync, Sites/Rooms/Facilities CRUD | Room's Google events populate cache; sync works & failures surfaced |
| **Sprint 4 - Status + Schedule API** | P1 | RoomStatusService, schedule/status endpoints, watch channels | Correct computed status; schedule endpoint returns current/next/today |
| **Sprint 5 - Realtime + Display** | P2 | Socket.IO gateway, Display SPA shell | NUC kiosk shows live, auto-updating room display |
| **Sprint 6 - Display Polish + Kiosk** | P2 | Offline/reconnect, theming, kiosk config | Resilient, TV-readable display; recovers from disconnects |
| **Sprint 7 - Booking** | P3 | Create-only booking + BookingModal | Booking creates Google event; display reflects post-sync; no edit/delete |
| **Sprint 8 - Check-in + No-show** | P4 | Check-in endpoint, no-show sweep | Check-in -> Occupied; no-show auto-releases; Calendar untouched |
| **Sprint 9 - Conferencing** | P5 | Meet/Zoom launch + auto return | Join works on NUC; auto-returns to display at meeting end |
| **Sprint 10 - Admin + Monitoring** | P6 | Admin shell, dashboard, device monitoring | Central config; device health visible and live |
| **Sprint 11 - Analytics + Announcements** | P7 | Rollups, dashboards, announcements | Utilization/occupancy/trends shown; announcements reach displays |
| **Sprint 12 - Hardening + Rollout** | P8 | Security, load, resilience, UAT | NFRs verified; production release; phased rollout BB -> GP -> Jembrana |

---

## 2. Milestone -> Release Mapping

Per the Progress Policy, **every sprint ends with a tagged release**. Suggested
version tags (SemVer, pre-1.0 during development):

| Milestone | Suggested tag | Notes |
|-----------|---------------|-------|
| (repo init) | `v0.1.0` | Foundation scaffold (this initialization) |
| Sprint 1 | `v0.2.0` | Foundation deployable skeleton |
| Sprint 2 | `v0.3.0` | Auth + CI |
| Sprint 3 | `v0.4.0` | Calendar sync + Rooms |
| Sprint 4 | `v0.5.0` | Status + schedule API |
| Sprint 5 | `v0.6.0` | Live display (core value) |
| Sprint 6 | `v0.7.0` | Display hardening |
| Sprint 7 | `v0.8.0` | Booking |
| Sprint 8 | `v0.9.0` | Check-in lifecycle |
| Sprint 9 | `v0.10.0` | Conferencing |
| Sprint 10 | `v0.11.0` | Admin + monitoring |
| Sprint 11 | `v0.12.0` | Analytics + announcements |
| Sprint 12 | `v1.0.0` | Production release |

> Version numbers are indicative; adjust if scope shifts between sprints.

---

## 3. Creating Milestones (optional, via GitHub CLI)

```bash
# Requires: gh auth login (admin), and a due date per sprint.
gh api repos/satpan-mp/mrms-project/milestones -f title="Sprint 1 - Foundation" \
  -f state=open -f description="P0: monorepo, infra, Prisma, seed"
gh api repos/satpan-mp/mrms-project/milestones -f title="Sprint 2 - Auth & CI" \
  -f state=open -f description="P0: Google OAuth, JWT, RBAC, CI gates"
# ... repeat for Sprint 3 .. Sprint 12
```

Assign each issue/PR to its milestone so progress is tracked per sprint. The
milestone titles above exactly match the sprint dropdown in the Task issue
template (`.github/ISSUE_TEMPLATE/task.yml`).
