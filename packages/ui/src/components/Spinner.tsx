import { cn } from '../lib/cn';

export interface SpinnerProps {
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
}

/** Indeterminate loading indicator (respects prefers-reduced-motion via tokens.css). */
export function Spinner({ className, label = 'Loading' }: SpinnerProps): JSX.Element {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <span
        className={cn(
          'h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
          className,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
