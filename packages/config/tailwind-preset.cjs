// @mrms/config - shared TailwindCSS preset.
// Implements the approved MRMS Design System (Google Workspace / Meet-inspired,
// enterprise, minimal, accessible, TV-optimized). Colors are exposed as CSS
// variables (set in @mrms/ui tokens.css) so light/dark switch without reflow;
// this preset maps them into Tailwind utilities.
//
// Consumed by apps via:  presets: [require('@mrms/config/tailwind-preset')]

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Brand + interaction
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          foreground: 'var(--color-on-primary)',
        },
        // Surfaces / neutrals
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        border: 'var(--color-border)',
        foreground: 'var(--color-text)',
        muted: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-secondary)',
        },
        ring: 'var(--color-ring)',
        // Feedback
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        // Room status semantics (PRD)
        status: {
          available: 'var(--status-available)',
          occupied: 'var(--status-occupied)',
          'starting-soon': 'var(--status-starting-soon)',
          maintenance: 'var(--status-maintenance)',
          reserved: 'var(--status-reserved)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      screens: {
        // Standard breakpoints + TV tiers (Display client).
        'tv-hd': '1920px',
        'tv-4k': '3840px',
      },
    },
  },
  plugins: [],
};
