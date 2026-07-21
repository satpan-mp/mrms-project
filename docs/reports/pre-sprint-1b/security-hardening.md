# Security Hardening Review — Pre-Sprint 1B

> **Purpose:** Record backend security controls present, implemented now, and scheduled.
> **Scope:** `apps/backend` runtime hardening + dependency/secret posture.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related:** [Security Guide](../../SECURITY.md), [NFR §5](../../03-NFR-Non-Functional-Requirements.md), [Dependency Audit](../sprint-1a/dependency-security-audit.md), [License Compliance](../../security/LICENSE-COMPLIANCE.md)

---

## 1. Controls already present (Sprint 1A)

| Control | Status | Evidence |
|---------|:------:|----------|
| Strict input validation | ✅ | Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`). |
| Consistent error envelope (no stack leakage) | ✅ | `AllExceptionsFilter`. |
| CORS allow-list | ✅ | `enableCors` from `CORS_ORIGINS` env. |
| Structured logging, no secrets in logs | ✅ | nestjs-pino; correlation IDs. |
| Secrets outside source control | ✅ | `.env` untracked; `.env.example` documents keys. |
| HTTPS/TLS termination | ✅ | Nginx reverse proxy (deployment). |
| Env validation at boot | ✅ | Zod schema. |

## 2. Controls implemented in this pass (no new dependencies)

| Control | Status | Detail |
|---------|:------:|--------|
| Remove framework fingerprint | ✅ | `x-powered-by` disabled on the Express instance. |
| Correct client IP behind proxy | ✅ | `trust proxy = 1` (Nginx hop). |
| Baseline security response headers | ✅ | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `X-DNS-Prefetch-Control: off`, `Cross-Origin-Opener-Policy: same-origin`. |

Verified: backend build + unit + e2e pass with the hardening in place.

## 3. Scheduled for Sprint 1B (require dependencies — deliberately deferred)

To avoid changing the runtime dependency graph during a certification freeze,
the following are documented with exact wiring and scheduled for the start of
Sprint 1B:

| Control | Package | Wiring |
|---------|---------|--------|
| Full security headers (CSP, HSTS, etc.) | `helmet` | `app.use(helmet())` in `main.ts` (supersedes the baseline headers above). |
| Rate limiting (auth/booking) | `@nestjs/throttler` | `ThrottlerModule.forRoot([...])` + `APP_GUARD`; stricter limits on auth/booking routes (NFR-SEC-10). |
| Response compression | `compression` | `app.use(compression())`. |
| Request body size limit | express body-parser opts | `app.use(json({ limit: '1mb' }))` / urlencoded limit. |
| Sensitive-data redaction | pino `redact` | redact `authorization`, `cookie`, `password`, tokens in logs. |
| Prisma query logging (non-prod) | Prisma `log` option | enable `query`/`warn`/`error` events for observability. |

## 4. Dependency & license posture

- **Dependency audit:** 1 critical / 10 high / 14 moderate / 4 low — **all transitive** (NestJS 10 toolchain + Vite/Vitest dev tooling) and **not reachable** by foundation code paths. Remediation = coordinated NestJS 11 / Vite 6 upgrades (TD-012/013). See the [dependency audit](../sprint-1a/dependency-security-audit.md).
- **License compliance:** all production licenses permissive; no GPL/AGPL/SSPL. See [LICENSE-COMPLIANCE.md](../../security/LICENSE-COMPLIANCE.md).

## 5. OWASP Top 10 (foundation posture)

| Risk | Posture |
|------|---------|
| A01 Broken Access Control | RBAC + auth arrive Sprint 1B; enum-based roles designed. |
| A02 Cryptographic Failures | TLS at Nginx; JWT/secret handling designed (NFR-SEC). |
| A03 Injection | Prisma parameterized queries; ValidationPipe; no raw SQL in app code. |
| A05 Security Misconfiguration | Fingerprint removed, headers set, Swagger non-prod only. |
| A06 Vulnerable Components | Audited; transitive advisories tracked (TD-012/013). |
| A09 Logging/Monitoring | Structured logs + correlation IDs; redaction scheduled. |

## 6. Verdict

**Security: baseline hardening applied; enterprise controls (helmet/throttler/
compression/redaction) scheduled for Sprint 1B start.** No unresolved
foundation-reachable vulnerability. Rated a "minor revision" item pending the
scheduled controls.

---

*End of Security Hardening Review.*
