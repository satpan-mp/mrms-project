import { useEffect, useState } from 'react';

/**
 * Local clock that ticks every second, independent of the network (NFR-PERF-4).
 * The interval is aligned to the next second boundary for accurate display.
 */
export function useClock(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(
      () => {
        setNow(new Date());
        intervalId = setInterval(() => setNow(new Date()), 1_000);
      },
      1_000 - (Date.now() % 1_000),
    );

    return () => {
      clearTimeout(align);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return now;
}
