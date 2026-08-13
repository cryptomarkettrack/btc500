import { track } from "@vercel/analytics";

/** Primary marketing conversion events. Names follow object_action. */
export function trackCta(location: string, destination: string) {
  track("cta_clicked", { location, destination });
}

export function trackToolUsed(tool: string, extra?: Record<string, string | number | boolean>) {
  track("tool_used", { tool, ...extra });
}
