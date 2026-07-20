# Recommended GitHub Labels

> **Status:** Recommendation. Labels are not created automatically. An admin can
> create them manually, or apply the machine-readable list in
> `.github/labels.yml` using a label-sync GitHub Action (e.g.,
> `crazy-max/ghaction-github-labeler`).

Labels are grouped by purpose: **type**, **area**, **priority**, and **status**.
A consistent color scheme aids scanning on the issues/PR boards.

---

## 1. Type

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `feature` | `#0e8a16` | New feature or capability |
| `enhancement` | `#a2eeef` | Improvement to existing functionality |
| `documentation` | `#0075ca` | Documentation changes |
| `task` | `#c5def5` | Concrete engineering task |
| `question` | `#d876e3` | Further information is requested |
| `refactor` | `#fbca04` | Code change without behavior change |
| `test` | `#bfd4f2` | Tests added or corrected |
| `chore` | `#ededed` | Maintenance / tooling |

## 2. Area (component)

| Label | Color | Description |
|-------|-------|-------------|
| `frontend` | `#1d76db` | Display and/or Admin SPA |
| `backend` | `#5319e7` | NestJS API / workers |
| `database` | `#006b75` | PostgreSQL / Prisma schema & migrations |
| `google-calendar` | `#fbca04` | Calendar sync / booking integration |
| `google-meet` | `#f9d0c4` | Meet / conferencing integration |
| `display` | `#bfdadc` | Kiosk display client |
| `admin` | `#c2e0c6` | Admin panel |
| `monitoring` | `#e99695` | Device monitoring / heartbeat |
| `analytics` | `#d4c5f9` | Analytics & reporting |
| `security` | `#b60205` | Security-related |
| `realtime` | `#bfd4f2` | WebSocket / realtime |
| `infrastructure` | `#333333` | Docker / Nginx / CI-CD / deployment |

## 3. Priority

| Label | Color | Description |
|-------|-------|-------------|
| `high priority` | `#b60205` | Urgent; address first |
| `medium priority` | `#fbca04` | Normal priority |
| `low priority` | `#0e8a16` | Can wait |

## 4. Status / Workflow

| Label | Color | Description |
|-------|-------|-------------|
| `needs-triage` | `#ededed` | Awaiting initial review/triage |
| `blocked` | `#000000` | Blocked by another issue/dependency |
| `in progress` | `#fef2c0` | Actively being worked on |
| `needs review` | `#fbca04` | Ready for review |
| `wontfix` | `#ffffff` | This will not be worked on |
| `duplicate` | `#cfd3d7` | Duplicate of another issue |

## 5. Community

| Label | Color | Description |
|-------|-------|-------------|
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention is needed |

---

See `.github/labels.yml` for the syncable definition.
