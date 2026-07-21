# UI Pro Max Design Intelligence - Installation Record

> **Purpose:** Record the installation and configuration of the UI/UX Pro Max Design Intelligence skill for MRMS.
> **Scope:** Skill install, location, version, dependencies, configuration, and compatibility notes.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Design Tokens](./DESIGN-TOKENS.md), [UI Review Workflow](./UI-REVIEW-WORKFLOW.md), [ADR-003 React](../adr/ADR-003-why-react.md)
> **References:** UI/UX Pro Max (`uipro`) CLI

## 1. Installation Status

**Installed successfully.**

| Item | Value |
|------|-------|
| Command run | `uipro init --ai kiro` |
| CLI | `uipro` (UI/UX Pro Max installer) |
| CLI version | **2.9.0** |
| Result | `UI/UX Pro Max installed successfully!` (exit 0) |
| Target assistant | Kiro |
| Install location | `.kiro/steering/` (workspace steering, versioned in-repo) |
| Date | 2026-07-20 |

## 2. Installed Skill Packs (Installation Location)

The installer generated the following skill packs under `.kiro/steering/`:

| Pack | Purpose |
|------|---------|
| `ui-ux-pro-max/` | Core design intelligence: styles, colors, fonts, UX guidelines, chart types, per-stack guidance (incl. `react`, `shadcn`, `html-tailwind`) + searchable DB (`scripts/search.py`, `design_system.py`) |
| `design-system/` | Token architecture (primitive/semantic/component), component specs, states & variants, Tailwind integration, token generators/validators |
| `ui-styling/` | shadcn/ui + Tailwind references (components, theming, accessibility, responsive, customization) |
| `brand/` | Brand identity, color palette management, typography specs, consistency checklists |
| `design/` | Unified design routing (logo, CIP, slides, banners, icons) |
| `slides/` | Strategic HTML presentation references |
| `banner-design/` | Banner sizes and art-direction reference |

Because they live in `.kiro/steering/`, these rules are automatically loaded by Kiro for every session, making UI/UX Pro Max the **primary design assistant** for MRMS.

## 3. Configuration

Configured for the MRMS project with the mandated design principles (see
[Design System](./DESIGN-SYSTEM.md) for the full realization):

- Enterprise Software · Corporate Design · Google Workspace Style
- Minimalist · Accessibility First · Responsive
- Kiosk Mode · Dashboard Oriented · Large Screen Optimization
- Clean Information Hierarchy

**Grounding recommendation (from the skill's design-system generator):**

```
uipro/ui-ux-pro-max search.py "enterprise meeting room management google workspace
dashboard minimal accessibility" --design-system -p "MRMS"
```

Returned:
- **Style:** "Trust & Authority" - enterprise, light+dark full support, WCAG AAA-capable.
- **Typography:** **Inter** (best for dashboards, admin panels, enterprise apps).
- **Palette direction:** neutral slate surfaces + high-contrast text + positive-green
  accent; anti-patterns to avoid: playful design, AI purple/pink gradients.

MRMS adapts this to a **Google Workspace / Google Meet-inspired** palette and the
room-status color semantics from the PRD (see Design System §1).

## 4. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Node.js | Present (`v26.5.0`) | Used by `uipro` CLI and `.cjs` token scripts |
| `uipro` CLI | Present (global, `2.9.0`) | `C:\Users\...\AppData\Roaming\npm\uipro` |
| Python | Present (`3.14.6`) | Required by the skill's search/generator scripts (`search.py`, `design_system.py`) |
| Skill Python deps | On-demand | Some generator scripts (logo/CIP/icon) need `google-genai`, `pillow` and a `GEMINI_API_KEY`; **not required** for the design-system/search flow MRMS uses |
| Frontend libs (to add in implementation) | Pending | Tailwind CSS, shadcn/ui, an icon set (Phosphor or Lucide/Heroicons) - added during Sprint 1+ per ADR-003 |

## 5. Usage in the MRMS Workflow

- **Before building any screen**, follow the [UI Review Workflow](./UI-REVIEW-WORKFLOW.md).
- Ground component/screen decisions with the skill, e.g.:

```bash
# Design system recommendation (already grounded for MRMS)
python .kiro/steering/ui-ux-pro-max/scripts/search.py "<context>" --design-system -p "MRMS"

# UX best practices for a specific interaction
python .kiro/steering/ui-ux-pro-max/scripts/search.py "dashboard accessibility loading" --domain ux

# React / shadcn stack guidance
python .kiro/steering/ui-ux-pro-max/scripts/search.py "list performance memo" --stack react
```

- Recommendations must remain **consistent with the approved architecture**
  (React/TS/Vite/Tailwind - ADR-003) and the [Design System](./DESIGN-SYSTEM.md).
  Where the skill's generic output conflicts with a documented MRMS decision
  (e.g., the "Minimal Single Column" landing pattern vs. our dashboard/kiosk
  layouts), **the MRMS design system and architecture take precedence**.

## 6. Warnings & Compatibility Notes

- The installer advised: *"Restart your AI coding assistant"* after install so the
  steering rules load. The skill rules are active for subsequent sessions.
- Some sub-skills (logo/CIP/icon generation, banners, social photos) are **out of
  scope** for MRMS application UI and are not used; they ship with the pack but can
  be ignored.
- The skill's default landing pattern ("Minimal Single Column", single-CTA) is
  **conversion/marketing-oriented** and does not apply to MRMS's dashboard and
  kiosk surfaces - we use the dashboard/room-display layouts in
  [Dashboard Standards](./DASHBOARD-STANDARDS.md).
- Scripts use `python` on Windows (not `python3`).
- No secrets are stored by the install; do not commit any `GEMINI_API_KEY`.

## 7. Verification

```
uipro --version            -> 2.9.0
uipro init --ai kiro       -> "UI/UX Pro Max installed successfully!" (exit 0)
python --version           -> Python 3.14.6
search.py ... --design-system -> returned a complete design system (exit 0)
```
