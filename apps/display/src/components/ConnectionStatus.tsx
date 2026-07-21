import { useHealth } from '@mrms/hooks';

import { api } from '../lib/api';

/**
 * Footer connection indicator. The kiosk never blanks: on backend/Google
 * failure it shows an offline notice while continuing to render (Doc 15 §5,
 * NFR-AVAIL-2). Full last-known-schedule + staleness handling lands in Sprint 1E.
 */
export function ConnectionStatus(): JSX.Element {
  const health = useHealth(api, 15_000);
  const online = health.isSuccess;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground tv-hd:text-base">
      <span
        className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-success' : 'bg-error'}`}
        aria-hidden="true"
      />
      <span>{online ? 'Connected' : 'Offline - showing last known state'}</span>
    </div>
  );
}
