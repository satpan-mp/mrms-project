# Security Guide

> **Purpose:** Consolidated security controls, standards, and practices for MRMS.
> **Scope:** AuthN/Z, transport, secrets, input, sessions, auditing, and OWASP considerations across backend, frontends, and devices.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Authentication Flow](12-Authentication-Flow.md), [Secrets Management](SECRETS.md), [NFR](03-NFR-Non-Functional-Requirements.md), [API Strategy](API-STRATEGY.md), [Error Handling](standards/error-handling-convention.md), [Logging](standards/logging-convention.md), [Risk Register](RISK-REGISTER.md)
> **References:** [OWASP Top 10](https://owasp.org/www-project-top-ten/), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)

This guide is the security reference for implementation. It complements the
Authentication Flow (Doc 12) and Secrets Management (SECRETS.md) without
duplicating them; those remain authoritative for their topics.

## 1. Google OAuth

- Google Workspace OAuth 2.0 is the **only** human authentication method.
- Authorization Code flow; verify the `id_token` signature, `exp`, issuer, and
  **domain (`hd`)** against `GOOGLE_ALLOWED_DOMAINS`.
- Use the OAuth `state` parameter to prevent CSRF on the callback.
- Login scopes limited to `openid email profile`. Calendar scopes are separate and
  least-privilege (`calendar.readonly` + `calendar.events`; **no** edit/delete).

## 2. JWT

- App issues a short-lived **access JWT** (default 15m) and a rotating **refresh
  token** (default 7d, httpOnly+Secure+SameSite cookie).
- **RS256** signing (private key signs, public key verifies); support key
  rotation (verify against current + previous during overlap).
- Validate signature, `exp`, `iss`, `aud` on every request. Reject on mismatch.
- Refresh rotation with **reuse detection**: a replayed refresh token revokes the
  session.

## 3. RBAC

- Roles: `ADMINISTRATOR`, `EMPLOYEE` (plus device principals).
- Enforced by NestJS **guards** on every protected REST route and WebSocket
  handshake/channel join. Admin-only routes require `ADMINISTRATOR`.
- Capability matrix is defined in [Authentication Flow §4](12-Authentication-Flow.md).
- Deny by default; authorize explicitly.

## 4. Device / Kiosk Authentication

- Displays authenticate with **room-scoped device tokens**, stored **hashed** at
  rest, and **revocable** per room. A compromised token affects only one room.
- Rotate device tokens periodically (`deviceTokenRotationDays`, default 90).

## 5. Rate Limiting

- Apply rate limits to `auth/*` and `booking` endpoints (NFR-SEC-10) to mitigate
  brute force and abuse.
- Return `429 RATE_LIMITED` using the standard error envelope.
- Consider per-IP and per-principal limits; back with Redis for multi-instance.

## 6. CORS

- Restrict allowed origins to the known MRMS web origins (display/admin hosts);
  do not use `*` in production.
- Allow only required methods/headers; support credentials only for trusted
  origins (refresh cookie).
- WebSocket origin is validated on handshake.

## 7. HTTP Security Headers (Helmet)

- Enable **Helmet** on the API to set secure headers: HSTS, `X-Content-Type-Options`,
  `X-Frame-Options`/frame-ancestors, Referrer-Policy, and a **Content-Security-Policy**.
- Serve SPAs via Nginx with the same header posture; restrict framing except where
  the kiosk requires it.

## 8. HTTPS / Transport

- All client/device traffic over **HTTPS/WSS**; TLS terminated at Nginx.
- Redirect HTTP to HTTPS in production; enable HSTS.
- Internal service traffic stays within the on-prem network; only Google API
  egress leaves the premises.

## 9. Token Lifecycle & Session Management

- Access tokens are short-lived; refresh via `POST /auth/refresh` (rotating).
- `POST /auth/logout` revokes the refresh token/session.
- Server tracks refresh tokens to allow revocation and reuse detection.
- Google API tokens are stored **encrypted at rest** (NFR-SEC-5).
- Session state machine is documented in
  [Authentication Flow §6](12-Authentication-Flow.md).

## 10. Secrets Management

- Governed by [SECRETS.md](SECRETS.md): never commit secrets; inject at runtime
  from a secret store; `.env.example` holds placeholders only.
- Enable GitHub secret scanning + push protection; add pre-commit secret scanning
  (gitleaks) in Sprint 1 (see [technical-debt TD-007](backlog/technical-debt.md)).

## 11. Input Validation

- Validate every request body/query with DTOs + `class-validator`; reject unknown
  fields (whitelist) and enforce types/ranges.
- Parameterized queries via Prisma; never string-concatenate SQL.
- Treat all external data (calendar events, device telemetry, query params) as
  **untrusted**; sanitize before use and before rendering on clients.

## 12. Audit Logging

- State-changing admin actions and security events are written to `SystemLog`
  (`logType = AUDIT`/`ACTIVITY`) with actor, action, target, timestamp, and
  correlation ID (FR-X-1). Append-only; **no secrets** in logs.
- Auth events (`login`/`logout`/`refresh`) are audited (FR-AUTH-7).
- See [Logging Convention](standards/logging-convention.md).

## 13. OWASP Top 10 Considerations

| OWASP (2021) | MRMS mitigation |
|--------------|-----------------|
| A01 Broken Access Control | RBAC guards, deny-by-default, room-scoped device tokens, server-authoritative status |
| A02 Cryptographic Failures | TLS everywhere; RS256 JWT; encrypted Google tokens; hashed device tokens |
| A03 Injection | Prisma parameterization; DTO validation; output encoding on clients |
| A04 Insecure Design | Clean Architecture, threat-aware design, least-privilege Google scopes (create-only) |
| A05 Security Misconfiguration | Helmet, CORS allowlist, hardened Nginx, no default creds, config validation at startup |
| A06 Vulnerable Components | Pinned versions, Dependabot, CI audit (R-23) |
| A07 Auth Failures | Google OAuth only, JWT rotation + reuse detection, rate limiting, domain restriction |
| A08 Integrity Failures | Signed tokens; pinned Docker image tags; CI build integrity |
| A09 Logging/Monitoring Failures | Structured logs, audit trail, health checks, alerting (see Observability) |
| A10 SSRF | No user-controlled server-side fetch; outbound limited to Google APIs |

## 14. Security in the SDLC

- Security impact is part of the [Definition of Ready](process/definition-of-ready.md)
  and [Definition of Done](process/definition-of-done.md).
- Security-relevant changes go through an [RFC](rfc/README.md) and update the
  [Risk Register](RISK-REGISTER.md).
- A security review is part of the [Release Candidate checklist](process/release-management.md).
- Report vulnerabilities privately via a GitHub security advisory (see
  `.github/ISSUE_TEMPLATE/config.yml`), never as a public issue.
