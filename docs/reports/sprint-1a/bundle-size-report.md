# Bundle Size Report — Sprint 1A

> **Purpose:** Record production bundle sizes for the two SPAs and set initial budgets.
> **Scope:** `apps/admin` and `apps/display` Vite production builds.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21
> **Related Documents:** [Frontend Architecture](../../15-Frontend-Architecture.md), [NFR](../../03-NFR-Non-Functional-Requirements.md)
> **Source:** `pnpm -r build` (Vite production build)

---

## 1. Results

Primary JS entry chunk per SPA (production build):

| App | Entry chunk | Raw | Gzip |
|-----|-------------|----:|-----:|
| `@mrms/display` | `assets/index-*.js` | 256.53 kB | 84.83 kB |
| `@mrms/admin` | `assets/index-*.js` | 285.63 kB | 94.60 kB |

- Module graph per build: ~4,702 modules transformed.
- Both builds completed without warnings about chunk-size limits.

> These are the main entry chunks. CSS and any code-split vendor chunks are
> additional but small at this foundation stage (no heavy feature routes yet).

## 2. Assessment

For a foundation build that already includes React, React Router, React Query,
Axios, the shared `@mrms/ui` design system, and theming, a **~85–95 kB gzip**
entry is reasonable. The Admin bundle is slightly larger than Display, consistent
with its richer intended surface (forms, tables, admin widgets).

There is no user-facing latency NFR on bundle size directly, but small bundles
support the display kiosk experience (NFR-USE-1/6) and fast admin loads.

## 3. Budgets (initial, to enforce in later sprints)

| App | Metric | Budget (gzip) | Rationale |
|-----|--------|--------------:|-----------|
| Display | entry JS | ≤ 150 kB | Kiosk device, keep light; lazy-load non-essential views. |
| Admin | entry JS | ≤ 180 kB | Desktop app; allow more, but code-split feature routes. |

## 4. Recommendations

- Introduce route-level code splitting (`React.lazy`) as feature routes are added, so the entry chunk stays flat.
- Add a manual `manualChunks` split for vendor libraries once feature code grows.
- Wire a bundle-size check into CI (e.g., size-limit or `vite build` chunk warnings) — tracked as a follow-up in the [technical backlog](../../backlog/technical-backlog.md).
- Re-measure each sprint; append a row here to track drift over time.

## 5. History

| Date | Sprint | Display (gzip) | Admin (gzip) | Notes |
|------|--------|---------------:|-------------:|-------|
| 2026-07-21 | 1A | 84.83 kB | 94.60 kB | Foundation baseline. |

---

*End of Bundle Size Report.*
