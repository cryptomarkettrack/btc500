/** Formatting and file-output helpers shared by the Search Console scripts. */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OUTPUT_DIR } from "./client.ts";

export function num(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function pct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function pos(value: number): string {
  return value.toFixed(1);
}

export function escapeCell(value: string): string {
  return value.replace(/\|/gu, "\\|").replace(/\s*\n\s*/gu, " ");
}

export function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return "_No rows._";
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`);
  return [head, divider, ...body].join("\n");
}

export function timestamp(): string {
  return new Date().toISOString().replace(/:/gu, "-").replace(/\..+$/u, "");
}

/** Strip the scheme + host so long URLs stay readable in a table. */
export function shortUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export type ReportResult = { markdownPath: string; jsonPath: string };

/**
 * Write a timestamped markdown + JSON pair, plus `*-latest.*` copies so the
 * most recent run is always easy to find. Both live under the gitignored
 * `scripts/search-console/output/` directory.
 */
export function writeReport(name: string, markdown: string, data: unknown): ReportResult {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const stamp = timestamp();
  const markdownPath = resolve(OUTPUT_DIR, `${name}-${stamp}.md`);
  const jsonPath = resolve(OUTPUT_DIR, `${name}-${stamp}.json`);
  const json = JSON.stringify(data, null, 2);

  writeFileSync(markdownPath, markdown, "utf8");
  writeFileSync(jsonPath, json, "utf8");
  writeFileSync(resolve(OUTPUT_DIR, `${name}-latest.md`), markdown, "utf8");
  writeFileSync(resolve(OUTPUT_DIR, `${name}-latest.json`), json, "utf8");

  return { markdownPath, jsonPath };
}
