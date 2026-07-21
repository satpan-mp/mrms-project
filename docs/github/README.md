# GitHub Governance

> **Purpose:** Index for MRMS GitHub repository governance, automation, and Sprint 1 readiness.
> **Scope:** Repository settings, branch protection, labels, milestones, project board, issue/PR templates, CI/CD, security automation, release strategy, and Sprint 1 planning.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Docs index](../README.md), [Release Management](../process/release-management.md), [Git Convention](../standards/git-convention.md), [Development Roadmap](../18-Development-Roadmap.md), [Sprint Planning](../19-Sprint-Planning.md)
> **References:** GitHub Docs - Repositories, Branch protection, Rulesets, Actions, Dependabot, Code scanning

This pack prepares the repository for long-term enterprise development. Where the
current environment can modify GitHub settings it does so; otherwise it provides
**exact manual steps** (see limitations in [GITHUB-GOVERNANCE](./GITHUB-GOVERNANCE.md) §1).

## Documents

| Document | Purpose |
|----------|---------|
| [GITHUB-GOVERNANCE](./GITHUB-GOVERNANCE.md) | Repository settings, branch protection, security automation - with step-by-step manual instructions and limitations |
| [PROJECT-BOARD](./PROJECT-BOARD.md) | Project workflow columns and automation rules |
| [MILESTONES](./MILESTONES.md) | Program milestones (Sprint 1-5, MVP, Beta, RC, v1.0) + mapping to the sprint plan |
| [RELEASE-STRATEGY](./RELEASE-STRATEGY.md) | Release workflow diagram + Semantic Versioning (links to Release Management) |
| [SPRINT-1-PLAN](./SPRINT-1-PLAN.md) | Sprint 1 split into implementation phases (1A-1F) with sequencing |
| [SPRINT-1-READINESS](./SPRINT-1-READINESS.md) | Readiness review across all dimensions + readiness score |

## Configuration living in `.github/`

| Asset | File |
|-------|------|
| CI (lint/typecheck/test/build) | `.github/workflows/ci.yml` |
| Docker image build validation | `.github/workflows/docker.yml` |
| CodeQL code scanning | `.github/workflows/codeql.yml` |
| Dependency review | `.github/workflows/dependency-review.yml` |
| Label sync | `.github/workflows/labeler.yml` |
| Dependabot | `.github/dependabot.yml` |
| Code owners | `.github/CODEOWNERS` |
| Pull request template | `.github/PULL_REQUEST_TEMPLATE.md` |
| Issue templates | `.github/ISSUE_TEMPLATE/*.yml` |
| Labels (source of truth) | `.github/labels.yml` (+ `LABELS.md`) |
| Branch protection recommendation | `.github/BRANCH_PROTECTION.md` |
