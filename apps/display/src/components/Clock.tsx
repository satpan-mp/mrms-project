import { useClock } from '../hooks/useClock';

/** Large, TV-readable realtime clock for the kiosk header. */
export function Clock(): JSX.Element {
  const now = useClock();
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="text-right" aria-live="off">
      <div className="font-mono text-4xl font-bold tabular-nums tv-hd:text-6xl">{time}</div>
      <div className="text-sm text-muted-foreground tv-hd:text-lg">{date}</div>
    </div>
  );
}
