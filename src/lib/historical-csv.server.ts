/**
 * Server-only loader for the bundled BTC daily-close CSV.
 * The Vite `?raw` import embeds the file in the Nitro/Vercel function bundle
 * so production does not depend on a writable or persistent filesystem.
 */

import bundledCsv from "../../public/btc-usd-max.csv?raw";
import {
  emptyHistoricalCsvDataset,
  parseHistoricalCsv,
  type HistoricalCsvDataset,
} from "./historical-csv";

const MIN_BUNDLED_CHARS = 10_000;

let cached: HistoricalCsvDataset | null = null;

export function getBundledHistoricalCsvText(): string {
  return typeof bundledCsv === "string" ? bundledCsv : "";
}

function isPlausibleCsv(text: string): boolean {
  return text.length >= MIN_BUNDLED_CHARS && /20\d{2}-\d{2}-\d{2}/.test(text);
}

async function readCsvFromDisk(): Promise<{ text: string; path: string } | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");

    const candidates: string[] = [
      join(process.cwd(), "public", "btc-usd-max.csv"),
      join(process.cwd(), "btc-usd-max.csv"),
      join(process.cwd(), "dist", "client", "btc-usd-max.csv"),
      join(process.cwd(), "dist", "server", "btc-usd-max.csv"),
      join(process.cwd(), "client", "btc-usd-max.csv"),
      join(process.cwd(), ".output", "public", "btc-usd-max.csv"),
      join(process.cwd(), ".vercel", "output", "static", "btc-usd-max.csv"),
      "/var/task/public/btc-usd-max.csv",
      "/var/task/btc-usd-max.csv",
      "/var/task/client/btc-usd-max.csv",
    ];

    try {
      const here = fileURLToPath(import.meta.url);
      const dir = dirname(here);
      candidates.push(
        join(dir, "btc-usd-max.csv"),
        join(dir, "public", "btc-usd-max.csv"),
        join(dir, "../../../public/btc-usd-max.csv"),
        join(dir, "../../public/btc-usd-max.csv"),
      );
    } catch {
      // import.meta.url is not a file URL in some bundles — skip relative paths.
    }

    for (const path of candidates) {
      try {
        const text = await readFile(path, "utf8");
        if (isPlausibleCsv(text)) return { text, path };
      } catch {
        // try next candidate
      }
    }
  } catch (err) {
    console.error("[CSV] filesystem probe failed:", err);
  }

  return null;
}

/**
 * Load and memoize the historical dataset.
 * Never throws: a missing file becomes an empty dataset plus a server log.
 */
export async function loadHistoricalCsvDataset(): Promise<HistoricalCsvDataset> {
  if (cached) return cached;

  const bundled = getBundledHistoricalCsvText();
  if (isPlausibleCsv(bundled)) {
    cached = parseHistoricalCsv(bundled, "bundle");
    console.info(
      `[CSV] loaded bundled dataset: ${cached.size} days ${cached.firstDate} → ${cached.lastDate}`,
    );
    return cached;
  }

  console.error(
    `[CSV] bundled text missing or too small (${bundled.length} chars). Trying disk fallbacks.`,
  );

  const disk = await readCsvFromDisk();
  if (disk) {
    cached = parseHistoricalCsv(disk.text, `disk:${disk.path}`);
    console.info(
      `[CSV] loaded from disk (${disk.path}): ${cached.size} days ${cached.firstDate} → ${cached.lastDate}`,
    );
    return cached;
  }

  console.error(
    "[CSV] historical dataset is not in the serverless bundle or on disk. Historical pages will render without prices rather than 500.",
  );
  cached = emptyHistoricalCsvDataset("missing");
  return cached;
}

/** Test helper — not used in production request paths. */
export function resetHistoricalCsvCacheForTests(): void {
  cached = null;
}
