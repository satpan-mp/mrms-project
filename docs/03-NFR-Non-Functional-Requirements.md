# Non-Functional Requirements (NFR)

**Project:** Meeting Room Management System (MRMS)
**Client:** PT Mitra Prodin
**Document:** 03 of 19 — Non-Functional Requirements
**Status:** Draft for Approval
**Version:** 1.0
**Date:** 2026-07-20

---

## 1. Purpose

This document defines quality attributes and constraints MRMS must satisfy.
Each requirement has an ID (`NFR-<CATEGORY>-<n>`), a target, and a verification
method. Targets are initial proposals for stakeholder confirmation.

---

## 2. Performance & Responsiveness

| ID | Requirement | Target | Verify |
|----|-------------|--------|--------|
| NFR-PERF-1 | Real-time display update latency after a status change | ≤ 2 s end-to-end (server event → display render) | Load/latency test |
| NFR-PERF-2 | REST API response time (read endpoints, p95) | ≤ 300 ms under nominal load | Benchmark |
| NFR-PERF-3 | Booking creation round-trip (excluding Google latency) | ≤ 800 ms p95 | Benchmark |
| NFR-PERF-4 | Display realtime clock accuracy | Drift ≤ 1 s (client-rendered, NTP-backed) | Manual/automated check |
| NFR-PERF-5 | Calendar cache read for a room's day view | ≤ 150 ms p95 | Benchmark |

---

## 3. Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-1 | Support current deployment (3 sites, 14 rooms) with headroom | ≥ 100 rooms without architecture change |
| NFR-SCALE-2 | Concurrent display WebSocket connections | ≥ 200 concurrent, horizontally scalable |
| NFR-SCALE-3 | Backend MUST scale horizontally (stateless API, shared Redis/DB) | Add instances behind Nginx |
| NFR-SCALE-4 | Sync workload MUST scale via queue workers (BullMQ) | Independent worker scaling |

---

## 4. Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-1 | Backend service availability (on-prem, business hours) | ≥ 99.5% |
| NFR-AVAIL-2 | Display resilience when backend/Google unavailable | Show last-known cached schedule + degraded banner |
| NFR-AVAIL-3 | WebSocket auto-reconnect with state resync | Reconnect ≤ 10 s, then resync |
| NFR-AVAIL-4 | Sync fault tolerance | Retry with backoff; failure surfaced, not silent |
| NFR-AVAIL-5 | No single point of failure for stateless tiers | Redundant API/worker instances |

---

## 5. Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-1 | All traffic MUST be over HTTPS/TLS (Nginx termination). |
| NFR-SEC-2 | Authentication MUST use Google OAuth 2.0; app issues signed JWTs. |
| NFR-SEC-3 | RBAC MUST gate every protected REST and WebSocket operation. |
| NFR-SEC-4 | Secrets (OAuth client secret, DB creds, JWT keys) MUST be stored outside source control (env/secret store). |
| NFR-SEC-5 | Google API tokens MUST be stored encrypted at rest. |
| NFR-SEC-6 | Audit and activity logs MUST be tamper-evident (append-only, timestamped). |
| NFR-SEC-7 | Input MUST be validated/sanitized server-side (DTO validation). |
| NFR-SEC-8 | Least-privilege Google scopes: read calendar + create events only (no edit/delete scopes requested). |
| NFR-SEC-9 | Display/kiosk devices MUST authenticate with room-scoped, revocable credentials. |
| NFR-SEC-10 | Rate limiting MUST protect auth and booking endpoints. |

---

## 6. Privacy & Data Protection

| ID | Requirement |
|----|-------------|
| NFR-PRIV-1 | Store only meeting metadata needed for display/analytics (organizer, attendees, subject, time, links). |
| NFR-PRIV-2 | Meeting cache MUST have a retention policy; stale past-event detail purged/aggregated per policy. |
| NFR-PRIV-3 | Personal data access MUST be role-restricted. |
| NFR-PRIV-4 | Analytics SHOULD favor aggregates; avoid exposing individual behavioral profiling beyond stated KPIs. |

---

## 7. Usability & Accessibility

| ID | Requirement |
|----|-------------|
| NFR-USE-1 | Display UI MUST be legible on Smart TV at typical viewing distance (large typography, high contrast). |
| NFR-USE-2 | UI MUST support Light and Dark modes. |
| NFR-USE-3 | Design language MUST be Google Meet-inspired, enterprise, minimal, modern, responsive. |
| NFR-USE-4 | Admin Panel MUST be usable on standard desktop resolutions. |
| NFR-USE-5 | UI SHOULD follow WCAG 2.1 AA color-contrast guidance where applicable (full a11y validation requires manual assistive-tech testing). |
| NFR-USE-6 | Display MUST require zero interaction to convey status and schedule. |

---

## 8. Maintainability & Code Quality

| ID | Requirement |
|----|-------------|
| NFR-MAINT-1 | Architecture MUST follow Clean Architecture + DDD with clear module boundaries. |
| NFR-MAINT-2 | Codebase MUST follow SOLID and the Repository Pattern. |
| NFR-MAINT-3 | Frontend and backend MUST be separated. |
| NFR-MAINT-4 | Code MUST pass linting/formatting gates (ESLint/Prettier) in CI. |
| NFR-MAINT-5 | Public APIs MUST be documented (OpenAPI + AsyncAPI/events). |
| NFR-MAINT-6 | Modules MUST be independently testable. |

---

## 9. Observability

| ID | Requirement |
|----|-------------|
| NFR-OBS-1 | Structured logging (JSON) with correlation IDs across API/worker/WebSocket. |
| NFR-OBS-2 | Sync status, device heartbeat, and queue health MUST be observable. |
| NFR-OBS-3 | Health/readiness endpoints MUST exist for each service. |
| NFR-OBS-4 | Errors MUST be captured with enough context for diagnosis (no secrets in logs). |

---

## 10. Compatibility & Environment

| ID | Requirement |
|----|-------------|
| NFR-COMPAT-1 | Display MUST run in Chrome Kiosk mode on Windows (Intel NUC). |
| NFR-COMPAT-2 | Backend MUST run on Linux via Docker. |
| NFR-COMPAT-3 | Nginx MUST reverse-proxy HTTP + WebSocket (upgrade) traffic. |
| NFR-COMPAT-4 | System MUST operate on-premise without dependence on external hosting (beyond Google APIs). |
| NFR-COMPAT-5 | Time synchronization (NTP) MUST be assumed and required on servers and NUCs. |

---

## 11. Data & Consistency

| ID | Requirement |
|----|-------------|
| NFR-DATA-1 | Google Calendar is authoritative; local cache is eventually consistent with a bounded staleness target (≤ sync interval). |
| NFR-DATA-2 | Check-in/no-show/analytics data (PostgreSQL) MUST be strongly consistent within the app. |
| NFR-DATA-3 | Database MUST support transactions for check-in and booking-record writes. |
| NFR-DATA-4 | Backups of PostgreSQL MUST be scheduled (on-prem policy). |

---

## 12. Configurability

| ID | Requirement |
|----|-------------|
| NFR-CONF-1 | Sites, rooms, capacity, facilities MUST be configurable at runtime via Admin Panel. |
| NFR-CONF-2 | Status timing windows (Starting Soon lead, no-show grace) SHOULD be configurable. |
| NFR-CONF-3 | Sync interval SHOULD be configurable. |
| NFR-CONF-4 | Feature toggles SHOULD allow enabling/disabling optional integrations (e.g., Zoom). |

---

## 13. Internationalization (Forward-looking)

| ID | Requirement |
|----|-------------|
| NFR-I18N-1 | UI strings SHOULD be externalized to support future localization (EN/ID). |
| NFR-I18N-2 | Date/time display MUST respect a configurable timezone per site. |

---

## 14. Compliance & Auditability

| ID | Requirement |
|----|-------------|
| NFR-AUDIT-1 | All administrative actions MUST be auditable (who/what/when). |
| NFR-AUDIT-2 | Log retention period MUST be defined and enforced (pending stakeholder input — see PRD open question). |

---

## 15. Verification Summary

| Category | Primary Verification Method |
|----------|-----------------------------|
| Performance/Scalability | Load & latency testing, benchmarks |
| Availability/Reliability | Fault-injection, reconnect tests |
| Security/Privacy | Threat review, pen-test, config review |
| Usability/Accessibility | Heuristic review + manual assistive-tech testing |
| Maintainability | CI gates, code review, coverage |
| Observability | Log/metric inspection, health checks |

---

*End of NFR.*
