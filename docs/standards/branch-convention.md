# Branch Convention

Branch naming for the Git Flow model (see [git-convention](./git-convention.md)).

## 1. Naming Pattern

```
<type>/<issue-id>-<short-kebab-summary>
```

- `type` is one of the supporting-branch prefixes.
- `issue-id` links to the GitHub issue (e.g., `42`); omit only for trivial chores.
- summary is short, lower-case, kebab-cased.

## 2. Prefixes

| Prefix | From | Into | Example |
|--------|------|------|---------|
| `feature/` | `develop` | `develop` | `feature/42-create-booking` |
| `bugfix/` | `develop` | `develop` | `bugfix/57-status-flicker` |
| `release/` | `develop` | `main` + `develop` | `release/0.8.0` |
| `hotfix/` | `main` | `main` + `develop` | `hotfix/61-token-refresh` |

> `release/*` uses the target version (`release/x.y.z`) rather than an issue id.

## 3. Lifecycle

1. Branch from the correct base (`develop` or `main`).
2. Keep the branch short-lived; rebase or merge latest base frequently.
3. Open a PR with a Conventional Commit title into the correct target.
4. Merge (squash) after CI + reviews pass.
5. **Delete the branch** after merge (auto-delete recommended in repo settings).

## 4. Rules

- Never commit directly to `main` or `develop` - always via PR.
- One branch per issue/task; avoid long-running catch-all branches.
- No personal forks of long-lived branches; use supporting branches.
- Do not force-push shared branches; only your own unmerged feature branch if
  strictly necessary (prefer avoiding it).
- Names are lower-case ASCII; no spaces.

## 5. Protected Branch Notes

`main`, `develop`, and active `release/*` are protected. See
`.github/BRANCH_PROTECTION.md` for the recommended enforcement settings (PR
required, reviews, status checks, linear history, no force push/delete).
