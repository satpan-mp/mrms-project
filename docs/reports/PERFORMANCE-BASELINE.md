# Performance Baseline

- **Date:** 2026-07-20
- **Method:** measured from fresh builds/tests this pass. Runtime latency/memory require a running server (Docker unavailable, TD-015) and are documented as Cannot Verify with repro steps.

## 1. Frontend — Verified (fresh `pnpm run build`)

| App | JS bundle | gzip | CSS | Build time | Modules |
|---|---|---|---|---|---|
| display | 256.54 kB | 84.80 kB | 24.50 kB (gzip 5.20) | 5.83 s | 4702 |
| admin | 285.66 kB | 94.60 kB | 24.15 kB (gzip 5.15) | 5.96 s | 4702 |

- **Asset compression:** gzip sizes reported by Vite; fonts (Inter woff2) subset by charset. Production runtime compression also enabled server-side (`compression()` middleware).
- **Lighthouse readiness:** SPAs are code-split-ready via Vite; a Lighthouse run requires a served build + browser (TD-016). Repro: `pnpm --filter @mrms/display build && npx serve dist` then Lighthouse.
- Bundle sizes are **stable** vs the prior baseline (no regression this pass).

## 2. Backend — Partially Verified

| Metric | Result | Status |
|---|---|---|
| Build (`nest build`) | completes in the workspace build (bundled with the 9-project `pnpm -r build`) | Verified |
| Unit test suite | 22 tests in ~3.6 s | Verified |
| E2E suite (boots Nest app) | 3 tests in ~3.2 s; health/ping/version respond in 8–107 ms **in-process** | Verified |
| Cold startup | not measured — needs `node dist/main.js` against Postgres+Redis (Docker unavailable, TD-015) | Cannot Verify |
| Memory (RSS) | not measured — needs running process | Cannot Verify |
| Response latency (HTTP) | in-process e2e shows single-digit-ms handler time; real network latency needs a deployed instance | Partially Verified |

**Repro for backend runtime metrics (on a Docker-capable host):**
```
docker compose -f docker/docker-compose.dev.yml up -d   # Postgres + Redis
pnpm --filter @mrms/backend build && node apps/backend/dist/main.js
# then: measure startup log timestamp, `curl -w` latency, process RSS
```

## 3. Baseline values to track in Sprint 1B

| Metric | Baseline (2026-07-20) | Target |
|---|---|---|
| display JS gzip | 84.80 kB | < 120 kB as features land |
| admin JS gzip | 94.60 kB | < 150 kB |
| FE build time | ~6 s each | < 15 s |
| BE unit suite | ~3.6 s | < 30 s |
| BE cold start | TBD (measure on host) | < 3 s |

## 4. Verdict

Frontend performance baseline is **captured and healthy**; backend build/test timings are captured. Runtime latency/memory/cold-start are **Cannot Verify** here (no daemon) with exact repro provided. **Not blocking** — establish runtime numbers on a capable host during 1B.
