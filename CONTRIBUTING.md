# Contributing to MRMS

Thanks for contributing to the Meeting Room Management System. This guide
summarizes the workflow; the full standards live in
[`docs/standards/`](./docs/standards/README.md).

## 1. Prerequisites

- Node `>= 20.11` (see `.nvmrc`)
- pnpm `>= 9` (`corepack enable`)
- Docker + Docker Compose (for local infrastructure)
- Access to the repository and, for integration work, Google Workspace test
  credentials.

## 2. Getting Started

```bash
git clone https://github.com/satpan-mp/mrms-project.git
cd mrms-project
# create your local env file and install deps
./scripts/setup.sh        # or: pwsh ./scripts/setup.ps1 on Windows
```

> During the initialization phase there is no application code yet; scripts and
> installs are scaffolding.

## 3. Workflow (Git Flow + Conventional Commits)

1. Pick or open an issue (use the issue templates).
2. Branch from `develop`:
   `feature/<issue-id>-<summary>` or `bugfix/<issue-id>-<summary>`
   (see [branch convention](./docs/standards/branch-convention.md)).
3. Make focused changes - **one task = one meaningful commit** where possible.
4. Use [Conventional Commits](./docs/standards/commit-convention.md)
   (`feat:`, `fix:`, `docs:`, ...).
5. Ensure it builds and passes **lint, typecheck, and tests**.
6. Update documentation when behavior or architecture changes (docs-first).
7. Open a PR into `develop` using the PR template; link the issue.
8. Address review feedback; squash-merge once CI is green and approved.

Releases are cut via `release/*` and tagged on `main` (see
[git convention](./docs/standards/git-convention.md) and `docs/MILESTONES.md`).

## 4. Quality Bar (before every commit)

- Clean Architecture + SOLID respected; correct folder placement.
- Naming conventions followed; no duplicated code.
- Proper validation, error handling, and logging.
- Security best practices; **no hardcoded secrets**.
- No temporary code, commented-out code, or debug logs.
- Tests added/updated where applicable.

## 5. Reporting Issues

Use the appropriate issue template (Bug, Feature, Task, Improvement, Question).
Report security vulnerabilities privately via a GitHub security advisory - not a
public issue.

## 6. Progress Reporting

This project follows a mandatory per-task/milestone development report and
approval-gate policy. Completed milestones are committed, pushed, reported, and
then paused for approval before the next milestone.
