# Accessibility

> **Purpose:** Accessibility standards for MRMS - WCAG 2.1 AA compliance, keyboard navigation, contrast, focus states, and readable typography.
> **Scope:** Display and Admin SPAs and the shared `@mrms/ui` library.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Component Standards](./COMPONENT-STANDARDS.md), [UX Standards](./UX-STANDARDS.md), [UI Review Workflow](./UI-REVIEW-WORKFLOW.md), [Testing Strategy](../TESTING-STRATEGY.md)
> **References:** WCAG 2.1 AA; UI/UX Pro Max (accessible-pairs, focus management); Radix/shadcn a11y

**Target: WCAG 2.1 Level AA** across the Admin app (interactive), with AAA contrast
pursued where feasible. The Display Client is non-interactive but must meet contrast
and legibility at distance.

## 1. Perceivable

- **Contrast:** text ≥ **4.5:1** (large text ≥ **3:1**); UI components, icons, and
  focus indicators ≥ **3:1**. Amber (`#F9AB00`) uses dark foreground text. Validate
  every pair in **both** themes (see [Design System §1.5](./DESIGN-SYSTEM.md)).
- **Not color-alone:** status/meaning always pairs color with icon + text/shape
  (room status, chart series, form errors).
- **Text alternatives:** meaningful icons/images have `alt`/`aria-label`; decorative
  ones are `aria-hidden`. Charts provide a text summary or data-table alternative
  ([Dashboard Standards §4](./DASHBOARD-STANDARDS.md)).
- **Reflow & zoom:** usable at 200% zoom and down to 320px width without loss of
  content/function; no horizontal scrolling of body text.

## 2. Operable (Keyboard Navigation)

- **Everything interactive is keyboard-operable** - no mouse-only actions. Logical
  tab order matching visual order.
- **Standard keys:** `Tab`/`Shift+Tab` move; `Enter`/`Space` activate; `Esc` closes
  overlays; arrow keys within composites (menus, tabs, radio groups, timeline blocks)
  via Radix.
- **Focus management:** dialogs trap focus and restore it to the trigger on close;
  route changes move focus to the main heading; newly revealed content is reachable.
- **No traps;** provide a **"Skip to content"** link in the Admin shell.
- **Targets:** ≥ 44px interactive size (expand hit area for small icons).
- **No keyboard timing traps;** where a flow has a countdown (check-in), it can be
  completed by keyboard and time limits are generous/adjustable per PRD.

## 3. Focus States

- **Always visible** `focus-visible` ring: 2px ring in `--color-ring` + 2px offset,
  ≥ 3:1 against adjacent colors, in both themes. Never remove outlines without an
  equivalent visible replacement (`:focus-visible`, not `:focus{outline:none}`).
- Focus indicators are consistent across all components and not obscured by sticky
  bars/overlays.

## 4. Understandable (Typography & Content)

- **Readable type:** body ≥ 16px (Admin), Display body ≥ 18px scaled for distance;
  line-height ≥ 1.5 for body; comfortable measure (~65-75ch); avoid all-caps for long
  text; avoid weights < 400 at small sizes. Inter font
  ([Design System §2](./DESIGN-SYSTEM.md)).
- **Labels & instructions:** every form field has a persistent visible label, helpful
  hints, and clear, specific error messages tied via `aria-describedby`; required
  state conveyed beyond color.
- **Predictable:** consistent nav/layout; no unexpected context changes on focus or
  input; clear, plain language ([UX Standards §4](./UX-STANDARDS.md)).

## 5. Robust (Semantics & ARIA)

- **Semantic HTML first** (`button`, `a`, `nav`, `main`, `table`, headings in order);
  ARIA only to fill gaps. Prefer Radix/shadcn primitives which ship correct roles.
- **Names/roles/states** exposed for all controls; `aria-invalid`, `aria-required`,
  `aria-expanded`, `aria-current`, `aria-disabled` used correctly.
- **Live regions:** async outcomes and status changes announced -`aria-live="polite"`
  for routine (toasts, status updates), `assertive` for critical (device offline,
  imminent auto-release). `aria-busy` during loads.

## 6. Motion & Preferences

- Respect **`prefers-reduced-motion`**: disable non-essential animation/pulse/shimmer;
  keep instant, non-motion state changes. No content flashing > 3x/sec.
- Respect reduced transparency/high-contrast OS settings where feasible; support
  system light/dark preference.

## 7. Display Client (kiosk) specifics

- Non-interactive: no keyboard/AT interaction required, but must meet **contrast**
  and **large-type legibility** at viewing distance; status conveyed by color **and**
  icon **and** text; no reliance on motion to convey meaning.

## 8. Verification

- **Automated:** integrate `axe`/Lighthouse in CI on the Admin app; lint for missing
  labels/alt. Token contrast checked during design ([Design Tokens §7](./DESIGN-TOKENS.md)).
- **Manual:** keyboard-only pass; screen-reader smoke test (NVDA/VoiceOver);
  200%-zoom and 320px checks; both themes. Part of the
  [UI Review Workflow](./UI-REVIEW-WORKFLOW.md) gate.
- **Note:** automated tools catch a fraction of issues; full WCAG conformance
  requires manual testing with assistive technologies and expert review. Automated
  passing is necessary, not sufficient.

## Definition of Done (accessibility gate)

- [ ] Contrast AA (text 4.5:1 / large 3:1 / UI 3:1) verified both themes
- [ ] Fully keyboard operable; logical order; skip link; no traps
- [ ] Visible focus everywhere (≥ 3:1); dialog focus trap + restore
- [ ] Semantic HTML + correct roles/states; live regions for async
- [ ] Not color-only; icons/charts have text alternatives
- [ ] Reduced motion respected; readable type sizes/line-heights
- [ ] axe/Lighthouse pass + manual keyboard/SR spot check
