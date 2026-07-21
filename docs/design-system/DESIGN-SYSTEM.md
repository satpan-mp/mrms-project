# Design System

> **Purpose:** The visual foundation of MRMS - color, typography, iconography, grid, spacing, radius, elevation, motion, breakpoints, and component states.
> **Scope:** Display (kiosk/TV) and Admin SPAs and the shared `@mrms/ui` library.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design Tokens](./DESIGN-TOKENS.md), [Component Standards](./COMPONENT-STANDARDS.md), [Accessibility](./ACCESSIBILITY.md), [UI/UX Wireframe](../13-UIUX-Wireframe.md), [PRD status model](../01-PRD-Product-Requirement-Document.md)
> **References:** UI/UX Pro Max ("Trust & Authority" enterprise style, Inter typography)

Design language: **Google Workspace / Google Meet-inspired**, enterprise,
minimal, accessible, dashboard-oriented, and TV-optimized. Full **light and dark**
support.

## 1. Color Palette

### 1.1 Brand & Interaction

| Role | Light | Dark | Notes |
|------|-------|------|-------|
| Primary (Google Blue) | `#1A73E8` | `#8AB4F8` | CTAs, links, active nav |
| Primary hover | `#1B66C9` | `#AECBFA` | |
| Primary active | `#185ABC` | `#669DF6` | |
| On primary | `#FFFFFF` | `#202124` | Text/icon on primary |

### 1.2 Room Status (semantic - from PRD status model)

Status is conveyed by **color + icon + label** (never color alone).

| Status | Light | Dark | Icon (suggested) |
|--------|-------|------|------------------|
| 🟢 Available | `#1E8E3E` | `#81C995` | check-circle |
| 🔴 Occupied | `#D93025` | `#F28B82` | dot-filled / users |
| 🟡 Starting Soon | `#F9AB00` | `#FDD663` | clock (dark text on amber) |
| ⚪ Maintenance | `#5F6368` | `#9AA0A6` | wrench |
| 🔵 Reserved | `#1A73E8` | `#8AB4F8` | calendar |

### 1.3 Feedback / Semantic

| Role | Light | Dark |
|------|-------|------|
| Success | `#1E8E3E` | `#81C995` |
| Warning | `#F9AB00` | `#FDD663` |
| Error / Destructive | `#D93025` | `#F28B82` |
| Info | `#1A73E8` | `#8AB4F8` |

### 1.4 Neutrals (Google grey scale)

| Role | Light | Dark |
|------|-------|------|
| Background | `#FFFFFF` | `#202124` |
| Surface (card) | `#F8F9FA` | `#292A2D` |
| Surface elevated | `#FFFFFF` | `#35363A` |
| Border / Divider | `#DADCE0` | `#3C4043` |
| Text primary | `#202124` | `#E8EAED` |
| Text secondary | `#5F6368` | `#9AA0A6` |
| Text disabled | `#9AA0A6` | `#5F6368` |

### 1.5 Contrast Rules

- Body text ≥ **4.5:1**; large text (≥ 18px bold / 24px) ≥ **3:1**; UI/icons ≥ 3:1.
- Amber (`#F9AB00`) requires **dark** foreground text (`#202124`), never white.
- All pairs validated in both themes (see [Accessibility](./ACCESSIBILITY.md)).

## 2. Typography

- **Family:** `Inter` (UI + headings + body), monospace `JetBrains Mono` for
  code/IDs. Inter is the enterprise/dashboard recommendation and pairs with the
  Google Workspace aesthetic.
- Load: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`.
- Weights: 400 regular, 500 medium (labels/nav), 600 semibold (headings/buttons),
  700 bold (display).

### 2.1 Type Scale (Admin / desktop base 16px)

| Token | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| display | 48px | 1.1 | 700 | Page hero (rare) |
| h1 | 36px | 1.2 | 700 | Page title |
| h2 | 28px | 1.25 | 600 | Section |
| h3 | 22px | 1.3 | 600 | Subsection |
| h4 | 18px | 1.35 | 600 | Card title |
| body-lg | 18px | 1.6 | 400 | Emphasis body |
| body | 16px | 1.5 | 400 | Default |
| small | 14px | 1.5 | 400 | Secondary |
| caption | 12px | 1.4 | 400/500 | Meta, labels |

### 2.2 Display (Smart TV / Kiosk) scale

The room display is viewed from across the room; type scales up via a larger root
and `clamp()` (TV tier, see §9).

| Element | Target on 1080p TV |
|---------|--------------------|
| Realtime clock | 64-96px, 700 |
| Room name | 40-56px, 700 |
| Big status pill label | 32-44px, 600 |
| Current/next meeting title | 28-36px, 600 |
| Schedule row | 22-28px, 400/500 |
| Meta (organizer/participants) | 18-22px, 400 |

Minimum readable body on TV ≥ **18px** (scaled). Avoid thin weights (< 400) at
distance.

## 3. Iconography

- **Vector icons only** (no emoji as structural icons). Primary set: **Phosphor**
  (`@phosphor-icons/react`); fallback **Lucide/Heroicons** for gaps - keep one
  style/stroke per hierarchy level.
- Sizes as tokens: `icon-sm 16`, `icon-md 20`, `icon-lg 24`, `icon-tv 32-48`.
- Stroke consistency (1.5-2px); outline vs filled discipline per hierarchy.
- Icons paired with text/`aria-label`; touch/click targets ≥ 44px.
- Status colors from §1.2 applied to status icons.

## 4. Grid System

- **Admin:** 12-column fluid grid within a centered container (max content width
  `1280px`, wider dashboards up to `1536px`); gutters scale by breakpoint
  (16 → 24 → 32px).
- **Display (kiosk):** fixed, no-scroll composition - header band, room identity +
  big status, current/next cards, today's schedule, announcement banner
  ([Dashboard Standards](./DASHBOARD-STANDARDS.md)).
- Card grids: 1 → 2 → 3 → 4 columns across breakpoints.

## 5. Spacing System

4px base (8px rhythm). Tokens:

| Token | px | Token | px |
|-------|----|-------|----|
| space-0 | 0 | space-4 | 16 |
| space-0.5 | 2 | space-5 | 20 |
| space-1 | 4 | space-6 | 24 |
| space-2 | 8 | space-8 | 32 |
| space-3 | 12 | space-12 | 48 |
| | | space-16 | 64 |

Component padding uses `space-3/4`; section spacing `space-6/8`; page gutters
`space-4/6/8` by breakpoint. TV surfaces use larger multiples.

## 6. Border Radius

| Token | px | Use |
|-------|----|-----|
| radius-sm | 4 | inputs, small chips |
| radius-md | 8 | buttons, cards (default) |
| radius-lg | 12 | large cards, dialogs |
| radius-xl | 16 | modals, hero cards |
| radius-full | 9999 | pills, status chips, avatars |

## 7. Elevation (Shadows)

Material-like elevation; dark mode uses subtler shadows + border separation.

| Token | Use | Light shadow |
|-------|-----|--------------|
| elevation-0 | flat (dividers only) | none |
| elevation-1 | cards | `0 1px 2px rgb(0 0 0 / .06), 0 1px 3px rgb(0 0 0 / .10)` |
| elevation-2 | raised card / dropdown | `0 4px 6px -1px rgb(0 0 0 / .10)` |
| elevation-3 | popover / sticky bar | `0 10px 15px -3px rgb(0 0 0 / .10)` |
| elevation-4 | dialog / modal | `0 20px 25px -5px rgb(0 0 0 / .12)` |

In dark mode, prefer border + surface-elevated color over heavy shadows.

## 8. Motion Guidelines

- Durations: `fast 150ms` (color/hover), `normal 200ms` (transform/enter),
  `slow 300ms` (overlays). Nothing > 400ms for micro-interactions.
- Easing: standard `cubic-bezier(0.2, 0, 0, 1)` (Material standard); decelerate on
  enter, accelerate on exit (exit slightly faster than enter).
- **Respect `prefers-reduced-motion`**: disable non-essential animation; keep
  instant state changes.
- Kiosk: the realtime clock updates every second; status changes animate subtly
  (fade/slide ≤ 200ms). No layout-shifting press states.
- Status pulse (Starting Soon) is a gentle opacity pulse, disabled under reduced
  motion.

## 9. Responsive Breakpoints

| Token | Min width | Target |
|-------|-----------|--------|
| base | 0 | small phone (test 375px) |
| sm | 640px | large phone |
| md | 768px | tablet |
| lg | 1024px | laptop / small desktop |
| xl | 1280px | desktop (admin default) |
| 2xl | 1536px | large desktop |
| tv-hd | 1920px | Smart TV 1080p (display tier) |
| tv-4k | 3840px | Smart TV 4K (display tier) |

- Admin is mobile-first responsive; primary target `xl`.
- Display uses the `tv-hd`/`tv-4k` tiers with a larger root font + `clamp()` for
  fluid scaling across TV sizes.

## 10. Component States

Standard interactive states (priority: disabled > loading > active > focus > hover
> default). Full specs in [Component Standards](./COMPONENT-STANDARDS.md).

| State | Treatment |
|-------|-----------|
| default | base tokens |
| hover | color/opacity/elevation shift (150ms); no layout shift |
| focus-visible | 2px ring (`--color-ring`) + 2px offset; always visible for keyboard |
| active | darkest tone |
| selected | primary tint background + accent border |
| disabled | 50% opacity, `not-allowed`, non-interactive, `aria-disabled` |
| loading | spinner + reduced opacity, `aria-busy` |
| error | error border + ring; message below with icon |

## 11. Do / Don't (from skill anti-patterns)

- Do: high-contrast, minimal, badges/status with icon+label, smooth 150-300ms
  transitions, semantic tokens, both themes tested.
- Don't: emojis as icons, playful/cartoony styling, AI purple/pink gradients,
  color-only status, thin text on TV, layout-shifting hover.
