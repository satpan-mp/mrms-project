# Risk Register

> **Purpose:** Identify, assess, and plan mitigation/contingency for project risks.
> **Scope:** Technical, infrastructure, security, operational, and business risks across MRMS.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [PRD](01-PRD-Product-Requirement-Document.md), [NFR](03-NFR-Non-Functional-Requirements.md), [Disaster Recovery](DISASTER-RECOVERY.md), [Security Guide](SECURITY.md), [Google Workspace Integration Guide](GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [Display Client Recovery](DISPLAY-CLIENT-RECOVERY.md)
> **References:** -

## Scoring Model

- **Probability:** Low (1) / Medium (2) / High (3)
- **Impact:** Low (1) / Medium (2) / High (3)
- **Severity = Probability x Impact:** 1-2 Low, 3-4 Medium, 6-9 High
- **Status:** Open / Mitigating / Monitored / Closed

Owners are roles (to be assigned to named individuals at kickoff).

## Register

| ID | Description | Category | Prob. | Impact | Severity | Owner | Mitigation | Contingency | Status |
|----|-------------|----------|:-----:|:------:|:--------:|-------|------------|-------------|--------|
| R-01 | Google Calendar API quota/rate limits exceeded during sync | Technical/Integration | M | H | High (6) | Backend Lead | Incremental sync + watch channels; backoff+jitter; per-room job spacing; cache serves reads | Widen sync interval; prioritize active rooms; alert admin | Open |
| R-02 | Google API outage / unreachable | Infrastructure/External | L | H | Medium (3) | Backend Lead | Serve last-known cache; surface sync status; degraded banner | Manual refresh when restored; monitor status page | Open |
| R-03 | No edit/delete permission causes confusing cancellation UX | Product/Operational | M | M | Medium (4) | Product Owner | Clear UI copy directing to Google Calendar; sync reflects cancellations | User training; FAQ entry | Open |
| R-04 | Intel NUC offline / powered down | Infrastructure/Operational | M | M | Medium (4) | IT/Ops | Heartbeat monitoring; offline alerts; last-known schedule cached | On-site restart runbook; spare NUC | Open |
| R-05 | Chrome kiosk crash / escapes kiosk | Operational | M | M | Medium (4) | IT/Ops | Auto-restart policy; kiosk hardening; device agent detects Chrome-not-running | Remote/on-site restart; see Display Recovery guide | Open |
| R-06 | Clock drift on server or NUC skews status | Technical | L | H | Medium (3) | IT/Ops | Enforce NTP; server-authoritative status | Alert on drift; correct NTP | Open |
| R-07 | WebSocket scale-out issues under many displays | Technical/Performance | L | M | Low (2) | Backend Lead | Socket.IO Redis adapter; scoped channels; load test | Add API/gateway replicas; tune Redis | Open |
| R-08 | Secret leakage (tokens, keys, DB creds) | Security | L | H | Medium (3) | Security Owner | No secrets in VCS; secret store; scanning + push protection; encrypted tokens | Rotate/revoke immediately; incident response (see Secrets) | Open |
| R-09 | OAuth misconfiguration / domain restriction bypass | Security | L | H | Medium (3) | Security Owner | Verify id_token domain; least-privilege scopes; tested config | Disable logins; rotate client secret; re-configure | Open |
| R-10 | Compromised device token | Security | L | M | Low (2) | Security Owner | Room-scoped, hashed, revocable tokens; rotation | Revoke token; reprovision device | Open |
| R-11 | PostgreSQL data loss / corruption | Infrastructure/Data | L | H | Medium (3) | IT/Ops | Scheduled backups + PITR; volume on backed-up path | Restore from backup (RTO/RPO in DR doc) | Open |
| R-12 | Redis failure (cache/queue/pubsub) | Infrastructure | L | M | Low (2) | IT/Ops | Redis persistence (AOF); health checks | Restart; rebuild cache; sync re-runs jobs | Open |
| R-13 | Internet link failure at a site | Infrastructure | M | M | Medium (4) | IT/Ops | Cached display; local network to backend where possible | Failover link; display degraded mode | Open |
| R-14 | Server (Docker host) failure | Infrastructure | L | H | Medium (3) | IT/Ops | Health checks; documented recovery; backups | Rebuild host from images + restore DB volume | Open |
| R-15 | Timezone/multi-site handling errors | Technical | L | M | Low (2) | Backend Lead | Store UTC; per-site timezone; tests | Patch + re-render; verify per site | Open |
| R-16 | Scope creep delays sprints | Business/Project | M | M | Medium (4) | Product Owner | DoR gate; backlog discipline; RFC for changes | Re-prioritize; move to future improvements | Open |
| R-17 | Key-person dependency / bus factor | Business/Operational | M | M | Medium (4) | Eng Manager | Documentation-first; code review; shared ownership | Cross-train; onboarding via wiki | Open |
| R-18 | Google Meet/Zoom launch fails on kiosk (popups/permissions) | Operational | M | M | Medium (4) | IT/Ops | Pre-grant cam/mic; allow popups for Meet/Zoom domains via policy | On-site fix; fallback to manual join | Open |
| R-19 | Watch-channel expiry missed -> stale display | Technical/Integration | L | M | Low (2) | Backend Lead | Renew before expiry; polling fallback guarantees convergence | Force resync; alert | Open |
| R-20 | Insufficient test coverage on critical flows (booking/check-in) | Technical/Quality | M | H | High (6) | QA Lead | Coverage targets; contract tests; CI gates | Add regression tests; block release | Open |
| R-21 | Performance below NFR targets under load | Technical/Performance | L | M | Low (2) | Backend Lead | Benchmarks; load/stress tests in P8 | Profile + optimize; scale replicas | Open |
| R-22 | Accessibility gaps on TV/admin UI | Product/Quality | M | L | Low (2) | Frontend Lead | Contrast/typography standards; manual a11y testing | Remediate flagged issues | Open |
| R-23 | Dependency/supply-chain vulnerability | Security | M | M | Medium (4) | Security Owner | Pinned versions; Dependabot; audit in CI | Patch/upgrade; hotfix release | Open |
| R-24 | Backup not restorable (untested) | Operational/Data | L | H | Medium (3) | IT/Ops | Periodic restore drills (DR doc) | Escalate; reconstruct from Google cache where possible | Open |

## Review Cadence

- Reviewed at each sprint boundary and whenever a new RFC introduces risk.
- New risks introduced by an RFC must be added here and referenced from the RFC's
  Risks section.
- High-severity risks (>=6) require an explicit mitigation owner and are tracked
  in the [Technical/Infrastructure Backlog](backlog/README.md).
