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

export async function fetchInsiderTrading(type: string = "7"): Promise<InsiderSummary> {
  const url = `https://finviz.com/insidertrading.ashx?tc=${type}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  const html = await response.text();
  return parseInsiderHtml(html);
}

function parseInsiderHtml(html: string): InsiderSummary {
  const rows: InsiderTransaction[] = [];

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
  return fetchInsiderTrading();
});
