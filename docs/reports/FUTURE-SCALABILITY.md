# Future Scalability Review

- **Date:** 2026-07-20
- **Method:** structural analysis of the monorepo topology against team-size and product-growth scenarios.

## 1. Team scaling

| Team size | Readiness | Notes / bottlenecks |
|---|---|---|
| 5 devs | ✅ Ready | Clear module/package boundaries, branch protection, CI, CODEOWNERS routing (PR #12) |
| 10 devs | ✅ Ready | Add CODEOWNERS granularity per package; consider Turborepo caching to keep CI fast |
| 20 devs | ⚠ Needs investment | CI without remote cache will slow (full install per job × many PRs); adopt Turbo/Nx remote cache; split CODEOWNERS per bounded context; enforce PR size limits |

## 2. Product/architecture scaling

| Scenario | Readiness | Path |
|---|---|---|
| Multiple backend services | ⚠ Ready with pattern | add `apps/<service>` NestJS apps; extract shared domain into `packages/*`; introduce a task runner + service-scoped CI matrices |
| Multiple frontend apps | ✅ Ready | already 2 SPAs on shared `packages/ui`/`hooks`; add more under `apps/*` |
| Mobile apps | ⚠ Feasible | add `apps/mobile` (React Native/Expo); reuse `packages/types`, `api-client`, `hooks`; UI package is web-oriented and would need a RN-compatible layer |
| SDK packages | ✅ Ready | `packages/api-client`/`types` are publish-ready shapes; add build+publish pipeline and semver when externalized |

## 3. Bottlenecks to address before they become debt

1. **CI caching** — introduce Turborepo (or Nx) remote cache before ~15–20 active contributors; without it, install/build duplication across jobs dominates CI time.
2. **Package versioning strategy** — `workspace:*` is fine internally; define a Changesets-based release flow before publishing any SDK externally.
3. **CODEOWNERS granularity** — evolve from repo-wide to per-package ownership as the team grows.
4. **Service boundaries** — when a second backend service appears, formalize inter-service contracts (OpenAPI/events) and add an ADR; avoid shared mutable packages that couple services.
5. **Test parallelism** — as suites grow, shard Jest/Vitest in CI.

## 4. Verdict

The current topology **scales cleanly to ~10 developers and multiple frontend apps today**, and to more services/SDKs/mobile with **incremental, well-understood investments** (CI caching, versioning flow, ownership granularity). No architectural rework is required now. **Not blocking** Sprint 1B.
