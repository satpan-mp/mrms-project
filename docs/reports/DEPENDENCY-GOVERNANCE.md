# Dependency Governance

- **Date:** 2026-07-20
- **Package manager:** pnpm 9.12.0 (workspace, 10 projects)
- **Total resolved packages:** 1156 (from `pnpm dedupe --check` / SBOM component count)
- **Method:** real `pnpm` commands + CycloneDX SBOM generation this pass.

## 1. Checklist

| Check | Result | Status |
|---|---|---|
| Unused dependencies | knip reports candidates — reviewed, mostly false-positives | Partially Verified |
| Duplicate dependencies | `pnpm dedupe --check` exit **0** → none to collapse | Verified |
| Version drift | `pnpm install --frozen-lockfile` → "Lockfile is up to date" exit **0** | Verified |
| Dependency graph | 1156 nodes, no circular imports (madge) | Verified |
| Lockfile consistency | frozen-lockfile passes | Verified |
| Peer dependency conflicts | install clean; 1 referenced optional peer (`tailwindcss`) | Verified |
| License compliance | all prod deps permissive (prior `pnpm licenses list --prod`) | Verified |
| SBOM generation | CycloneDX 1.6 generated (1156 components) | Verified |
| pnpm dedupe | exit 0, nothing to dedupe | Verified |
| Package synchronization | workspace protocol `workspace:*` consistent | Verified |

## 2. Duplicates & lockfile — Verified

```
pnpm dedupe --check            -> exit 0 (no duplicates)
pnpm install --frozen-lockfile -> "Lockfile is up to date, resolution step is skipped
                                    Already up to date"  exit 0
```

No duplicate top-level trees; the lockfile matches every manifest (no drift).

## 3. SBOM — Verified

- **File:** `docs/security/sbom/mrms-sbom.cdx.json`
- **Format:** CycloneDX 1.6, `serialNumber` present
- **Components:** 1156 (819 carry license metadata)
- **Generator:** `@cyclonedx/cdxgen` 11.11.0 (`-t pnpm`)
- **Reproduce:** `npx --yes @cyclonedx/cdxgen@11 -t pnpm -o docs/security/sbom/mrms-sbom.cdx.json`

This closes the previously documented SBOM gap.

## 4. Unused dependency review (knip, advisory) — Partially Verified

`npx knip@5` findings were reviewed; the large majority are false-positives from a not-yet-tuned knip config:

- **Workspace type-only deps** flagged unused (`@mrms/types`, `@mrms/realtime` in SPAs): consumed as type-only / JSX, invisible to knip's default resolver.
- **eslint plugins in `packages/config`**: consumed by shared eslint configs referenced by string, which knip cannot trace.
- **`supertest` / `@types/supertest`**: used by backend e2e (`test/jest-e2e.json`), not covered by knip's default entry patterns.
- **Genuinely unused today:** exported types `KioskConfig`, `SpinnerProps` (reserved for Sprint 1B). Low impact.

**Action:** ship a tuned `knip.json` in Sprint 1B; keep knip advisory (non-blocking) until then.

## 5. License compliance — Verified

Prior `pnpm licenses list --prod` showed **all production dependencies permissive** (MIT/ISC/Apache-2.0/BSD); **no GPL/AGPL/SSPL** copyleft. The SBOM provides a machine-readable license inventory for automated re-checks.

## 6. Dependency freeze policy for Sprint 1B

1. **Lockfile is law:** CI installs with `--frozen-lockfile`; no implicit resolution.
2. **No manual version bumps** without a PR that includes the reason and a green audit.
3. **Automated updates via Dependabot only** (config present in PR #12), grouped, reviewed by CODEOWNERS.
4. **Security overrides** live in root `package.json > pnpm.overrides` (see `SECURITY-CERTIFICATION.md`) and must be revisited when the parent (`@nestjs/*`) is upgraded.
5. **Runtime-affecting bumps** must pass build + unit + e2e before merge; major framework bumps (e.g., NestJS 10 → 11) require a new ADR.

## 7. Verdict

Dependency governance is **healthy**: no duplicates, no drift, permissive licenses, a real SBOM, and a documented freeze policy. Unused-dependency noise is advisory and explained. Non-blocking for Sprint 1B.
