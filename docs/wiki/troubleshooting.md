# Troubleshooting

> **Purpose:** Diagnose and resolve common MRMS problems.
> **Scope:** Local dev, backend, sync, display, and deployment issues.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md), [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md), [Observability](../OBSERVABILITY.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Operations Guide](./operations-guide.md)
> **References:** -

Use the `correlationId` from an API error envelope to find the matching server
logs/traces ([Observability](../OBSERVABILITY.md)).

| Symptom | Likely cause | Where to look / fix |
|---------|--------------|---------------------|
| `docker compose up` service unhealthy | Port in use, bad env, volume perms | `docker compose logs <svc>`; check `.env`; free ports |
| API 401 on all requests | Missing/invalid/expired JWT | Re-login; verify JWT config; [Auth Flow](../12-Authentication-Flow.md) |
| Login rejected | Domain not allowed / OAuth misconfig | `GOOGLE_ALLOWED_DOMAINS`; OAuth client config ([Security](../SECURITY.md)) |
| Display blank / not updating | Kiosk/network/WS issue | [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md) |
| Display shows stale banner | Backend/Google unavailable | [Google Guide §11](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md); check sync status |
| Booking returns 409 | Time conflict on the room | Choose another slot; conflict is expected behavior |
| Booking returns 502 GOOGLE_CREATE_FAILED | Google API/creds/quota | Check creds/scopes/quota; retry (idempotency key) |
| Sync failing for a room | Invalid token / quota / outage | Admin sync status; logs; [Google Guide §11](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md) |
| Device shown OFFLINE | Missed heartbeats | Power/network/Chrome on NUC; [Display Recovery](../DISPLAY-CLIENT-RECOVERY.md) |
| Join Meet/Zoom does nothing | Popup blocked / permissions | Kiosk popup + cam/mic policy ([kiosk setup](../../infrastructure/kiosk/chrome-kiosk.md)) |
| Wrong meeting times | Timezone/clock drift | Confirm NTP; server-authoritative UTC; `Site.timezone` |
| CI `docker-build` fails | Dockerfile/context issue | Review Dockerfile + `.dockerignore`; check `docker/*.Dockerfile` |

## Escalation

If unresolved, capture logs + correlation IDs and consult the
[Operations Guide](./operations-guide.md) / [Disaster Recovery](../DISASTER-RECOVERY.md),
and open a Bug issue using the template.
