# Security Certification

- **Date:** 2026-07-20
- **Scope:** application security posture + dependency security audit. Evidence from source inspection (`apps/backend/src/main.ts`, filters, config) and real `pnpm audit --prod` runs this pass.

## 1. Application security controls — Verified (source-confirmed)

All confirmed in `apps/backend/src/main.ts` and related modules:

| Control | Implementation | Status |
|---|---|---|
| Helmet (security headers) | `app.use(helmet())` — sets CSP, nosniff, frameguard, etc. | ✅ Verified |
| HSTS | provided by helmet defaults (Strict-Transport-Security) | ✅ Verified |
| CSP | helmet default Content-Security-Policy | ✅ Verified (default policy; tighten per-route in 1B) |
| Compression | `app.use(compression())` | ✅ Verified |
| Rate limiting | `@nestjs/throttler` global `ThrottlerGuard` in `AppModule`, TTL/limit from env | ✅ Verified |
| Body limits | `useBodyParser('json'/'urlencoded', { limit: '1mb' })` | ✅ Verified |
| CORS | `enableCors` with `parseCorsOrigins(CORS_ORIGINS)`, credentials | ✅ Verified |
| Fingerprint removal | `app.disable('x-powered-by')` | ✅ Verified |
| Proxy trust | `app.set('trust proxy', 1)` (Nginx TLS hop) | ✅ Verified |
| Input validation | global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) | ✅ Verified |
| Error envelope / no leak | `AllExceptionsFilter` maps all errors; internals never returned (unit-tested this pass) | ✅ Verified |
| Cookie security | no cookies issued at foundation (auth is Sprint 1B) | N/A yet |
| Prisma logging | env-gated (verbose only in dev) in `prisma.service.ts` | ✅ Verified |
| Sensitive log redaction | Pino structured logging; secrets never logged; env validated not echoed | ✅ Verified |
| Environment validation | Zod `validateEnv` fail-fast at boot (unit-tested this pass, 8 cases) | ✅ Verified |
| Middleware order | logger → guards → validation → filter → helmet/compression → body limits | ✅ Verified |
| Process guards | `unhandledRejection` logged; `uncaughtException` logs + exits for clean restart | ✅ Verified |
| Secret leakage | secret scanning + push protection ON; 0 alerts (see GITHUB-ENTERPRISE-VALIDATION) | ✅ Verified |
| Swagger exposure | disabled when `APP_ENV` starts with `prod` | ✅ Verified |

## 2. Dependency security audit — Verified (remediation performed this pass)

`pnpm audit --prod` **before** overrides: **17 advisories** (6 high, 9 moderate, 2 low) — all transitive via NestJS 10 platform packages.

Applied `pnpm.overrides` (root `package.json`) for advisories with safe same-major upstream fixes:

```json
"pnpm": { "overrides": {
  "multer": ">=2.2.0",       // 4 high + 1 moderate DoS
  "qs": ">=6.15.2",          // 1 moderate DoS
  "body-parser": ">=1.20.6", // 1 low DoS
  "on-headers": ">=1.1.0",   // 1 low header manipulation
  "js-yaml": ">=4.3.0"       // 1 high + 2 moderate
}}
```

`pnpm audit --prod` **after** overrides: **6 advisories** (1 high, 5 moderate, 0 low) — a **65% reduction**; all highs from multer and js-yaml eliminated; all lows eliminated.

**Runtime safety of overrides — Verified:** full backend build + 22 unit tests + 3 e2e (which boot the Nest app via supertest) all pass, confirming the forced transitive versions do not break bootstrap or the HTTP stack.

### Residual advisories (documented, not safely fixable now)

| Package | Severity | Why not fixed |
|---|---|---|
| `lodash` (@nestjs/config, @nestjs/swagger) | 1 high + 2 moderate | Advisory "patched >=4.18.0" — **no such release exists** (lodash latest is 4.17.21). Unpatchable via upgrade. |
| `file-type` (@nestjs/common) | 2 moderate | Fix requires v21 (ESM-only major) inside NestJS CommonJS — high breakage risk; deferred. |
| `@nestjs/core` self-advisory | 1 moderate | Fix requires NestJS **v11 major upgrade** — out of scope (needs ADR). |

**Reachability:** the foundation exposes only health/system GET endpoints — no file uploads (multer path unused), no runtime YAML parsing (swagger yaml is build-time/dev-only), and lodash is confined to `@nestjs/config`/`@nestjs/swagger` internals. Residual advisories are **low real-world reachability** at this stage.

## 3. Remaining manual / Sprint 1B actions

1. Enable **Dependabot security updates** (currently disabled) — admin toggle.
2. Plan **NestJS 10 → 11** upgrade (new ADR) to clear the `@nestjs/core` and pull patched `file-type`/`multer` transitively.
3. Re-audit when file-upload endpoints are introduced (multer becomes reachable).
4. Tighten CSP per-route once the SPAs' asset origins are finalized.

## 4. Verdict

Application-layer security is **comprehensive and Verified**. Dependency risk was **actively reduced 17 → 6** with runtime verification; residuals are transitive, low-reachability, and unpatchable without a major framework bump. **Not blocking** for Sprint 1B, with the upgrade tracked as a first-class debt item.
