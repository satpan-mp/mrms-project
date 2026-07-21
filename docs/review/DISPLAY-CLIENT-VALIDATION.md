# Display Client Validation

> **Purpose:** Validate the room display (Intel NUC + Chrome kiosk) for operational readiness and recovery.
> **Scope:** Kiosk, auto-login/start, auto-recovery, offline cache, reconnect, crash recovery, Meet/Zoom return flows.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin (acting Frontend/Field Engineer)
> **Last Updated:** 2026-07-20
> **Related Documents:** [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md), [Google Meet Integration Flow](../11-Google-Meet-Integration-Flow.md), [Frontend Architecture](../15-Frontend-Architecture.md), [Kiosk setup](../../infrastructure/kiosk/chrome-kiosk.md), [Sequence Diagrams](./SEQUENCE-DIAGRAMS.md)
> **References:** -

This is a **validation report** against the canonical display recovery and
conferencing designs. It confirms readiness and lists field-verification items.

## Validation Matrix

| Capability | Designed? | Assessment | Field verification (P6/P9) |
|------------|:---------:|------------|-----------------------------|
| Chrome Kiosk mode | Yes | PASS - kiosk flags documented | Verify fullscreen + no chrome UI on NUC |
| Auto login | Yes | PASS - dedicated low-priv user | Verify unattended boot |
| Auto start (Chrome -> Display URL) | Yes | PASS - startup task + room/token in URL | Verify after power cycle |
| Auto recovery (relaunch on crash) | Yes | PASS - Chrome relaunch policy | Kill Chrome; confirm relaunch |
| Offline cache | Yes | PASS - last-known schedule + staleness banner | Pull network; confirm banner + data |
| Reconnect (WS backoff + resync) | Yes | PASS - exponential backoff, resync on reconnect | Restore network; confirm fresh state |
| Crash recovery (NUC restart) | Yes | PASS - auto-login chain + reimage path | Reboot NUC; confirm display returns |
| Google Meet return flow | Yes | PASS - backend `meeting.finished` (+ grace) drives close | Verify window closes at end |
| Zoom return flow | Yes | PASS - same end-time-driven return | Verify Zoom window handling |
| Camera/mic pre-grant | Yes | PASS - enterprise policy for Meet/Zoom origins | Confirm no permission prompt |
| Popups allowed (Meet/Zoom) | Yes | PASS - kiosk popup policy | Confirm join opens new window |
| Local clock accuracy | Yes | PASS - NTP-backed local tick | Confirm drift <= 1s |
| Device heartbeat/telemetry | Yes | PASS - agent posts every 30s | Confirm telemetry in admin dashboard |

## Key Confirmations

- **Zero-interaction** display: renders status/schedule without input, updates in
  realtime, and degrades gracefully to cached data + banner on any outage (D-005).
- **Return-to-display** is authoritatively driven by the backend scheduled end
  time (+ grace), not by an unreliable Meet/Zoom "ended" signal (D-006).
- **Self-healing:** Chrome/NUC crash recovers via the auto-login/auto-start chain;
  offline devices are detected by heartbeat and alerted.

## Open Items (field verification, non-blocking now)

1. Validate the **NUC provisioning image** (auto-login + kiosk + agent + policies)
   on real hardware in Sprint 6 / Sprint 9.
2. Confirm **camera/mic and popup enterprise policies** for Meet/Zoom origins on
   the kiosk profile.
3. Confirm **cross-site network** reachability from NUC to backend (ties to
   IB-013 / Architecture Review W-4).
4. Verify **memory stability** over 24-72h continuous kiosk operation (no leaks).

## Verdict

**PASS - Ready (design).** All recovery scenarios are designed and documented.
Remaining items are on-hardware field verifications scheduled in P2/P5/P6/P9, not
design gaps.
