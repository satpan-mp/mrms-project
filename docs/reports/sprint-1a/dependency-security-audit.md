# Dependency Security Audit — Sprint 1A

> **Purpose:** Record the dependency vulnerability audit for the Sprint 1A foundation.
> **Scope:** All workspace dependencies (apps + packages), resolved transitively.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [Security Guide](../../SECURITY.md), [Technical Debt](../../backlog/technical-debt.md)
> **Tool:** `pnpm audit` (pnpm 9.12.0), advisory DB as of 2026-07-21

---

## 1. Summary

| Severity | Count |
|----------|:-----:|
| Critical | 1 |
| High | 10 |
| Moderate | 14 |
| Low | 4 |
| Info | 0 |
| **Total advisories** | **29** |

- **Total dependencies scanned:** 1160 (workspace-wide; pnpm classifies hoisted deps as production).
- **Command:** `pnpm audit --json`
- **Result:** No advisory is triggered by first-party (foundation) code paths. Every finding is in a **transitive** dependency of the NestJS 10 toolchain or the Vite/Vitest dev tooling.

> Note: pnpm reports `devDependencies: 0` because workspace dev tooling is hoisted and classified as production in the audit metadata. Severity is therefore assessed by **actual usage**, not by the classifier, below.

---

## 2. Critical

| Advisory | Module | Path (origin) | Real exposure |
|----------|--------|---------------|---------------|
| GHSA-5xrq-8626-4rwp (CVSS 9.8) | `vitest` < 3.2.6 | `apps/*`, `packages/*` → `vitest@2.1.9` | **Dev/test tooling only.** Exploitable only if the Vitest UI/API server is exposed to the network. We never run Vitest UI, never expose it, and it is not part of any runtime artifact. **Not a production risk.** Remediation = bump Vitest (see §5). |

## 3. High (10)

All are transitive; grouped by origin:

| Module | Advisory | Origin | Real exposure |
|--------|----------|--------|---------------|
| `glob` (CLI inj.) | GHSA-5j98-mcp5-4vw2 | `@nestjs/cli` (dev) | CLI-only `-c/--cmd`; we never invoke the glob CLI. Dev-time. |
| `picomatch` (ReDoS) | GHSA-c2c7-rcm5-vvqj | `@nestjs/cli` → `@angular-devkit` (dev) | Build-time only; patterns are developer-controlled. |
| `multer` (DoS ×3) | GHSA-xf7r-hgr6-v32p, GHSA-v52c-386h-88mc, GHSA-5528-5vmv-3xc2, GHSA-72gw-mp4g-v24j | `@nestjs/platform-express` (prod) | Reachable only via file-upload routes. **No upload endpoints exist in 1A.** |
| `lodash` (code inj.) | GHSA-r5fr-rjxr-66jc (CVSS 8.1) | `@nestjs/config`, `@nestjs/swagger` (prod) | `_.template` sink; we never call `_.template` with untrusted input. |
| `js-yaml` (quadratic DoS) | GHSA-52cp-r559-cp3m | `@nestjs/swagger` (prod) | Triggered by parsing untrusted YAML; Swagger does not parse untrusted YAML at runtime. |

## 4. Moderate (14) / Low (4) — highlights

| Module | Advisory | Origin | Real exposure |
|--------|----------|--------|---------------|
| `esbuild` | GHSA-67mh-4wv8-2f99 | Vite dev server (dev) | Dev server CORS; not in production build. |
| `vite` (×3: path traversal, fs.deny bypass, launch-editor NTLM) | GHSA-4w7w-…, GHSA-fx2h-…, GHSA-v6wh-… | `apps/*` (dev) | Require exposing the dev server to the network (`--host`). We do not. |
| `@nestjs/core` (SSE injection) | GHSA-36xv-jgw5-4q75 | `apps/backend` (prod) | Requires developer-mapped user input into SSE `type`/`id`. No SSE endpoints in 1A. |
| `qs` / `body-parser` (DoS) | GHSA-q8mj-…, GHSA-v422-… | express (prod) | Edge-case parsing DoS; framework error boundary contains impact. |
| `ajv`, `file-type`, `tmp` | various | nestjs toolchain | Dev/build-time or unreached code paths. |

Full machine-readable output is reproducible with `pnpm audit --json` from the repo root.

---

## 5. Risk assessment & disposition

**Overall runtime risk: LOW.** The foundation exposes only `/health`, `/version`,
and `/ping`. It does not: accept file uploads (multer), parse untrusted YAML
(js-yaml), call `_.template` with untrusted input (lodash), expose Vite/Vitest
dev servers to the network, or serve SSE. The critical/high findings are
therefore **not reachable** in this release.

Most advisories resolve only through **upstream major bumps** — NestJS 11
(pulls patched `@nestjs/core`, `multer`, `express`/`qs`/`body-parser`, `lodash`,
`js-yaml`) and Vite 6 / Vitest 3 (patched `esbuild`, `vite`). These are
coordinated dependency upgrades, not one-line fixes, so they are scheduled
rather than forced into the foundation.

### Actions

| ID | Action | When |
|----|--------|------|
| TD-012 | Upgrade Vite 5 → 6 and Vitest 2 → 3 (clears esbuild, vite, vitest advisories) | Next FE-tooling sprint |
| TD-013 | Upgrade NestJS 10 → 11 (clears @nestjs/core, multer, express-chain, lodash, js-yaml) | Backend-hardening sprint |
| TD-014 | Add `pnpm audit` (and/or Dependabot/dependency-review) as an advisory CI gate | Next sprint |
| — | Re-audit **before** introducing file uploads, YAML parsing, or SSE (gates the risky code paths) | Feature-driven |

These are recorded in the [Technical Debt register](../../backlog/technical-debt.md).

---

*End of Dependency Security Audit.*
