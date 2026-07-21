import { type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface AppShellProps {
  /** Brand / product title shown in the header. */
  title: string;
  /** Optional short subtitle (e.g., app name: "Admin" / "Display"). */
  subtitle?: string;
  /** Header-right actions (e.g., ThemeToggle, user menu). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Minimal, responsive application shell used by both SPAs for the initial
 * layout: a sticky header band + a centered main content region. Follows the
 * design system (surface/border tokens, Inter, clean hierarchy) and is
 * keyboard/AT friendly (skip link + semantic landmarks).
 */
export function AppShell({
  title,
  subtitle,
  actions,
  children,
  className,
}: AppShellProps): JSX.Element {
  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-surface-elevated/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">{title}</span>
            {subtitle && (
              <span className="text-sm font-medium text-muted-foreground">{subtitle}</span>
            )}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
