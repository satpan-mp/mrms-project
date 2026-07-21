# Dashboard Standards

> **Purpose:** Layout standards for the four MRMS surfaces - Display Client (Smart TV), Admin Panel, Monitoring Dashboard, Analytics Dashboard - covering spacing, alignment, visual hierarchy, and responsive behavior.
> **Scope:** Display and Admin SPAs.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Component Standards](./COMPONENT-STANDARDS.md), [UX Standards](./UX-STANDARDS.md), [UI/UX Wireframe](../13-UIUX-Wireframe.md), [Display Client guide](../guides/), [Frontend Architecture](../15-Frontend-Architecture.md)
> **References:** UI/UX Pro Max (dashboard/metrics layouts, chart types)

Shared rules: 4/8px spacing rhythm; clear hierarchy (primary KPI → supporting →
detail); align to a consistent grid; content within safe area; responsive per
[Design System §9](./DESIGN-SYSTEM.md). Charts use a real chart lib (Recharts/Chart.js),
never color-only, with labels/legends and accessible summaries.

---

## 1. Display Client (Smart TV / Kiosk)

**Context:** wall-mounted TV outside/for a room (NUC + Chrome kiosk), viewed from
several meters, **zero interaction**, always-on. Optimize for glanceability and
burn-in avoidance.

**Layout (fixed, no scroll, `tv-hd`/`tv-4k` tiers):**
```
┌──────────────────────────────────────────────┐
│ HEADER BAND: logo · room/area name · ⏰ clock  │  ~12% height
├──────────────────────────────────────────────┤
│                                                │
│   ROOM NAME (48-56px)                          │
│   ┌────────────────────────────────────────┐  │
│   │  BIG STATUS BANNER (color + icon + text)│  │  ~30-40% — dominant
│   └────────────────────────────────────────┘  │
│   Now: <current meeting / "Available">         │
│   Next: <time · title · organizer>             │
│                                                │
├──────────────────────────────────────────────┤
│ TODAY'S SCHEDULE (next 3-5 slots, large rows)  │  ~30%
├──────────────────────────────────────────────┤
│ ANNOUNCEMENT / connection + last-sync footer   │  ~8%
└──────────────────────────────────────────────┘
```

- **Hierarchy:** room status is the single dominant element (full-width banner in the
  status color). Typography per [Design System §2.2](./DESIGN-SYSTEM.md) (large).
- **Spacing:** generous - large multiples of the 8px scale (24/32/48/64); wide safe
  margins (≥ 3-5% of viewport) to survive TV overscan.
- **Alignment:** centered room identity + status; left-aligned schedule rows.
- **Color:** whole-screen tint or banner reflects status (green/red/amber/gray/blue).
  High contrast; dark theme option to reduce glare/burn-in; avoid large pure-white
  fills for long dwell.
- **Motion:** clock ticks each second; status transitions fade ≤ 200ms; "Starting
  Soon" gentle pulse (reduced-motion aware). No layout shifts.
- **Resilience:** persistent connection indicator + "updated HH:MM:SS"; degraded/
  offline state shown per [UX Standards §5-6](./UX-STANDARDS.md). No controls, no
  cursor.
- **Responsive:** scales across 1080p → 4K via larger root font + `clamp()`; portrait
  TV variant stacks the same regions.

---

## 2. Admin Panel

**Context:** desktop-first management app (rooms, bookings, users, settings) for
staff. Information-dense but calm.

**Layout:**
```
┌── Top bar: breadcrumb · search · theme · user ──────────┐
├────────┬────────────────────────────────────────────────┤
│ Side   │ Page title + primary action (right)             │
│ nav    │ ─ Filters / toolbar ─                           │
│ (coll- │ Content: table / cards / form                   │
│ apsible)│ (12-col grid, max 1280px, wider for tables)    │
└────────┴────────────────────────────────────────────────┘
```

- **Hierarchy:** page title top-left, primary action top-right; one primary action
  per page; secondary actions in toolbars/row menus.
- **Spacing:** page gutters 24-32px; card/section gaps 24px; form field rhythm 16px;
  table cell padding 12x16.
- **Alignment:** labels left; numeric table columns right; status centered; actions
  right. Consistent column across related pages.
- **Data:** tables get sort, filter, pagination, row selection, empty/loading/error
  states (§Component Standards §12). Forms follow [UX Standards §1](./UX-STANDARDS.md).
- **Responsive:** sidebar → icon rail < `lg`, → drawer on mobile; tables become
  stacked cards or horizontal-scroll on small screens; primary target `xl`.

---

## 3. Monitoring Dashboard

**Context:** near-real-time operational view - device/display health, room states,
active meetings; for facilities/IT. Answer "is anything wrong right now?" instantly.

**Layout:**
```
┌ KPI strip: Rooms Available · Occupied · Displays Online · Alerts ┐  (metric cards)
├──────────────────────────────────────────────────────────────────┤
│ Room status grid (RoomCards)      │ Alerts / offline devices feed  │
│ colored by live status            │ (most urgent first)            │
├──────────────────────────────────────────────────────────────────┤
│ Live meetings / heartbeat table (device · last seen · state)      │
└──────────────────────────────────────────────────────────────────┘
```

- **Hierarchy:** KPI strip first (4 metric cards, `stagger`); problems (alerts,
  offline) visually prioritized - use error/warning tokens + icon + count.
- **Live updates:** poll/stream; new state animates subtly (≤ 200ms), no jank; show
  "last updated"; `aria-live="polite"` for status changes, `assertive` for new
  critical alerts. Stale data flagged if the feed drops.
- **Spacing/alignment:** metric cards equal width, 16-24px gap; grid aligned; counts
  right-aligned within cards.
- **Responsive:** KPI strip 4 → 2 → 1 columns; side-by-side grid/feed stack vertically
  < `lg`.

---

## 4. Analytics Dashboard

**Context:** historical insight - utilization, occupancy trends, no-show rates, peak
hours, popular rooms; for managers. Answer "how are rooms being used over time?".

**Layout:**
```
┌ Filters: date range · building/floor · room ─────────────┐
├ KPI summary: Utilization% · Avg duration · No-show% · Peak ┤  (metric cards)
├───────────────────────────────────────────────────────────┤
│ Trend (line/area over time)     │ Occupancy by hour (bar)   │
├───────────────────────────────────────────────────────────┤
│ Room ranking (bar/table)        │ Breakdown (donut + legend)│
└───────────────────────────────────────────────────────────┘
```

- **Chart selection:** trends → line/area; comparisons → bar; part-to-whole → donut
  (with legend + values, not color-only); rankings → horizontal bar or table.
  Per UI/UX Pro Max chart guidance.
- **Hierarchy:** filters + KPI summary first; charts below in a 2-col grid; each chart
  has a title, axis labels, units, and a one-line takeaway.
- **Accessibility:** every chart has a text/table alternative or `aria` summary;
  never rely on color alone (use labels/patterns); tokenized series colors with
  sufficient contrast, consistent across charts.
- **Spacing/alignment:** consistent chart card sizing; 24px gaps; numbers right-aligned
  in tables; empty/loading (skeleton chart) states defined.
- **Responsive:** 2-col chart grid → 1-col < `lg`; filters wrap; charts keep min
  height for legibility; export/print-friendly layout optional.

---

## Definition of Done (per dashboard)

- [ ] Clear primary → secondary → detail hierarchy; one primary action (Admin)
- [ ] 4/8px spacing rhythm; consistent alignment/grid; safe margins
- [ ] Loading (skeleton), empty, and error states for every data region
- [ ] Live regions announce updates (Monitoring/Display); charts have accessible
      alternatives (Analytics)
- [ ] Responsive behavior verified incl. TV tier (Display); both themes verified
- [ ] Not color-only anywhere; contrast targets met
