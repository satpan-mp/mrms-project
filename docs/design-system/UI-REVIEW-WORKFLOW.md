# UI Review Workflow

> **Purpose:** Mandatory review gate before any MRMS screen is implemented - a 7-step check ensuring every screen is on-design, usable, consistent, accessible, responsive, performant, and approved.
> **Scope:** All frontend work on the Display and Admin SPAs and shared `@mrms/ui`.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Component Standards](./COMPONENT-STANDARDS.md), [Dashboard Standards](./DASHBOARD-STANDARDS.md), [UX Standards](./UX-STANDARDS.md), [Accessibility](./ACCESSIBILITY.md), [Design Tokens](./DESIGN-TOKENS.md), [Process/PR](../process/)
> **References:** UI/UX Pro Max pre-delivery checklist

**Rule: no screen may be implemented without passing this review.** The review is
lightweight for small changes and thorough for new screens. Steps 1-6 can be
self-verified with the checklists below; Step 7 is an explicit sign-off recorded on
the PR. Use the UI/UX Pro Max skill (`search.py ... --design-system -p "MRMS"` /
`--domain ux`) to ground decisions.

## When it applies

- **Full review:** any new screen/page, new shared component, or significant redesign.
- **Light review:** small tweaks (copy, spacing, single-prop) - run the steps that
  apply (usually 3, 4, 7).
- Runs **before implementation** (design intent) and is re-confirmed **in the PR**
  (implementation matches intent).

---

## The 7 Steps

### 1. Design Review
Does it match the design system? Verify against [Design System](./DESIGN-SYSTEM.md)
and [Design Tokens](./DESIGN-TOKENS.md).
- [ ] Colors/typography/spacing/radius/elevation from **tokens** (no hardcoded values)
- [ ] Correct palette incl. room-status semantics; Inter type scale; 4/8px rhythm
- [ ] Clear visual hierarchy; both light + dark themes designed
- [ ] Icons are Phosphor vector (no emoji); no AI-gradient/playful anti-patterns

### 2. UX Validation
Is the flow clear and forgiving? Verify against [UX Standards](./UX-STANDARDS.md).
- [ ] Task flow is obvious; one primary action per view; sensible defaults/pre-fill
- [ ] Immediate feedback; loading (skeleton), empty, and error states defined
- [ ] Errors are plain-language and recoverable; user input preserved
- [ ] Offline/reconnection behavior considered where relevant (Display, live data)

### 3. Component Consistency Check
Reuse before rebuild. Verify against [Component Standards](./COMPONENT-STANDARDS.md).
- [ ] Uses existing `@mrms/ui` components/variants; no one-off duplicates
- [ ] New components follow the component conventions + all states
- [ ] Naming, props, and patterns consistent with the library

### 4. Accessibility Check
Verify against [Accessibility](./ACCESSIBILITY.md) (WCAG 2.1 AA).
- [ ] Contrast AA in both themes (text 4.5:1 / large 3:1 / UI 3:1)
- [ ] Fully keyboard operable; logical order; visible focus; skip link (Admin)
- [ ] Semantic HTML + roles/states; `aria-live` for async; not color-only
- [ ] Reduced motion respected; readable type; targets ≥ 44px

### 5. Responsive Review
Verify against [Design System §9](./DESIGN-SYSTEM.md) + [Dashboard Standards](./DASHBOARD-STANDARDS.md).
- [ ] Works mobile → desktop (test 375/768/1024/1280); no overflow/clipping
- [ ] Display screens verified on TV tier (1080p and 4K); safe margins/overscan
- [ ] Layout stable across breakpoints; content reflows, not breaks

### 6. Performance Consideration
- [ ] Lists/tables virtualized where large; images sized/lazy; no layout shift (CLS)
- [ ] Avoid unnecessary re-renders (memoization where needed); code-split heavy routes
- [ ] Live/polling views throttled; Display Client stable for always-on use
- [ ] Meets the project [performance budget](../review/) targets where defined

### 7. Approval
- [ ] Steps 1-6 checklists pass (self-review noted on the PR)
- [ ] Screenshots/recording attached for **both themes** (and TV tier for Display)
- [ ] Reviewer sign-off recorded on the PR before merge
- [ ] Any deviations documented (link to a [decision](../decisions/)/[RFC](../rfc/))

---

## PR Checklist (paste into the PR description)

```md
### UI Review (docs/design-system/UI-REVIEW-WORKFLOW.md)
- [ ] 1. Design Review - tokens, hierarchy, both themes, no anti-patterns
- [ ] 2. UX Validation - flow, feedback, loading/empty/error, recoverable errors
- [ ] 3. Component Consistency - reused @mrms/ui, all states, consistent naming
- [ ] 4. Accessibility - AA contrast, keyboard, focus, semantics/ARIA, not color-only
- [ ] 5. Responsive - mobile→desktop (+TV for Display), no overflow, stable
- [ ] 6. Performance - virtualization, no CLS, throttled live views, budget met
- [ ] 7. Approval - screenshots (both themes/TV), reviewer sign-off, deviations linked
```

## Governance

- The workflow is enforced via PR review ([process](../process/)); a `PostFileCreate`/
  PR template can carry the checklist.
- Automated aids: `axe`/Lighthouse in CI (Step 4), token validator
  (`node .kiro/steering/design-system/scripts/validate-tokens.cjs`, Step 1).
- Changes to standards themselves follow [RFC](../rfc/)/[Decision Log](../decisions/).
