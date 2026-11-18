import { createServerFn } from "@tanstack/react-start";
import { computeSpacingReport, emptySpacingReport, type SpacingReport } from "./halving-spacing";

/**
 * The spacing test, computed from the same daily-close archive the simulator
 * and /data/500-day-cycles.json read.
 *
 * No cache layer: this is ~5,000 map lookups over twelve windows, and a cached
 * copy is one more thing that can disagree with the archive behind it.
 */
export const getSpacingData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SpacingReport> => {
    try {
      const { getHistoricalDataset } = await import("./historical-price.server");
      const dataset = await getHistoricalDataset();
      console.info(
        `[spacing] dataset source=${dataset.source} size=${dataset.size} ${dataset.firstDate}→${dataset.lastDate}`,
      );
      return computeSpacingReport(dataset);
    } catch (err) {
      console.error("[spacing] failed to build the spacing report:", err);
      return emptySpacingReport();
    }
  },
);
