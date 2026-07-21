# Project Board Workflow

> **Purpose:** Define the MRMS GitHub Project board columns and automation rules.
> **Scope:** Delivery tracking for issues and pull requests across all sprints.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [GitHub Governance](./GITHUB-GOVERNANCE.md), [Milestones](./MILESTONES.md), [Definition of Ready](../process/definition-of-ready.md), [Definition of Done](../process/definition-of-done.md)
> **References:** GitHub Docs - Projects (Projects v2), Built-in automations (workflows)

Use a **Projects (v2)** board named **"MRMS Delivery"** at the user/org level,
linked to `satpan-mp/mrms-project`.

## 1. Columns (Status field)

A single-select **Status** field drives the board (Board layout):

| Column | Meaning | Entry criteria |
|--------|---------|----------------|
| **Backlog** | Captured, not yet refined | Issue created/triaged (`needs-triage` cleared) |
| **Ready** | Refined and actionable | Meets [Definition of Ready](../process/definition-of-ready.md); estimated; milestone + labels set |
| **In Progress** | Actively being worked | Assignee set; a `feature/*` branch exists |
| **Code Review** | PR open, under review | PR linked; CI running/green; reviewers requested |
| **Testing** | Merged to `develop`, under QA/verification | Deployed to staging; acceptance checks running |
| **Done** | Complete | Meets [Definition of Done](../process/definition-of-done.md); acceptance met |

## 2. Recommended fields

- **Status** (single select) - the columns above.
- **Priority** (single select) - High / Medium / Low (mirrors priority labels).
- **Estimate** (number) - story points (Fibonacci).
- **Sprint / Iteration** - GitHub **Iteration** field (2-week cadence) or milestone.
- **Area** (single select) - backend / frontend / database / infra / design / docs.

## 3. Automation Rules (Projects v2 built-in workflows)

Enable under **Project -> ... -> Workflows**:

| Trigger | Action |
|---------|--------|
| Item **added** to project | Set **Status = Backlog** |
| Issue/PR **reopened** | Set **Status = In Progress** |
| Pull request **opened** (or marked ready for review) | Set **Status = Code Review** |
| PR **merged** | Set **Status = Testing** |
| Issue **closed** / PR merged issue auto-closed | Set **Status = Done** |
| Item **assigned** | Set **Status = In Progress** (if still Backlog/Ready) |
| **Auto-add**: filter `is:issue,pr repo:satpan-mp/mrms-project` | Auto-add new items to the board |

> "Ready" is a **manual** promotion after refinement (there is no reliable trigger
> for "refined"); the team moves items Backlog -> Ready during backlog refinement.
> "Testing -> Done" is manual after staging verification/acceptance.

## 4. Linking work

- Every issue gets: a **type label**, an **area label**, a **priority**, and a
  **Milestone** ([MILESTONES](./MILESTONES.md)).
- PRs use **"Closes #NNN"** so merging moves the linked issue to Done.
- The PR template reminds contributors to link the milestone and board item.

## 5. Setup (admin)

- **UI:** github.com/satpan-mp -> Projects -> New project -> Board -> add the
  Status options above -> configure Workflows (§3) -> set Auto-add.
- **CLI (optional):**

```bash
# Requires: gh auth login (admin) and the `project` scope.
gh project create --owner satpan-mp --title "MRMS Delivery"
# Then add the Status single-select options and link the repository in the UI.
```
