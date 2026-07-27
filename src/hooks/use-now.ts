import { useEffect, useState } from "react";

/**
 * Returns a Date that updates on a fixed interval.
 * Useful for countdowns and "live" relative UI without per-second re-renders.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
