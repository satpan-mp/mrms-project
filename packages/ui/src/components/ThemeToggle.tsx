import { Moon, Sun } from '@phosphor-icons/react';

import { useTheme } from '../theme/ThemeProvider';

/** Accessible light/dark toggle button. */
export function ThemeToggle(): JSX.Element {
  const { resolvedTheme, toggleTheme } = useTheme();
  const nextLabel = resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-foreground transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
