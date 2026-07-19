import { createServerFn } from "@tanstack/react-start";

export interface InsiderTransaction {
  ticker: string;
  company: string;
  insider: string;
  title: string;
  date: string;
  type: "Buy" | "Sale" | "Proposed Sale" | "Option Exercise";
  price: number;
  shares: number;
  value: number;
  held: number;
  filingDate: string;
}

export interface InsiderSummary {
  total: number;
  buys: number;
  sales: number;
  proposedSales: number;
  options: number;
  buyTotalValue: number;
  saleTotalValue: number;
  proposedSaleTotalValue: number;
  optionTotalValue: number;
  transactions: InsiderTransaction[];
  fetchDate: string;
}

// --- Retry / timeout configuration ---
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchInsiderTradingInternal(type: string = "7"): Promise<InsiderSummary> {
  const url = `https://finviz.com/insidertrading.ashx?tc=${type}`;

  const HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  // Retry logic with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, { headers: HEADERS }, FETCH_TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Validate we got actual HTML, not an error page
      if (!html.includes("fv-insider-row") && !html.includes("<table")) {
        throw new Error("Invalid response: expected insider trading table not found");
      }

      return parseInsiderHtml(html);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[insider-trading] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError.message,
      );

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error("Failed to fetch insider trading data after retries");
}

function parseInsiderHtml(html: string): InsiderSummary {
  const rows: InsiderTransaction[] = [];

  try {
    // Match each table row in the insider-table
    const rowRegex =
      /<tr class="fv-insider-row (is-buy-\d|is-sale-\d|is-proposedSale-\d|is-option).*?<\/tr>/gs;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[0];
      const rowClass = rowMatch[1];

      // Determine transaction type
      let type: InsiderTransaction["type"];
      if (rowClass.startsWith("is-buy")) type = "Buy";
      else if (rowClass.startsWith("is-sale")) type = "Sale";
      else if (rowClass.startsWith("is-proposedSale")) type = "Proposed Sale";
      else if (rowClass.startsWith("is-option")) type = "Option Exercise";
      else continue;

      // Extract cells
      const cells = extractTableCells(rowHtml);
      if (cells.length < 10) continue;

      // Parse ticker
      const tickerMatch = cells[0].match(
        /<a[^>]*href="[^"]*stock\?t=([^"&]+)[^"]*"[^>]*>([^<]+)<\/a>/,
      );
      const ticker = tickerMatch ? tickerMatch[1] : "";

      // Insider name
      const insiderMatch = cells[1].match(/<a[^>]*>([^<]+)<\/a>/);
      const insider = insiderMatch ? insiderMatch[1].trim() : "";

      // Title
      const title = cells[2]?.trim() || "";

      // Date
      const date = cells[3]?.trim() || "";

      // Type text - skip (we already have it)

      // Price
      const price = parseFloat(cells[5]?.trim().replace(/,/g, "") || "0") || 0;

      // Shares
      const shares = parseInt(cells[6]?.trim().replace(/,/g, "") || "0", 10) || 0;

      // Value
      const value = parseInt(cells[7]?.trim().replace(/,/g, "") || "0", 10) || 0;

      // Held
      const heldText = cells[8]?.trim().replace(/,/g, "");
      const held = heldText ? parseInt(heldText, 10) || 0 : 0;

      // Filing date
      const filingMatch = cells[9]?.match(/<a[^>]*>([^<]+)<\/a>/);
      const filingDate = filingMatch ? filingMatch[1].trim() : cells[9]?.trim() || "";

      // Only include Buy and Sale transactions for the main analysis
      // (Option Exercise and Proposed Sale are different types of events)
      if (ticker) {
        rows.push({
          ticker,
          company: "",
          insider,
          title,
          date,
          type,
          price,
          shares,
          value,
          held,
          filingDate,
        });
      }
    }
  } catch (err) {
    console.error("[insider-trading] Error parsing HTML:", err);
    throw new Error("Failed to parse insider trading data from HTML");
  }

  // Compute summary
  let buyTotalValue = 0;
  let saleTotalValue = 0;
  let proposedSaleTotalValue = 0;
  let optionTotalValue = 0;
  let buys = 0;
  let sales = 0;
  let proposedSales = 0;
  let options = 0;

  for (const t of rows) {
    if (t.type === "Buy") {
      buys++;
      buyTotalValue += t.value;
    } else if (t.type === "Sale") {
      sales++;
      saleTotalValue += t.value;
    } else if (t.type === "Proposed Sale") {
      proposedSales++;
      proposedSaleTotalValue += t.value;
    } else if (t.type === "Option Exercise") {
      options++;
      optionTotalValue += t.value;
    }
  }

  return {
    total: rows.length,
    buys,
    sales,
    proposedSales,
    options,
    buyTotalValue,
    saleTotalValue,
    proposedSaleTotalValue,
    optionTotalValue,
    transactions: rows,
    fetchDate: new Date().toISOString(),
  };
}

function extractTableCells(rowHtml: string): string[] {
  const cells: string[] = [];
  // Match <td>...</td> including any nested tags
  const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
  let match;
  while ((match = cellRegex.exec(rowHtml)) !== null) {
    cells.push(match[1].trim());
  }
  return cells;
}

export const getInsiderTrading = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await fetchInsiderTradingInternal();
  } catch (err) {
    console.error("[insider-trading] Server error:", err);
    throw new Error(
      `Failed to fetch insider trading data: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
});
