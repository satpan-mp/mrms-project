# Component Standards

> **Purpose:** Standards for reusable MRMS UI components - anatomy, variants, sizes, states, and accessibility.
> **Scope:** Shared `@mrms/ui` library consumed by Display and Admin SPAs.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Design Tokens](./DESIGN-TOKENS.md), [Accessibility](./ACCESSIBILITY.md), [Dashboard Standards](./DASHBOARD-STANDARDS.md), [Component Hierarchy](../14-Component-Hierarchy.md)
> **References:** UI/UX Pro Max (component-specs, states-and-variants); shadcn/ui + Radix primitives

## Conventions (apply to every component)

- Built on **shadcn/ui + Radix** primitives; styled with Tailwind + tokens
  ([Design Tokens](./DESIGN-TOKENS.md)). No hardcoded hex/spacing.
- All interactive elements: `focus-visible` ring (2px + 2px offset), `cursor-pointer`,
  150-300ms transitions, `prefers-reduced-motion` respected, target ≥ 44px.
- State priority: disabled > loading > active > focus > hover > default.
- Never rely on **color alone** - pair with icon/text/shape.
- Both light and dark themes verified. Icons are Phosphor vector (no emoji).

---

## 1. Button

**Variants:** `default` (primary), `secondary`, `outline`, `ghost`, `link`,
`destructive`. **Sizes:** `sm 32px`, `default 40px`, `lg 48px`, `icon 40px`,
`tv` (≥ 56px, for kiosk/large-screen touch).

| State | Treatment |
|-------|-----------|
| default | variant tokens |
| hover | darker bg / accent bg (150ms) |
| active | darkest tone |
| focus-visible | ring `--color-ring` |
| disabled | opacity .5, `not-allowed`, `aria-disabled` |
| loading | leading spinner, `aria-busy`, label retained, non-interactive |

Anatomy: `[leading icon] Label [trailing icon]`. Icon-only buttons require
`aria-label`. One primary button per view/section.

---

## 2. Card

Container for grouped content. **Variants:** `default` (surface + border +
elevation-1), `elevated` (elevation-2, hover elevation-3), `outline` (border only),
`interactive` (clickable; hover lift ≤ 2px via shadow, not layout shift).

Anatomy: `CardHeader (title + description)` → `CardContent` → `CardFooter (actions)`.
Padding `--card-padding` (24px; 16px compact). Radius `--radius-lg`. Interactive
cards are a real `button`/`a` or have `role`, keyboard-activatable, focus ring.

---

## 3. Badge

Small status/metadata label. **Variants:** `default`, `secondary`, `outline`,
`success`, `warning`, `error`, `info`. **Sizes:** `sm 20px`, `default 24px`,
`lg 28px`. Radius `--radius-full`. Includes optional leading icon/dot. Warning badge
uses dark text on amber. Not interactive (use Button/Chip if clickable).

---

## 4. Status Indicator (Room Status)

MRMS-specific. Conveys room state with **color + icon + label** (WCAG - never color
only). Uses status tokens from [Design System §1.2](./DESIGN-SYSTEM.md).

| Status | Token | Icon | Label |
|--------|-------|------|-------|
| Available | `--status-available` | check-circle | "Available" |
| Occupied | `--status-occupied` | users / dot-filled | "Occupied" |
| Starting Soon | `--status-starting-soon` | clock | "Starting Soon" (dark text) |
| Maintenance | `--status-maintenance` | wrench | "Maintenance" |
| Reserved | `--status-reserved` | calendar | "Reserved" |

**Forms:** (a) `dot` - 8-12px filled circle + label; (b) `pill` - filled/tinted chip,
`--radius-full`; (c) `banner` - full-width bar for the TV display big status.
"Starting Soon" may use a gentle opacity pulse (disabled under reduced motion).
`role="status"`, `aria-live="polite"` when the state can change live.

---

## 5. Room Card

Composite card summarizing one room (used in Admin grids and Monitoring).

Anatomy:
```
┌───────────────────────────────┐
│ Room Name            [Status]  │  ← StatusIndicator pill
│ Capacity · Floor · Features    │  ← meta (icons + text)
│ ───────────────────────────    │
│ Now: <current meeting or —>    │  ← current booking / "Free until HH:MM"
│ Next: <next meeting time>      │
│ [Book]              [Details]  │  ← actions
└───────────────────────────────┘
```

- Left accent border or status pill colored by room status.
- Available → emphasize "Book"; Occupied → show organizer + end time; Maintenance →
  actions disabled with reason tooltip.
- Whole card focusable; primary action reachable by keyboard. Loading → skeleton
  (§12). Handles long room names via truncation + title/tooltip.

---

## 6. Meeting Timeline

Horizontal (day strip) or vertical (agenda) view of a room's bookings.

- Time axis with working-hours range; blocks positioned/sized by start/duration.
- Block content: title, time range, organizer; color by status (Reserved/Occupied);
  "now" indicator line; gaps show bookable free slots.
- Overlaps handled by stacking/side-by-side; min block width keeps label legible
  (else show on hover/focus popover).
- Keyboard: blocks are focusable list items with `aria-label` (title, time,
  organizer); free slots are actionable ("Book 10:00-10:30"). Empty day → empty
  state (§12). Horizontal scroll containers keep content clear of sticky axis.

---

## 7. Navigation

**Admin:** left sidebar (collapsible) + top bar (breadcrumb, search, theme toggle,
user menu). Active item uses primary tint + accent left-border + `aria-current="page"`.
Sidebar collapses to icons < `lg`; becomes a Sheet/drawer on mobile.
**Display (kiosk):** no interactive nav - a static header band (logo, room/area name,
live clock).

- Semantic `<nav>` + list; keyboard operable; visible focus; icons + labels (not icon
  only unless collapsed with tooltip/`aria-label`).

---

## 8. Dialog / Modal

Radix Dialog. **Sizes:** `sm 384`, `default 512`, `lg 640`, `xl 768`, `full`
(mobile). Scrim `rgb(0 0 0 / .5)`; content `--dialog-shadow`, `--radius-xl`.

Anatomy: `Header (title + description + close)` → `Content (scrolls if tall)` →
`Footer (Cancel + Confirm; primary right)`. Focus trapped; `Esc` closes; focus
returns to trigger; `aria-labelledby`/`aria-describedby` wired. **AlertDialog** for
destructive confirms (no backdrop-dismiss; explicit Confirm/Cancel). Kiosk generally
avoids modals.

---

## 9. Toast (Notifications)

Transient feedback. **Variants:** `success`, `info`, `warning`, `error`.
Position bottom-right (Admin). Auto-dismiss 4-6s (errors persist or require dismiss);
pauses on hover/focus; max 3 stacked. Anatomy: `[icon] Title + optional description
[action] [close]`. Uses `aria-live` (`polite` normal, `assertive` errors), icon per
variant. See [UX Standards §8](./UX-STANDARDS.md).

---

## 10. Tooltip

Radix Tooltip for supplemental labels (icon buttons, truncated text, disabled-reason).
Open on hover **and** focus; 150-300ms delay; dismiss on `Esc`/blur. Never the sole
carrier of essential info (also available to AT). Not used on the kiosk (no pointer).
Concise text; `--radius-md`; elevation-3.

---

## 11. Form Controls (Input, Select, Checkbox, Radio, Switch, Textarea)

Used in Admin (booking, room CRUD, settings). Every field has a visible `Label`
(`htmlFor`), optional helper text, and inline error. **States:** default / hover /
focus (ring) / error (`aria-invalid` + red border + message with icon) / disabled.
Sizes `sm/default/lg` per [component-specs]. Validation inline on blur/submit; error
text below field, `role="alert"`, linked via `aria-describedby`. Required fields
marked visually and with `aria-required`.

---

## 12. Loading / Empty / Error States

Every data view defines all three (plus the success/content state).

**Loading:** prefer **skeletons** matching final layout (cards, table rows,
timeline blocks) over spinners; `aria-busy="true"`; avoid layout shift when content
arrives. Spinner only for inline/button actions. Respect reduced motion.

**Empty:** icon + short heading + one-line explanation + primary action when
applicable (e.g., "No rooms yet - Add room"). Neutral, non-alarming tone.

**Error:** icon + plain-language message + **Retry** action + optional details;
`role="alert"`. Distinguish network/offline (see [UX Standards §5-6](./UX-STANDARDS.md))
from server/validation errors. Never a dead end - always offer a next step.

---

## Per-Component Checklist (Definition of Done)

- [ ] Uses tokens only (no hardcoded values); light + dark verified
- [ ] All states defined (default/hover/focus/active/disabled/loading as applicable)
- [ ] Keyboard operable; visible focus; correct roles/ARIA
- [ ] Not color-only; icons are vector (no emoji); targets ≥ 44px
- [ ] Contrast ≥ 4.5:1 text / 3:1 UI in both themes
- [ ] Reduced-motion honored; no layout-shifting hover/press
- [ ] Responsive incl. TV tier where the component appears on the display
