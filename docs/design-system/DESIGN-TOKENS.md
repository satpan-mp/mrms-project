# Design Tokens

> **Purpose:** Define reusable MRMS design tokens across three layers (primitive → semantic → component) with light/dark themes and Tailwind mapping.
> **Scope:** Shared `@mrms/ui`, Display, and Admin SPAs.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-20
> **Related Documents:** [Design System](./DESIGN-SYSTEM.md), [Component Standards](./COMPONENT-STANDARDS.md), [Frontend Architecture](../15-Frontend-Architecture.md)
> **References:** UI/UX Pro Max design-system (token-architecture, tailwind-integration)

Tokens follow the **three-layer architecture**: raw **primitives** → purpose-based
**semantic** aliases → **component** tokens. Themes switch by overriding the
semantic layer (`.dark`). This becomes `packages/ui` token CSS during Sprint 1.

## 1. Required Token Set (deliverable checklist)

Primary, Secondary, Success, Warning, Error, Info, Background, Surface, Border,
Text, Shadow, Radius, Spacing, Animation Duration - all defined below, plus the
room-status tokens unique to MRMS.

## 2. Layer 1 - Primitives (raw values)

```css
:root {
  /* Google-inspired brand + status hues */
  --blue-600:  #1A73E8;  --blue-700: #1B66C9;  --blue-800: #185ABC;  --blue-300: #8AB4F8;
  --green-600: #1E8E3E;  --green-300: #81C995;
  --red-600:   #D93025;  --red-300:  #F28B82;
  --amber-500: #F9AB00;  --amber-300: #FDD663;

  /* Grey scale */
  --grey-0: #FFFFFF; --grey-50: #F8F9FA; --grey-100: #F1F3F4; --grey-200: #E8EAED;
  --grey-300: #DADCE0; --grey-500: #9AA0A6; --grey-600: #5F6368;
  --grey-800: #3C4043; --grey-850: #35363A; --grey-875: #292A2D; --grey-900: #202124;

  /* Spacing (4px base) */
  --space-0:0; --space-0-5:2px; --space-1:4px; --space-2:8px; --space-3:12px;
  --space-4:16px; --space-5:20px; --space-6:24px; --space-8:32px; --space-12:48px; --space-16:64px;

  /* Radius */
  --radius-sm:4px; --radius-md:8px; --radius-lg:12px; --radius-xl:16px; --radius-full:9999px;

  /* Font sizes (admin base) */
  --fs-caption:12px; --fs-sm:14px; --fs-base:16px; --fs-lg:18px;
  --fs-h4:18px; --fs-h3:22px; --fs-h2:28px; --fs-h1:36px; --fs-display:48px;

  /* Font weights */
  --fw-regular:400; --fw-medium:500; --fw-semibold:600; --fw-bold:700;

  /* Shadows */
  --shadow-1: 0 1px 2px rgb(0 0 0 / .06), 0 1px 3px rgb(0 0 0 / .10);
  --shadow-2: 0 4px 6px -1px rgb(0 0 0 / .10);
  --shadow-3: 0 10px 15px -3px rgb(0 0 0 / .10);
  --shadow-4: 0 20px 25px -5px rgb(0 0 0 / .12);

  /* Motion */
  --duration-fast:150ms; --duration-normal:200ms; --duration-slow:300ms;
  --easing-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Fonts */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Z-index */
  --z-dropdown:1000; --z-sticky:1100; --z-modal:1200; --z-popover:1300; --z-toast:1400;
}
```

## 3. Layer 2 - Semantic (light default)

```css
:root {
  --color-primary: var(--blue-600);
  --color-primary-hover: var(--blue-700);
  --color-primary-active: var(--blue-800);
  --color-on-primary: #FFFFFF;

  --color-secondary: var(--grey-100);
  --color-secondary-foreground: var(--grey-900);

  --color-success: var(--green-600);
  --color-warning: var(--amber-500);
  --color-error:   var(--red-600);
  --color-info:    var(--blue-600);

  --color-background: var(--grey-0);
  --color-surface:    var(--grey-50);
  --color-surface-elevated: var(--grey-0);
  --color-border:     var(--grey-300);
  --color-text:       var(--grey-900);
  --color-text-secondary: var(--grey-600);
  --color-text-disabled:  var(--grey-500);
  --color-ring: var(--blue-600);

  /* Room status (semantic, MRMS-specific) */
  --status-available:    var(--green-600);
  --status-occupied:     var(--red-600);
  --status-starting-soon:var(--amber-500);
  --status-maintenance:  var(--grey-600);
  --status-reserved:     var(--blue-600);
  --status-on-warning:   var(--grey-900); /* dark text on amber */

  /* Spacing/radius/shadow/motion semantic aliases */
  --spacing-component: var(--space-4);
  --spacing-section: var(--space-8);
  --radius-control: var(--radius-md);
  --radius-card: var(--radius-lg);
  --elevation-card: var(--shadow-1);
  --elevation-overlay: var(--shadow-4);
  --duration-ui: var(--duration-normal);
}
```

## 4. Dark Mode Overrides

```css
.dark {
  --color-primary: var(--blue-300);
  --color-primary-hover: #AECBFA;
  --color-primary-active: #669DF6;
  --color-on-primary: var(--grey-900);

  --color-secondary: var(--grey-850);
  --color-secondary-foreground: var(--grey-0);

  --color-success: var(--green-300);
  --color-warning: var(--amber-300);
  --color-error:   var(--red-300);
  --color-info:    var(--blue-300);

  --color-background: var(--grey-900);
  --color-surface:    var(--grey-875);
  --color-surface-elevated: var(--grey-850);
  --color-border:     var(--grey-800);
  --color-text:       #E8EAED;
  --color-text-secondary: var(--grey-500);
  --color-text-disabled:  var(--grey-600);
  --color-ring: var(--blue-300);

  --status-available: var(--green-300);
  --status-occupied: var(--red-300);
  --status-starting-soon: var(--amber-300);
  --status-maintenance: var(--grey-500);
  --status-reserved: var(--blue-300);

  /* Elevation via border + surface, softer shadow */
  --elevation-card: 0 1px 2px rgb(0 0 0 / .40);
}
```

## 5. Layer 3 - Component Tokens (examples)

```css
:root {
  /* Button */
  --button-bg: var(--color-primary);
  --button-fg: var(--color-on-primary);
  --button-hover-bg: var(--color-primary-hover);
  --button-radius: var(--radius-control);
  --button-padding-x: var(--space-4);
  --button-padding-y: var(--space-2);

  /* Card */
  --card-bg: var(--color-surface);
  --card-fg: var(--color-text);
  --card-border: var(--color-border);
  --card-radius: var(--radius-card);
  --card-padding: var(--space-6);
  --card-shadow: var(--elevation-card);

  /* Status chip */
  --status-chip-radius: var(--radius-full);
  --status-chip-padding-x: var(--space-3);
  --status-chip-padding-y: var(--space-1);

  /* Input */
  --input-bg: var(--color-background);
  --input-border: var(--color-border);
  --input-focus-ring: var(--color-ring);
  --input-radius: var(--radius-control);

  /* Dialog */
  --dialog-bg: var(--color-surface-elevated);
  --dialog-radius: var(--radius-xl);
  --dialog-shadow: var(--elevation-overlay);
  --dialog-overlay: rgb(0 0 0 / .5);
}
```

## 6. Tailwind Mapping (implementation note)

Tokens are exposed to Tailwind via CSS variables (shadcn/ui convention). During
Sprint 1, `packages/ui` provides a Tailwind preset:

```ts
// tailwind preset (illustrative)
colors: {
  primary: 'var(--color-primary)',
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  border: 'var(--color-border)',
  foreground: 'var(--color-text)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
  status: {
    available: 'var(--status-available)',
    occupied: 'var(--status-occupied)',
    'starting-soon': 'var(--status-starting-soon)',
    maintenance: 'var(--status-maintenance)',
    reserved: 'var(--status-reserved)',
  },
},
borderRadius: { sm:'var(--radius-sm)', md:'var(--radius-md)', lg:'var(--radius-lg)', xl:'var(--radius-xl)' },
transitionDuration: { fast:'150ms', normal:'200ms', slow:'300ms' },
```

Theme switch: toggle `.dark` on `<html>` (persisted; supports system preference).

## 7. Rules

- **Never hardcode** hex/spacing in components - always reference tokens.
- Add a new token in the correct layer; document its purpose here.
- Validate token usage with the skill's validator during implementation:
  `node .kiro/steering/design-system/scripts/validate-tokens.cjs -d apps/`.
- Every color pair must meet the contrast targets in
  [Accessibility](./ACCESSIBILITY.md) in **both** themes.
