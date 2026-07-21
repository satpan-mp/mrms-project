/** @mrms/ui - shared, theme-aware component library (approved Design System). */
export { cn } from './lib/cn';
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export type { Theme, ResolvedTheme, ThemeProviderProps } from './theme/ThemeProvider';
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/Card';
export { Spinner } from './components/Spinner';
export { ThemeToggle } from './components/ThemeToggle';
export { StatusPill } from './components/StatusPill';
export type { StatusPillProps } from './components/StatusPill';
export { AppShell } from './components/AppShell';
export type { AppShellProps } from './components/AppShell';
export { ErrorBoundary } from './components/ErrorBoundary';
