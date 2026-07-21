# Quality Gates

- **Date:** 2026-07-20
- **Branch under test:** `chore/final-hardening-cert` (= `develop` @ `9f62043` + this pass's CI fix, security overrides, tests)
- **Method:** every gate below was executed as a real command this pass; exit codes captured.

## 1. Gate matrix

| Gate | Command | Result | Status |
|---|---|---|---|
| Format | `pnpm run format` (prettier) | own files clean; repo-wide normalization lives in PR #12 | Partially Verified |
| ESLint | `pnpm run lint` | exit **0** (0 errors; 1 import-order warning fixed) | ✅ Verified |
| TypeScript | `pnpm run typecheck` | exit **0** — 9/9 projects | ✅ Verified |
| Unit tests | `pnpm --filter @mrms/backend run test` | 22 passed | ✅ Verified |
| Integration tests | (foundation has none distinct from e2e) | — | N/A |
| E2E tests | `pnpm --filter @mrms/backend run test:e2e` | 3 passed (boots Nest app) | ✅ Verified |
| Coverage | `pnpm --filter @mrms/backend run test:cov` | exit **0**; 56.3% stmts | ✅ Verified |
| Build | `pnpm run build` | exit **0**; all 9 projects | ✅ Verified |
| Docker build | `docker build` | **Cannot Verify** — daemon unavailable (TD-015) | Cannot Verify |
| Prisma validate | `prisma validate` (CI Typecheck job) | passes in CI | Verified (CI) |
| Bundle size | vite build output | display 256.54 kB (gzip 84.80), admin 285.66 kB (gzip 94.60) | ✅ Verified |
| Repository health | `madge --circular`, `knip` | 0 cycles; advisory knip noise | ✅ Verified |

## 2. Coverage — the CI blocker fixed this pass

**Before:** required `Test` check failed on `develop` — coverage 11.76% statements vs a 12% floor (floor mis-set above reality).

**After (measured this pass):**

```
All files      | % Stmts 56.30 | % Branch 73.91 | % Funcs 64.70 | % Lines 56.30
shared/config  | env.ts        100% (branch 85.71)
shared/filters | all-exceptions.filter.ts 100% (branch 86.20)
Test Suites: 3 passed  |  Tests: 22 passed  |  exit 0
```

New tests: `env.spec.ts` (8 cases — env validation + CORS parsing) and `all-exceptions.filter.spec.ts` (10 cases — error mapping, redaction, correlation id). Ratchet floor raised to **statements 50 / branches 65 / functions 60 / lines 50** to lock in the gain and prevent regression, per the "coverage must never decrease" policy.

## 3. Build / bundle detail — Verified

- Backend `nest build` → Done.
- `apps/display`: `dist/assets/index-*.js` **256.54 kB** (gzip 84.80 kB), css 24.50 kB.
- `apps/admin`: `dist/assets/index-*.js` **285.66 kB** (gzip 94.60 kB), css 24.15 kB.
- Bundle sizes are unchanged from the `develop` baseline (this pass adds no runtime code to the SPAs).

## 4. Cannot Verify (environment-limited)

- **Docker image build/smoke (TD-015):** no Docker daemon. Reproduce on a capable host: `docker compose -f docker/docker-compose.prod.yml build`.
- **Browser/visual E2E (TD-016):** Playwright unavailable. `tools/screenshots/capture.mjs` is ready to run on a host with browsers installed.

## 5. Verdict

All runnable quality gates are **green with real evidence**. The one red gate (coverage/CI) discovered this pass was **fixed and re-verified**. The two Cannot-Verify gates are infrastructure-limited, documented as TD-015/016, and non-blocking for Sprint 1B code work.
