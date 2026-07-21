# Merge Readiness

- **Date:** 2026-07-20
- **Method:** live GitHub REST — `GET /pulls/{n}` for every open PR (mergeable computed by GitHub). Status tags: Verified.

## 1. Open PR ledger (Verified)

`GET /pulls?state=open` → **9 open PRs**. Every one reports **`mergeable=true` (no merge conflicts)** and **`mergeable_state=blocked`** (blocked only by branch protection: 1 required review + signed commits — the human gate, not conflicts).

| PR | Head → Base | Commits | Files | +/- | Note |
|---|---|---:|---:|---|---|
| #14 | `chore/final-hardening-cert` → **develop** | 1 | 18 | +49246/-92 | **Canonical** CI-fix + cert (this pass) |
| #13 | `chore/final-hardening-cert` → **main** | 12 | 231 | +69205/-157 | ⚠ **Mis-targeted duplicate of #14** — should target `develop` or be closed |
| #12 | `chore/engineering-guardrails` → develop | 1 | 37 | +449/-110 | Guardrails (CI Format/CodeQL/dep-review, CODEOWNERS, Dependabot) |
| #11 | `docs/foundation-consolidation` → **main** | 13 | 219 | +20501/-158 | ⚠ Duplicate of #10 (same head → main) |
| #10 | `docs/foundation-consolidation` → develop | 2 | 5 | +450/-1 | **Canonical** consolidation docs |
| #4 | `feature/github-governance` → main | 2 | 64 | +4042/-63 | Legacy feature branch |
| #3 | `feature/ui-design-intelligence` → main | 2 | 200 | +33474/-1 | Legacy feature branch |
| #2 | `feature/final-architecture-review` → main | 2 | 63 | +4577/-1 | Legacy feature branch |
| #1 | `develop` → main | 11 | 216 | +20051/-157 | develop→main promotion PR |

## 2. Findings

| Check | Result |
|---|---|
| Merge conflicts | **None** — all 9 PRs `mergeable=true` |
| Branch divergence | `main` trails `develop`; the develop-targeted PRs (#10/#12/#14) are each ≤2 commits ahead — low divergence |
| Duplicated commits | #13 and #11 replay develop's history against `main`; they duplicate #14/#10 content but at a different base |
| Duplicated documentation | #10 (→develop) and #11 (→main) carry the same consolidation docs; intended flow is develop-first then promote |
| Duplicated ADRs | none detected (ADRs unchanged this pass) |
| Duplicated Technical-Debt items | none — single registry; TD-015/016 referenced consistently |
| Duplicated CHANGELOG entries | v0.2.0 entry exists only in `docs/foundation-consolidation` (PRs #10/#11); no double-entry on `develop` yet |
| Duplicated release notes | single release `v0.2.0-foundation`; no duplicates |

## 3. Recommended merge order (human, signed + reviewed)

1. **Into `develop` (canonical):** #12 (guardrails) → #10 (consolidation docs) → #14 (CI fix + cert). Each has `mergeable=true`; resolve conversations, approve, merge (fast-forward/rebase to keep linear history).
2. **Promote `develop` → `main`:** refresh **#1** after the above land, then merge once.
3. **Close redundant `main`-targeted PRs:** **#13** (duplicate of #14) and **#11** (duplicate of #10) — their content reaches `main` via step 2.
4. **Triage legacy feature PRs** #2/#3/#4: retarget to `develop` if they carry unique unmerged work, otherwise close.

## 4. Blocking?

No merge conflicts exist anywhere. The only blocker is the **signed-commit + review** requirement, which the automation account cannot satisfy. This is a human action, not an engineering defect. **Not blocking** Sprint 1B planning.
