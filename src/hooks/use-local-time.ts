import { useEffect, useState } from "react";

export type TimeFormatter = (timestamp: number) => string;

function makeFormatter(timeZone?: string): TimeFormatter {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    ...(timeZone ? { timeZone } : {}),
  });
  return (timestamp) => formatter.format(new Date(timestamp));
}

/**
 * Formats clock times in the viewer's timezone.
 *
 * The first render uses UTC so the server and client markup match. After
 * hydration the formatter is replaced with one using the browser's local
 * timezone, and the resolved zone name is returned for display.
 */
export function useLocalTime(): { formatTime: TimeFormatter; timeZone: string } {
  const [formatTime, setFormatTime] = useState<TimeFormatter>(() => makeFormatter("UTC"));
  const [timeZone, setTimeZone] = useState("UTC");

  useEffect(() => {
    setFormatTime(() => makeFormatter());
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "local");
  }, []);

  return { formatTime, timeZone };
}
