import { readKioskConfig } from '../lib/kioskConfig';

import { Clock } from '../components/Clock';
import { ConnectionStatus } from '../components/ConnectionStatus';

/**
 * Fullscreen kiosk room display (foundation). Renders the fixed no-scroll
 * composition from the Dashboard Standards: header band (brand + room + clock),
 * a dominant identity/status region, and a footer status line.
 *
 * Sprint 1A shows the room identity + live clock + backend connection. The live
 * room status banner, current/next meeting, today's schedule, and realtime
 * binding are implemented in Sprint 1E (P2).
 */
export function RoomDisplayScreen(): JSX.Element {
  const { roomId } = readKioskConfig();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-8 py-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground tv-hd:text-lg">
            PT Mitra Prodin · MRMS
          </p>
          <h1 className="text-3xl font-bold tracking-tight tv-hd:text-5xl">
            {roomId ? `Room ${roomId}` : 'Meeting Room Display'}
          </h1>
        </div>
        <Clock />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="max-w-3xl text-2xl text-muted-foreground tv-hd:text-4xl">
          {roomId
            ? 'Live room status and schedule appear here once realtime is enabled (Sprint 1E).'
            : 'Awaiting kiosk configuration. Open this display with ?room=<id>&token=<deviceToken>.'}
        </p>
      </main>

      <footer className="flex items-center justify-between border-t border-border px-8 py-4">
        <ConnectionStatus />
        <span className="text-xs text-muted-foreground tv-hd:text-sm">Foundation build</span>
      </footer>
    </div>
  );
}
