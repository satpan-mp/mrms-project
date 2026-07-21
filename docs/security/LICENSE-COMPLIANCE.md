# License Compliance Review — Pre-Sprint 1B

> **Purpose:** Certify that every production dependency license is compatible with enterprise commercial use.
> **Scope:** Production dependency graph (workspace-wide), resolved transitively.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Tool:** `pnpm licenses list --prod` (pnpm 9.12.0)

---

## 1. Result

**PASS — no copyleft or restricted licenses in the production graph.**

Every production dependency resolves to a **permissive** or **public-domain-equivalent** license. There are **no** `GPL`, `AGPL`, `LGPL`, `SSPL`, `Commercial`, or `Unknown` licenses.

## 2. License distribution (production)

| License | Class | Commercial-use compatible | Examples |
|---------|-------|:-------------------------:|----------|
| MIT | Permissive | ✅ | React, NestJS, express, axios, ioredis, class-validator, zod, tailwindcss, socket.io-client |
| Apache-2.0 | Permissive (patent grant) | ✅ | @prisma/client, prisma, rxjs, reflect-metadata, typescript, swagger-ui-dist |
| ISC | Permissive | ✅ | semver, glob, yaml, minimatch |
| BSD-2-Clause / BSD-3-Clause | Permissive | ✅ | @typescript-eslint/parser, dotenv, qs, source-map-js |
| 0BSD | Public-domain-equivalent | ✅ | tslib |
| CC0-1.0 / (MIT OR CC0-1.0) | Public domain | ✅ | language-subtag-registry, type-fest |
| Python-2.0 | Permissive | ✅ | argparse |
| MPL-2.0 | Weak copyleft (file-level) | ✅ (see note) | axe-core (dev/test a11y tooling) |
| OFL-1.1 | SIL Open Font License | ✅ (see note) | @fontsource/inter |

## 3. Notes on the two non-MIT/Apache/BSD/ISC licenses

- **MPL-2.0 (`axe-core`)** — Weak, file-level copyleft. Obligations trigger only if you **modify** MPL-licensed source files and distribute them. We consume `axe-core` unmodified as a dependency (accessibility tooling), so there is **no source-disclosure obligation**. Low risk. Compatible with a closed-source commercial product.
- **OFL-1.1 (`@fontsource/inter`)** — SIL Open Font License. Fonts may be bundled and used commercially. The only notable restriction is that the font itself may not be sold on its own and reserved font names apply. We embed the font in the UI; **fully compatible**.

## 4. Project license posture

- Root `package.json` and app manifests declare `"license": "UNLICENSED"` and `"private": true` — the MRMS codebase itself is proprietary and not distributed as an npm package. This is correct for an internal enterprise product.

## 5. Recommendations

| ID | Action | Priority |
|----|--------|:--------:|
| — | Add an automated license gate to CI (e.g., fail on GPL/AGPL/SSPL) using `pnpm licenses list` parsing or a license-checker action | M |
| — | Re-run this review whenever new dependencies are added (especially before introducing Google API SDKs in Sprint 1B) | M |
| — | Include license data in the generated SBOM (see `docs/security/sbom/`) | L |

## 6. Verdict

**License compliance: CERTIFIED for enterprise commercial use.**

---

*End of License Compliance Review.*
