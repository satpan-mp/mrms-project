# Repository Metrics — Pre-Sprint 1B

> **Purpose:** Quantitative snapshot of the repository at the pre-Sprint-1B gate.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21

---

| Metric | Value | Source |
|--------|------:|--------|
| Apps | 3 (`admin`, `display`, `backend`) | workspace |
| Shared packages | 6 (`config`, `types`, `ui`, `api-client`, `realtime`, `hooks`) | workspace |
| Typecheck targets | 9 | `pnpm -r typecheck` |
| Tracked files (Sprint 1A) | 256 | `git ls-files` |
| Foundation change size | +14,753 / −156 across 145 files | `git diff develop..` |
| Total dependencies (resolved) | 1,160 | `pnpm audit` |
| Backend prod deps / dev deps | 15 / 17 | `apps/backend/package.json` |
| Automated tests (passing) | 10 unit/component + 3 backend e2e | test run |
| Backend coverage (lines) | 12.38% | `jest --coverage` (V8) |
| ADRs | 10 (ADR-001..010) | `docs/adr/` |
| Documentation set | 19 design docs + strategy/process/backlog + reports | `docs/` |
| Technical debt items | TD-001..016 (4 resolved) | `docs/backlog/technical-debt.md` |
| Dependency advisories | 1 crit / 10 high / 14 mod / 4 low (transitive) | `pnpm audit` |
| Production license risk | 0 (all permissive) | `pnpm licenses list --prod` |
| Open PRs | Sprint 1A PR #6; this certification PR | GitHub |

## Notes

- Dependency counts are dominated by transitive packages of the NestJS 10
  toolchain and Vite/Vitest dev tooling.
- Coverage is low by design at the foundation stage (mostly wiring); a ratchet
  is enforced (see [coverage report](./coverage-report.md)).
- A full CycloneDX/SPDX SBOM is scheduled (see `docs/security/sbom/README.md`);
  the license inventory in [LICENSE-COMPLIANCE.md](../../security/LICENSE-COMPLIANCE.md)
  already enumerates the production graph.

---

*End of Repository Metrics.*
