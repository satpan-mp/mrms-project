# Foundation Baseline Certification — v0.2.0-foundation

- **Date:** 2026-07-20
- **Release:** `v0.2.0-foundation`
- **Commit (rollback point):** `9f62043`
- **Status:** published (GitHub Release, `draft=false`, `prerelease=false`) — Verified via REST `/releases`.

## 1. Release governance checklist

| Requirement | Status | Evidence |
|---|---|---|
| Tag exists | ✅ Verified | REST `/tags`: `v0.2.0-foundation` @ `9f62043` |
| Release exists | ✅ Verified | REST `/releases`: 1 published release |
| Release notes complete | ✅ Verified | Release body covers summary, deliverables, limitations, tech debt, upgrade notes |
| Rollback point documented | ✅ Verified | `git checkout 9f62043` / `git reset --hard v0.2.0-foundation` (see §3) |
| CHANGELOG synchronized | ⚠️ Partially | `CHANGELOG.md` v0.2.0 entry lands via open PR #10; not yet on `develop` |
| Docs version synchronized | ⚠️ Partially | Doc version bumps also ride PR #10 |

## 2. What the baseline contains

- pnpm monorepo (10 workspaces): `apps/{backend,admin,display}`, `packages/{types,api-client,realtime,ui,hooks,config}`.
- NestJS 10 backend: health/system endpoints, config with Zod env validation, Pino logging, Prisma + Redis wiring, global exception filter, HTTP hardening (helmet, compression, rate limiting, body limits).
- Two React 18 + Vite SPAs (admin, display) on a shared UI foundation.
- Real CI (Lint/Typecheck/Test/Build) + Docker multi-stage images + compose orchestration.
- Engineering documentation pack (ADRs, RFC, decision log, risk register, DoR/DoD, security/DR/observability strategies).

## 3. Rollback procedure

```bash
# Inspect the certified baseline
git fetch --tags
git checkout v0.2.0-foundation   # detached HEAD at 9f62043

# Emergency rollback of develop to the baseline (admin, requires unprotect or admin push)
git reset --hard v0.2.0-foundation
# then restore protection
```

Container rollback: redeploy the image built from tag `v0.2.0-foundation` (image build must be produced on a Docker-capable host — see TD-015).

## 4. Post-baseline hardening applied on top (this pass)

The certification branch `chore/final-hardening-cert` (PR into `develop`) adds, on top of `9f62043`:
- CI-unblocking unit tests (coverage 11.76% → 56.3%) + raised ratchet floor.
- pnpm security overrides (prod advisories 17 → 6).
- CycloneDX SBOM artifact.
- This 12-document certification set.

A follow-up patch tag (suggested `v0.2.1-foundation`) should be cut by a human after PR #10, #12, and the certification PR merge, so the tag points at a green-CI commit.

## 5. Verdict

The `v0.2.0-foundation` release is a **valid, documented, restorable baseline**. CHANGELOG/doc-version sync is pending the merge of already-open PRs (human-gated). Non-blocking for Sprint 1B.
