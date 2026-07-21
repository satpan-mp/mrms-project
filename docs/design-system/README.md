# MRMS Design System

> **Purpose:** Index and configuration for the MRMS design system and UI/UX workflow.
> **Scope:** All frontend work (Display kiosk + Admin panel) and shared UI library.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Frontend Architecture](../15-Frontend-Architecture.md), [UI/UX Wireframe](../13-UIUX-Wireframe.md), [Component Hierarchy](../14-Component-Hierarchy.md), [ADR-003 React](../adr/ADR-003-why-react.md), [Docs index](../README.md)
> **References:** UI/UX Pro Max Design Intelligence (installed - see below)

This is the single source of truth for MRMS visual and interaction design. It is
powered by the **UI Pro Max Design Intelligence** skill (installed into
`.kiro/steering/`) and tailored to the approved MRMS architecture.

## 1. Design Principles (configured for MRMS)

| Principle | How it applies to MRMS |
|-----------|------------------------|
| Enterprise Software | Reliable, information-dense admin; professional restraint |
| Corporate Design | PT Mitra Prodin identity; consistent, trustworthy |
| Google Workspace Style | Google Meet-inspired palette, Inter typography, Material-like motion |
| Minimalist | Clean hierarchy, generous whitespace, no clutter |
| Accessibility First | WCAG 2.1 AA (AAA where feasible); never color-only meaning |
| Responsive | Mobile → desktop → Smart TV; fluid scaling |
| Kiosk Mode | Zero-interaction, glanceable room display on the NUC/TV |
| Dashboard Oriented | KPI cards, live grids, status at a glance |
| Large Screen Optimization | TV-readable typography and spacing at distance |
| Clean Information Hierarchy | Clear primary/secondary/tertiary emphasis |

## 2. Documents in this Pack

| Document | Purpose |
|----------|---------|
| [UI Pro Max Installation](./UIPRO-INSTALLATION.md) | Install record, version, config, dependencies |
| [Design System](./DESIGN-SYSTEM.md) | Color, typography, iconography, grid, spacing, radius, elevation, motion, breakpoints, states |
| [Design Tokens](./DESIGN-TOKENS.md) | Three-layer tokens (primitive/semantic/component) + dark mode + Tailwind mapping |
| [Component Standards](./COMPONENT-STANDARDS.md) | Reusable component specs (button, card, room card, timeline, etc.) |
| [Dashboard Standards](./DASHBOARD-STANDARDS.md) | Display (TV), Admin, Monitoring, Analytics layouts |
| [UX Standards](./UX-STANDARDS.md) | Booking, check-in, Meet launch, error, offline, reconnection, loading, notifications |
| [Accessibility](./ACCESSIBILITY.md) | WCAG 2.1 AA, keyboard, contrast, focus, typography |
| [UI Review Workflow](./UI-REVIEW-WORKFLOW.md) | Mandatory 7-step gate before implementing any screen |

## 3. Stack Alignment

The design system targets the approved stack (ADR-003): **React + TypeScript +
Vite + TailwindCSS**, implemented with **shadcn/ui** components + CSS variables,
consumed by both SPAs via the shared `@mrms/ui` package
([Frontend Architecture](../15-Frontend-Architecture.md)). Tokens are expressed as
CSS variables (HSL) mapped into Tailwind, per the UI/UX Pro Max
`design-system` and `ui-styling` guidance.

## 4. Governance

- All frontend work follows the [UI Review Workflow](./UI-REVIEW-WORKFLOW.md);
  **no screen is implemented without passing the review**.
- Changes to tokens/standards go through the normal
  [RFC](../rfc/README.md)/[Decision Log](../decisions/README.md) process when they
  affect architecture or product behavior; otherwise a PR updating this pack.
- The skill's recommendations are advisory; where they conflict with a documented
  MRMS decision or the architecture, **MRMS docs take precedence**
  (see [Installation §5](./UIPRO-INSTALLATION.md)).
