import { createServerFn } from "@tanstack/react-start";
import { lookupHistoricalPrice } from "./historical-csv";
import { getHistoricalDataset } from "./historical-price.server";

export interface SignalPriceData {
  /** Last daily close from the bundled archive — never a live API guess. */
  price: number | null;
  date: string | null;
  source: string;
}

/**
 * Last known close for the signal cards and the OG image. Reuses the same
 * daily-close archive the simulator and /data/500-day-cycles.json use, so every
 * surface quotes the same number. No new data provider is introduced.
 */
export const getSignalPrice = createServerFn({ method: "GET" }).handler(
  async (): Promise<SignalPriceData> => {
    try {
      const dataset = await getHistoricalDataset();
      const price = dataset.lastDate ? lookupHistoricalPrice(dataset, dataset.lastDate) : null;
      return { price, date: dataset.lastDate, source: dataset.source };
    } catch (err) {
      console.error("[buy-signal] last close unavailable:", err);
      return { price: null, date: null, source: "unavailable" };
    }
  },
);
