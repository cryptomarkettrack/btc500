// Cache for CSV data: Map<dateString (YYYY-MM-DD), closePrice>
let csvPriceCache: Map<string, number> | null = null;

/**
 * Load and parse the CSV file, building a map of date -> close price
 */
async function loadCsvData(): Promise<Map<string, number>> {
  if (csvPriceCache) return csvPriceCache;

  try {
    // Fetch CSV from public folder via HTTP (works in both dev and production)
    const baseUrl = typeof window !== "undefined" ? "" : process.cwd();
    const csvUrl = `${baseUrl}/btc-usd-max.csv`;

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split("\n");
    const priceMap = new Map<string, number>();

    // Skip header (line 0), process data lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",");
      if (parts.length < 2) continue;

      // Parse date: "2013-04-28 00:00:00 UTC" -> "2013-04-28"
      const dateTimeStr = parts[0].trim();
      const dateStr = dateTimeStr.split(" ")[0];

      // Parse close price
      const closePrice = parseFloat(parts[1].trim());

      if (dateStr && Number.isFinite(closePrice) && closePrice > 0) {
        priceMap.set(dateStr, closePrice);
      }
    }

    csvPriceCache = priceMap;
    return priceMap;
  } catch (err) {
    console.error("[CSV] Failed to load CSV file:", err);
    throw new Error(`Failed to load CSV file: ${err}`);
  }
}

/**
 * Get BTC price for a specific date from the CSV file.
 * Returns null if the date is not found in the CSV.
 */
export async function getBtcPriceFromCsv(dateStr: string): Promise<number | null> {
  try {
    const priceMap = await loadCsvData();
    const price = priceMap.get(dateStr);

    if (price !== undefined) {
      console.log(`[CSV] ${dateStr} → $${price}`);
      return price;
    }

    console.warn(`[CSV] No data found for ${dateStr}`);
    return null;
  } catch (err) {
    console.error(`[CSV] Error loading price for ${dateStr}:`, err);
    return null;
  }
}

/**
 * Get multiple BTC prices from CSV for a date range.
 * Only returns dates that exist in the CSV data.
 */
export async function getBtcPricesFromCsvRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  try {
    const csvData = await loadCsvData();
    const current = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T00:00:00Z");

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const price = csvData.get(dateStr);
      if (price !== undefined) {
        priceMap.set(dateStr, price);
      }
      current.setDate(current.getDate() + 1);
    }
  } catch (err) {
    console.error("[CSV] Error loading price range:", err);
  }

  return priceMap;
}
