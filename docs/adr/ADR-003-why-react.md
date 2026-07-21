# ADR-003: Why React + TypeScript + Vite for the frontends

> **Purpose:** Record the frontend framework and tooling choice.
> **Scope:** Display (kiosk) SPA and Admin SPA.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Frontend Architecture](../15-Frontend-Architecture.md), [Component Hierarchy](../14-Component-Hierarchy.md), [UI/UX Wireframe](../13-UIUX-Wireframe.md)
> **References:** [React docs](https://react.dev/), [Vite docs](https://vitejs.dev/)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Architecture team

## Context

MRMS ships two SPAs: a fullscreen kiosk display (runs 24/7 on Intel NUC Chrome)
and an admin panel. Both need real-time updates, a shared component library, and
strong typing. The Master Brief mandates React + TypeScript + Vite + TailwindCSS.

## Problem

Which frontend stack gives us a productive, strongly-typed, real-time-capable UI
with fast builds and a shared component library across two apps?

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **React + TS + Vite** | Huge ecosystem, mature real-time patterns (React Query + Socket.IO), fast HMR/builds via Vite, easy monorepo sharing, TV-friendly | Requires discipline to avoid over-rendering on kiosk |
| Vue + Vite | Good DX, Vite-native | Smaller enterprise component ecosystem for our needs; team familiarity |
| Angular | Batteries-included, TS-first | Heavier; slower iteration; more than needed for two focused SPAs |
| Svelte/SvelteKit | Lean output | Smaller ecosystem; fewer ready components for enterprise/TV UI |

## Decision

Adopt **React + TypeScript + Vite + TailwindCSS**. It is mandated, has the richest
ecosystem for our real-time and shared-UI needs, and Vite provides fast builds and
first-class monorepo package sharing (`@mrms/ui`, `@mrms/api-client`,
`@mrms/realtime`).

## Consequences

- **Positive:** Shared component library and typed API/realtime clients across
  Display and Admin; fast builds; large hiring pool.
- **Negative / trade-offs:** Kiosk longevity demands careful effect/subscription
  cleanup to avoid memory leaks (captured in coding standards).
- **Neutral:** Static output served by Nginx.

## Future Considerations

If a future touch/booking panel or mobile app is added (roadmap), React Native or
a shared design-system package can reuse the tokens defined in `@mrms/ui`.
