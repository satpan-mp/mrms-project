# GitHub Labels

> **Status:** The machine-readable source of truth is `.github/labels.yml`.
> Labels can be created automatically via the label-sync workflow
> (`.github/workflows/labeler.yml`, manual `workflow_dispatch`), or an admin can
> create them manually. This file is the human-readable overview.

Labels are grouped by purpose: **type**, **area**, **priority**, and **status**
(plus a small **community** group). A consistent color scheme aids scanning on
the issues/PR boards. The set covers the standard MRMS label taxonomy.

---

## 1. Type

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `feature` | `#0e8a16` | New feature or capability |
| `enhancement` | `#a2eeef` | Improvement to existing functionality |
| `documentation` | `#0075ca` | Documentation changes |
| `architecture` | `#3f51b5` | Architecture / design-level change (ADR/RFC) |
| `task` | `#c5def5` | Concrete engineering task |
| `research` | `#6f42c1` | Research / spike / investigation |
| `question` | `#d876e3` | Further information is requested |
| `refactor` | `#fbca04` | Code change without behavior change |
| `testing` | `#0b8043` | Tests / test tooling / coverage |
| `technical-debt` | `#8b6914` | Known shortcut to be repaid |
| `chore` | `#ededed` | Maintenance / tooling |

## 2. Area (component)

| Label | Color | Description |
|-------|-------|-------------|
| `frontend` | `#1d76db` | Display and/or Admin SPA |
| `backend` | `#5319e7` | NestJS API / workers |
| `database` | `#006b75` | PostgreSQL / Prisma schema & migrations |
| `api` | `#0366d6` | REST / WebSocket API contract |
| `ui/ux` | `#cc99ff` | Design system, components, interaction, accessibility |
| `google-calendar` | `#fbca04` | Calendar sync / booking integration |
| `google-meet` | `#f9d0c4` | Meet / conferencing integration |
| `display` | `#bfdadc` | Kiosk display client |
| `admin` | `#c2e0c6` | Admin panel |
| `monitoring` | `#e99695` | Device monitoring / heartbeat |
| `analytics` | `#d4c5f9` | Analytics & reporting |
| `realtime` | `#bfd4f2` | WebSocket / realtime |
| `security` | `#b60205` | Security-related |
| `performance` | `#e36209` | Performance / latency / load |
| `infrastructure` | `#333333` | Docker / Nginx / CI-CD / deployment |

## 3. Priority

| Label | Color | Description |
|-------|-------|-------------|
| `high-priority` | `#b60205` | Urgent; address first |
| `medium-priority` | `#fbca04` | Normal priority |
| `low-priority` | `#0e8a16` | Can wait |

## 4. Status / Workflow

| Label | Color | Description |
|-------|-------|-------------|
| `needs-triage` | `#ededed` | Awaiting initial review/triage |
| `blocked` | `#000000` | Blocked by another issue/dependency |
| `in-progress` | `#fef2c0` | Actively being worked on |
| `needs-review` | `#fbca04` | Ready for review |
| `wontfix` | `#ffffff` | This will not be worked on |
| `duplicate` | `#cfd3d7` | Duplicate of another issue |

## 5. Community

| Label | Color | Description |
|-------|-------|-------------|
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention is needed |

---

## Required minimum set (task baseline)

The following labels are required at minimum; all are present above:
`bug`, `feature`, `enhancement`, `documentation`, `architecture`, `backend`,
`frontend`, `database`, `api`, `ui/ux`, `security`, `testing`, `performance`,
`infrastructure`, `technical-debt`, `blocked`, `high-priority`, `low-priority`,
`research`.

## Applying labels

- **Automated (recommended):** run the **Label Sync** workflow
  (`.github/workflows/labeler.yml`) via *Actions -> Label Sync -> Run workflow*.
  It syncs the repo labels to `.github/labels.yml`.
- **Manual:** *Issues -> Labels -> New label* and enter name/color/description.
