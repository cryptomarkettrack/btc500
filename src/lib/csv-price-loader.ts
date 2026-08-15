/**
 * Isomorphic historical-CSV helpers.
 * Server functions that need the bundled file should import
 * `historical-price.server.ts` instead of reading disk themselves.
 */

export {
  lookupHistoricalPrice,
  lookupHistoricalPriceRange,
  parseHistoricalCsv,
  type HistoricalCsvDataset,
} from "./historical-csv";
