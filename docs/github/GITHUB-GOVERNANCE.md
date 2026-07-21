# GitHub Governance & Configuration

> **Purpose:** Define the target GitHub repository configuration and give exact step-by-step instructions to apply it (branch protection, general settings, security automation).
> **Scope:** `satpan-mp/mrms-project` on GitHub.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Branch Protection](../../.github/BRANCH_PROTECTION.md), [Project Board](./PROJECT-BOARD.md), [Milestones](./MILESTONES.md), [Release Strategy](./RELEASE-STRATEGY.md), [Security Guide](../SECURITY.md)
> **References:** GitHub Docs - Managing a branch protection rule, Rulesets, Code security & analysis, Dependabot, Code scanning (CodeQL)

## 1. Limitations (what could and could not be automated)

This environment has a local Git working copy with an authenticated `origin`
(HTTPS push works). It does **not** have:

- The **GitHub CLI (`gh`)** installed, and
- Access to the GitHub **REST/GraphQL admin API** with an admin token.

Therefore **repository-level settings cannot be changed from here**. Everything in
this document is prepared as either (a) versioned files in `.github/` (applied by
GitHub automatically once merged), or (b) **manual steps** for a repository admin.
The command examples use `gh`/`git` and can be run by an admin who has `gh auth
login` completed.

| Capability | Status from this environment | How it is delivered |
|------------|------------------------------|---------------------|
| CI/CD, CodeQL, Dependabot, templates, labels file, CODEOWNERS | **Automated** (committed to `.github/`) | Active once merged to `develop`/`main` |
| Branch protection / rulesets | **Manual** (admin UI or `gh`) | §3 steps |
| Enable secret scanning / push protection / Dependabot alerts / CodeQL default | **Manual** (admin UI) | §4 steps |
| Create labels | **Automated** (Label Sync workflow) or manual | §5 |
| Create milestones | **Manual** or `gh` | [MILESTONES](./MILESTONES.md) |
| Create Project board | **Manual** or `gh project` | [PROJECT-BOARD](./PROJECT-BOARD.md) |
| Create GitHub Releases | **Manual** or `gh release` | [RELEASE-STRATEGY](./RELEASE-STRATEGY.md) |

## 2. General Repository Settings (recommended)

Apply under **Settings -> General** and **Settings -> Branches**:

- **Default branch:** keep `main` (production-visible). Day-to-day PRs target `develop`.
- **Pull Requests:**
  - Allow **squash merge** (default); enable "Default to PR title for squash".
  - Disable "Allow merge commits" to preserve linear history.
  - Enable **"Automatically delete head branches"** after merge.
  - Enable **"Always suggest updating pull request branches"**.
- **Features:** enable Issues, Projects, Discussions (optional), Wiki (optional -
  the repo already ships a `docs/wiki/`).
- **Merge/require:** enable "Require contributors to sign off"? Optional. Enable
  "Require linear history" via branch protection (see §3).

## 3. Branch Protection (manual)

The full recommendation lives in [`.github/BRANCH_PROTECTION.md`](../../.github/BRANCH_PROTECTION.md).
Apply as **Rulesets** (preferred) or classic **Branch protection rules**.

### 3.1 `main` (strictest)

**Settings -> Rules -> Rulesets -> New branch ruleset** (target: `main`), enable:

- Require a pull request before merging
  - Required approvals: **2**
  - Dismiss stale approvals on new commits: **on**
  - Require review from **Code Owners**: **on**
  - Require conversation resolution: **on**
- Require status checks to pass (require branch up to date): add
  `CI / Lint`, `CI / Typecheck`, `CI / Test`, `CI / Build`,
  `Docker / Docker Build`, `CodeQL / Analyze`
  *(add each after it has run once so GitHub can resolve the exact name)*
- Require linear history: **on**
- Block force pushes: **on**
- Restrict deletions: **on**
- Include administrators / "Do not allow bypass": **on**
- (Optional) Require signed commits: **on**

### 3.2 `develop` (strict)

Target `develop`, enable:

- Require a pull request before merging - **1** approval, dismiss stale, require
  conversation resolution
- Require status checks (same list as `main`; branch up to date)
- Require linear history
- Block force pushes; restrict deletions

### 3.3 `release/*` (while active)

Target `release/*`, enable: PR + 1 approval, full status checks, block force
push/deletions. Only `fix/docs/chore/test` commits during stabilization.

### 3.4 Apply via `gh` (admin alternative)

```bash
# Example: protect `main` (classic API). Requires: gh auth login as admin.
gh api -X PUT repos/satpan-mp/mrms-project/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_pull_request_reviews[required_approving_review_count]=2" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[require_code_owner_reviews]=true" \
  -f "enforce_admins=true" \
  -f "required_linear_history=true" \
  -f "allow_force_pushes=false" \
  -f "allow_deletions=false" \
  -F "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=CI / Lint" \
  -f "required_status_checks[contexts][]=CI / Typecheck" \
  -f "required_status_checks[contexts][]=CI / Test" \
  -f "required_status_checks[contexts][]=CI / Build" \
  -f "restrictions=null"
```

> Rulesets (newer) are configured via `gh api repos/.../rulesets` or the UI; the
> UI is recommended for first-time setup.

## 4. Security Automation (manual enablement)

Under **Settings -> Code security and analysis**, enable:

| Feature | Action | Notes |
|---------|--------|-------|
| **Dependabot alerts** | Enable | Uses the dependency graph |
| **Dependabot security updates** | Enable | Auto-PRs for vulnerable deps |
| **Dependabot version updates** | Already configured via `.github/dependabot.yml` | Active on merge |
| **Secret scanning** | Enable | Detects committed secrets |
| **Secret scanning push protection** | Enable | Blocks pushes containing secrets |
| **Code scanning (CodeQL)** | Provided via `.github/workflows/codeql.yml` | For private repos, code scanning requires **GitHub Advanced Security** |
| **Dependency graph** | Enable | Required by Dependabot & `dependency-review.yml` |
| **Private vulnerability reporting** | Enable | Matches `ISSUE_TEMPLATE/config.yml` security link |

> **Private repo caveat:** CodeQL code scanning and secret scanning on **private**
> repositories require **GitHub Advanced Security (GHAS)**. If GHAS is unavailable,
> keep the CodeQL workflow (harmless), and rely on Dependabot + Dependency Review +
> the pre-commit hooks / `docs/SECURITY.md` review process meanwhile.

## 5. Labels

Source of truth: [`.github/labels.yml`](../../.github/labels.yml) (overview in
[`LABELS.md`](../../.github/LABELS.md)).

- **Automated:** run **Actions -> Label Sync -> Run workflow** (`labeler.yml`).
  It syncs labels to the YAML (keeps extra labels; set `skip-delete: false` to
  prune).
- **Manual:** *Issues -> Labels -> New label*.

## 6. Post-merge Admin Checklist

After this governance PR merges to `develop` (and reaches `main`):

1. [ ] Enable general settings (§2).
2. [ ] Add branch protection / rulesets for `main`, `develop`, `release/*` (§3).
3. [ ] Enable security features (§4).
4. [ ] Run the Label Sync workflow (§5).
5. [ ] Create milestones ([MILESTONES](./MILESTONES.md)).
6. [ ] Create the Project board ([PROJECT-BOARD](./PROJECT-BOARD.md)).
7. [ ] Confirm required status checks appear after the first PR run, then mark them required.
8. [ ] Create the `v0.1.0` GitHub Release from the existing tag ([RELEASE-STRATEGY](./RELEASE-STRATEGY.md)).
