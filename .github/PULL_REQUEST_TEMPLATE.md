<!--
  MRMS Pull Request
  Title MUST follow Conventional Commits, e.g.:
    feat(booking): create Google Calendar event on booking
    fix(sync): handle 410 invalid sync token
  Keep the title under 70 characters. Target branch is usually `develop`.
-->

## Summary

<!-- One or two sentences: what does this PR do and why? -->

## Related Issue

<!-- Link the issue(s) this PR addresses. Use "Closes #123" to auto-close. -->
Closes #

## Type of Change

- [ ] feat - new feature
- [ ] fix - bug fix
- [ ] docs - documentation only
- [ ] refactor - code change that neither fixes a bug nor adds a feature
- [ ] perf - performance improvement
- [ ] test - adding or correcting tests
- [ ] build - build system or dependencies
- [ ] ci - CI configuration
- [ ] chore - other maintenance

## Changes

<!-- Bullet list of the concrete changes made. Organize by concern, not by file. -->

-
-

## Screenshots / Recordings (UI changes)

<!-- For UI changes, attach before/after screenshots or a short clip, in BOTH
     light and dark themes (and the TV tier for Display screens).
     For backend-only changes, write: "No UI changes." -->

No UI changes.

## Mandatory Quality Checklist

> Every item must be checked or explicitly marked N/A with a reason. This gate
> mirrors the Definition of Done and the UI Review Workflow.

- [ ] **Documentation updated** (docs-first: architecture/behavior changes reflected in `docs/`)
- [ ] **Build successful** (`pnpm run build`)
- [ ] **Lint passed** (`pnpm run lint`)
- [ ] **Type check passed** (`pnpm run typecheck`)
- [ ] **Tests passed** (unit/integration added or updated; `pnpm run test`)
- [ ] **Security review** (authz/authn, input validation, secrets, OWASP; see `docs/SECURITY.md`)
- [ ] **Accessibility review** (WCAG 2.1 AA; keyboard, contrast, focus - N/A for backend-only)
- [ ] **Performance review** (no N+1, no CLS, queries indexed, budgets respected)

## Breaking Changes

<!-- API, DB schema, event contract, or config contract break?
     If yes, describe impact + migration path. If no, write "None." -->

None.

## Database Migration

<!-- Does this PR add/modify a Prisma migration?
     If yes: describe the change, confirm it is reversible or has a documented
     forward-fix, and that the rollback path is verified. If no, write "None." -->

- [ ] No migration in this PR
- [ ] Migration included - reviewed, reversible/forward-fix documented (see `docs/DATABASE-STRATEGY.md`)

## Environment Variables

<!-- Any new/changed env vars or runtime config?
     If yes, list them and confirm `.env.example` + `docs/CONFIGURATION.md` are
     updated and no secret values are committed. If no, write "None." -->

- [ ] No env/config changes
- [ ] Env/config changed - `.env.example` and `docs/CONFIGURATION.md` updated; no secrets committed

## Rollback Consideration

<!-- How is this change rolled back if it fails in production?
     Note image-tag rollback, data implications, and feature-flag if any.
     See docs/process/release-management.md and docs/DISASTER-RECOVERY.md. -->

## General Checklist

- [ ] Title follows Conventional Commits
- [ ] Branch follows the naming convention (`feature/*`, `fix/*`, `bugfix/*`, `hotfix/*`, `release/*`)
- [ ] Targets the correct base branch (`develop` for features/fixes; `main` only via release/hotfix)
- [ ] No temporary code, commented-out code, or debug logs
- [ ] No hardcoded secrets or credentials
- [ ] No unused files
- [ ] Clean Architecture & SOLID respected
- [ ] Naming conventions and folder structure respected
- [ ] Proper validation, error handling, and logging in place
- [ ] CHANGELOG updated (for user-facing changes)
- [ ] Linked to the correct Milestone and Project board item

## Additional Notes

<!-- Anything reviewers should know: trade-offs, follow-ups, tech debt, risks. -->
