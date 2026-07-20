# Branch Protection Recommendations

> **Status:** Recommendation only. These settings are **not** applied
> automatically. A repository administrator must configure them in GitHub under
> **Settings -> Branches -> Branch protection rules** (or **Rulesets**).

This document defines the recommended GitHub branch protection for the MRMS
repository, aligned with the Git Flow model (see `docs/standards/git-convention.md`)
and the mandatory Development Workflow & Reporting Policy.

---

## 1. Protected Branches

| Branch | Role | Protection level |
|--------|------|------------------|
| `main` | Production-ready, release-tagged | Strictest |
| `develop` | Integration branch for ongoing work | Strict |
| `release/*` | Release stabilization | Strict (while active) |

Supporting branches (`feature/*`, `bugfix/*`, `hotfix/*`) are short-lived and not
directly protected, but they can only reach `main`/`develop` through a Pull
Request that satisfies the rules below.

---

## 2. Recommended Rules for `main`

- [x] **Require a pull request before merging** (no direct pushes to `main`).
  - [x] Require **at least 2 approving reviews**.
  - [x] **Dismiss stale approvals** when new commits are pushed.
  - [x] Require review from **Code Owners** (see `.github/CODEOWNERS` once added).
  - [x] Require **conversation resolution** before merging.
- [x] **Require status checks to pass before merging** and require branches to be
      **up to date** before merging. Required checks:
  - `CI / lint`
  - `CI / typecheck`
  - `CI / test`
  - `CI / build`
  - `CI / docker-build`
- [x] **Require linear history** (squash or rebase merges only; no merge commits).
- [x] **Require signed commits** *(optional but recommended — see §5)*.
- [x] **Include administrators** (rules apply to admins too).
- [x] **Do not allow force pushes.**
- [x] **Do not allow deletions.**
- [x] **Require deployments to succeed** *(enable once a staging environment exists)*.

---

## 3. Recommended Rules for `develop`

- [x] **Require a pull request before merging** (no direct pushes).
  - [x] Require **at least 1 approving review**.
  - [x] Dismiss stale approvals on new commits.
  - [x] Require conversation resolution before merging.
- [x] **Require status checks to pass** (same checks as `main`; up-to-date branch).
- [x] **Require linear history.**
- [x] **Do not allow force pushes / deletions.**
- [ ] Signed commits optional (recommended for consistency with `main`).

---

## 4. Recommended Rules for `release/*`

- [x] Require a pull request with **at least 1 approving review**.
- [x] Require the full status-check suite.
- [x] Only `fix:`, `docs:`, `chore:`, `test:` commits (no new features) while
      stabilizing.
- [x] No force pushes / deletions.

---

## 5. Signed Commits (Optional)

Signed commits provide cryptographic authorship verification.

- Contributors configure commit signing (GPG, SSH, or S/MIME) and add their
  public key to their GitHub account.
- If enabled, turn on **"Require signed commits"** for `main` (and ideally
  `develop`).
- Recommended for MRMS given the on-premise, enterprise, audit-focused context,
  but marked optional to avoid blocking contributors during initial setup.

Example (SSH signing):

```bash
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
git config commit.gpgsign true
```

> Note: The above are per-developer local settings, applied by each contributor
> on their own machine — not committed to the repository.

---

## 6. General Repository Settings (Recommended)

- **Default branch:** `develop` (day-to-day PR target) or `main` — team decision.
  MRMS recommendation: keep `main` as default for visibility; target PRs at
  `develop`.
- **Automatically delete head branches** after merge (keeps branch list clean).
- **Allow squash merging**; disable merge commits to preserve linear history.
- **Restrict who can push to matching branches** to the release/maintainer team.
- Enable **secret scanning** and **push protection** (blocks committing secrets).
- Enable **Dependabot** alerts and security updates.

---

## 7. Status Checks Reference

The required checks map to the CI workflow in
`.github/workflows/ci.yml`. Job names must match exactly what GitHub sees. During
early setup the checks are placeholders that succeed; they become enforcing as
implementation lands (Sprint 1+).

| Required check | Source job |
|----------------|-----------|
| `CI / lint` | `ci.yml` -> `lint` |
| `CI / typecheck` | `ci.yml` -> `typecheck` |
| `CI / test` | `ci.yml` -> `test` |
| `CI / build` | `ci.yml` -> `build` |
| `CI / docker-build` | `docker.yml` -> `docker-build` |

---

## 8. Enforcement Checklist for the Admin

When ready, a repository admin should:

1. Create the `develop` branch (done at initial push) and push `main`.
2. Add protection rules for `main` per §2.
3. Add protection rules for `develop` per §3.
4. Add a ruleset for `release/*` per §4.
5. Add `.github/CODEOWNERS` and enable "Require review from Code Owners".
6. Enable secret scanning, push protection, and Dependabot.
7. (Optional) Enable required signed commits.

*This file is documentation only. No automated configuration is performed by the
repository tooling.*
