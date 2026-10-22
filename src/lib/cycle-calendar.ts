/**
 * iCalendar (RFC 5545) generation for the BTC500 date calendar.
 *
 * The product is a calendar rule, so the calendar file *is* the product: a
 * subscriber gets the buy window, the halving and the sell window as all-day
 * events, with a 30-day reminder before the buy window opens.
 *
 * Times are intentionally date-only (VALUE=DATE). Every date the site
 * publishes is a UTC calendar day, and an all-day event avoids the "the
 * reminder fired at 01:00" problem that floating timestamps create.
 *
 * Kept dependency-free and pure so it can be unit tested without the router.
 */

export interface CalendarEvent {
  /** Stable, globally unique id. Re-importing must update, not duplicate. */
  uid: string;
  /** UTC calendar day, `YYYY-MM-DD`. */
  date: string;
  summary: string;
  description: string;
  url?: string;
  categories?: string[];
  /** Days before the event to fire a display reminder. */
  reminderDaysBefore?: number;
}

export interface CalendarOptions {
  name: string;
  description: string;
  /** Seconds clients should wait before refreshing a subscribed calendar. */
  refreshSeconds?: number;
  /** Generation timestamp. Defaults to now; injected in tests. */
  now?: Date;
}

const CRLF = "\r\n";
const MAX_LINE_OCTETS = 75;

/** `2026-11-28` -> `20261128`. Throws on anything else so bad data never ships. */
export function toIcsDay(isoDay: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(isoDay)) {
    throw new Error(`Invalid calendar date: ${isoDay}`);
  }
  return isoDay.replace(/-/gu, "");
}

/** The exclusive DTEND for an all-day event, i.e. the following day. */
export function nextIcsDay(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid calendar date: ${isoDay}`);
  date.setUTCDate(date.getUTCDate() + 1);
  return toIcsDay(date.toISOString().slice(0, 10));
}

/**
 * Escape text per RFC 5545 §3.3.11: backslash, semicolon, comma and newlines.
 * Order matters — the backslash must be escaped first.
 */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/gu, "\\\\")
    .replace(/;/gu, "\\;")
    .replace(/,/gu, "\\,")
    .replace(/\r\n|\r|\n/gu, "\\n");
}

/**
 * Fold a content line to 75 octets (not characters) without splitting a UTF-8
 * sequence. Continuation lines begin with a single space.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return line;

  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  // Reserve one octet for the leading space on continuation lines.
  let limit = MAX_LINE_OCTETS;

  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (currentBytes + bytes > limit) {
      out.push(current);
      current = char;
      currentBytes = bytes;
      limit = MAX_LINE_OCTETS - 1;
    } else {
      current += char;
      currentBytes += bytes;
    }
  }
  if (current) out.push(current);

  return out.join(`${CRLF} `);
}

function formatUtcStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes % 60 === 0) return `PT${minutes / 60}H`;
  return `PT${minutes}M`;
}

function eventLines(event: CalendarEvent, stamp: string): string[] {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDay(event.date)}`,
    `DTEND;VALUE=DATE:${nextIcsDay(event.date)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];

  if (event.url) lines.push(`URL:${event.url}`);
  if (event.categories?.length) lines.push(`CATEGORIES:${event.categories.join(",")}`);
  // Calendar events should never block a time slot.
  lines.push("TRANSP:TRANSPARENT");

  if (event.reminderDaysBefore && event.reminderDaysBefore > 0) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(event.summary)}`,
      `TRIGGER:-P${event.reminderDaysBefore}D`,
      "END:VALARM",
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

/** Build a complete VCALENDAR document. Lines are CRLF-terminated and folded. */
export function buildIcs(events: CalendarEvent[], options: CalendarOptions): string {
  const stamp = formatUtcStamp(options.now ?? new Date());
  const refreshSeconds = options.refreshSeconds ?? 43_200;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BTC500//Bitcoin Halving Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(options.name)}`,
    `X-WR-CALDESC:${escapeIcsText(options.description)}`,
    `REFRESH-INTERVAL;VALUE=DURATION:${formatDuration(refreshSeconds)}`,
    `X-PUBLISHED-TTL:${formatDuration(refreshSeconds)}`,
    ...events.flatMap((event) => eventLines(event, stamp)),
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join(CRLF)}${CRLF}`;
}
