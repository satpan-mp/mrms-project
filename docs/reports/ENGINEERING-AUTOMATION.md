# Engineering Automation

- **Date:** 2026-07-20
- **Scope:** verify that quality is enforced by automation, not manual review. Some automation lives on `develop`; some lands via open PR #12 (guardrails). Each item's location is stated.

## 1. Automation inventory

| Automation | Present | Location | Status |
|---|---|---|---|
| CODEOWNERS | ✅ | `.github/CODEOWNERS` (PR #12) | Verified (in PR) |
| Dependabot | ✅ | `.github/dependabot.yml` (PR #12) | Verified (in PR) |
| CodeQL | ✅ active | `.github/workflows/codeql.yml` (PR #12) | Verified (workflow registered, 0 alerts) |
| Dependency Review | ✅ active | `.github/workflows/dependency-review.yml` (PR #12) | Verified |
| Repository health (madge+knip) | ✅ | CI `repo-health` job (PR #12), advisory | Verified |
| PR template | ✅ | `.github/pull_request_template.md` w/ Impact Assessment (PR #12) | Verified (in PR) |
| Issue templates | ✅ | `.github/ISSUE_TEMPLATE/{bug,feature,improvement,question,task}.yml` | Verified |
| ADR reminder | ✅ | `.kiro/hooks/adr-on-architectural-change.json` | Verified (local hook) |
| Screenshot automation | ✅ | `.kiro/hooks/ui-screenshots-on-frontend-change.json` + `tools/screenshots/capture.mjs` | Partially Verified (needs browsers, TD-016) |
| Technical-debt reminders | ✅ | debt registry in docs + PR-template debt checkbox | Verified (process) |
| CI quality gates | ✅ | `.github/workflows/ci.yml` (Lint/Typecheck/Test/Build on `develop`) | Verified |
| Commit hygiene | ✅ | `commitlint` + `husky` + `lint-staged` | Verified |

## 2. What is enforced automatically today (on `develop`)

- **CI** runs Lint, Typecheck, Test (unit + e2e + coverage floor), Build on every push/PR to `main`/`develop`.
- **Branch protection** makes those 4 checks + signed commits + 1 review **mandatory** (see GITHUB-ENTERPRISE-VALIDATION).
- **commitlint/husky/lint-staged** enforce Conventional Commits + pre-commit formatting locally.

## 3. What activates when PR #12 merges

`Format` job (prettier check), Prisma `validate` step, advisory `repo-health` (madge/knip), CODEOWNERS-based review routing, Dependabot update PRs, CodeQL + Dependency Review as PR gates. These are pushed and registered but not yet enforced on `develop`.

## 4. Gaps / manual actions

1. Merge PR #12 to move guardrails onto `develop` (human, signed + reviewed).
2. After merge, add `Format` (and optionally CodeQL/Dependency Review) to required status checks (admin).
3. Enable Dependabot **security** updates (currently disabled).
4. Screenshot automation requires a browser-capable host (TD-016).

## 5. Verdict

A **complete automation suite exists**; the enforcement surface on `develop` is CI + branch protection today, expanding to the full guardrail set once PR #12 is merged. Remaining steps are human/admin toggles. Non-blocking for Sprint 1B.
