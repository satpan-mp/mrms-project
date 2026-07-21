# Operations Guide

> **Purpose:** Day-2 operations for running MRMS in production.
> **Scope:** Routine ops, common procedures, and escalation paths.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Deployment Guide](./deployment-guide.md), [Monitoring Guide](./monitoring-guide.md), [Maintenance Guide](./maintenance-guide.md), [Disaster Recovery](../DISASTER-RECOVERY.md), [Release Management](../process/release-management.md), [Google Workspace Integration Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md)
> **References:** -

## Responsibilities

Operations keeps MRMS healthy across all sites: monitor health, respond to alerts,
run backups/restore drills, manage devices, and execute deployments/rollbacks.

## Routine Operations

| Activity | How | Reference |
|----------|-----|-----------|
| Monitor health | Dashboards + alerts | [Monitoring Guide](./monitoring-guide.md) |
| Deploy a release | Compose prod overrides, pinned tags | [Deployment Guide](./deployment-guide.md), [Release Mgmt](../process/release-management.md) |
| Back up / restore | Scheduled backups + drills | [Disaster Recovery](../DISASTER-RECOVERY.md) |
| Maintain / patch | Cadence tasks | [Maintenance Guide](./maintenance-guide.md) |
| Manage rooms/sites/devices | Admin Panel | [PRD](../01-PRD-Product-Requirement-Document.md) |
| Trigger/inspect sync | Admin sync status | [Google Guide](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md) |
| Broadcast announcement | Admin Panel | [FRS ANN](../02-FRS-Functional-Requirement-Specification.md) |

## Common Procedures

### Onboard a new room
1. Create the room in the Admin Panel with its Google Resource ID, capacity,
   facilities, site.
2. Provision a device token; configure the NUC kiosk with the Display URL
   ([kiosk setup](../../infrastructure/kiosk/chrome-kiosk.md)).
3. Verify heartbeat, realtime updates, and Meet/Zoom permissions.

### Put a room into maintenance
- Toggle maintenance in the Admin Panel; the display shows the maintenance state
  and booking is disabled.

### Respond to a device-offline alert
- Follow [Display Client Recovery](../DISPLAY-CLIENT-RECOVERY.md) (power/network/
  Chrome/NUC checks; reimage if needed).

### Handle a sync failure
- Check admin sync status + logs; most issues auto-recover (poll convergence). For
  persistent failures see [Google Guide §11](../GOOGLE-WORKSPACE-INTEGRATION-GUIDE.md).

## Incident Management

1. Detect (alert/report) -> declare + assign owner.
2. Triage severity; communicate status.
3. Mitigate/recover using the relevant runbook
   ([Disaster Recovery](../DISASTER-RECOVERY.md) /
   [DR quick ref](./disaster-recovery-guide.md)).
4. Verify core flows; close the incident.
5. Post-incident review; log actions in the backlog + [Risk Register](../RISK-REGISTER.md).

## Change Management

- Production changes follow [Release Management](../process/release-management.md)
  (approval flow, RC checklist, rollback). Significant changes require an
  [RFC](../rfc/README.md).
