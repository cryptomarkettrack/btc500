/**
 * Fetches CPI and PPI data from FRED and saves to fred-data.json.
 * Run: node scripts/fetch-fred.mjs
 *
 * This script should be run locally before deploying to update the cached data.
 * It fetches from 2018 to the current year.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FRED_SERIES = {
  CPI: "CPIAUCSL",
  PPI: "PPIACO",
};

const FRED_RELEASE_DAY = {
  CPI: 13,
  PPI: 15,
};

function parseFRED_Csv(csvText, indicator) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const values = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [dateStr, valStr] = line.split(",");
    if (!dateStr || !valStr || valStr === ".") continue;
    const n = parseFloat(valStr);
    if (isNaN(n)) continue;
    values.push({ date: dateStr, value: n });
  }

  values.sort((a, b) => a.date.localeCompare(b.date));

  const releases = [];
  const releaseDay = FRED_RELEASE_DAY[indicator];

  for (let i = 0; i < values.length; i++) {
    const { date: dataDate, value: actual } = values[i];
    const previous = i > 0 ? values[i - 1].value : null;

    let actualMoM = null;
    if (previous !== null && previous !== 0) {
      actualMoM = ((actual - previous) / previous) * 100;
      actualMoM = Math.round(actualMoM * 1000) / 1000;
    }

    let previousMoM = null;
    if (i > 1) {
      const prevPrev = values[i - 2].value;
      if (prevPrev !== 0) {
        previousMoM = ((previous - prevPrev) / prevPrev) * 100;
        previousMoM = Math.round(previousMoM * 1000) / 1000;
      }
    }

    const [yearStr, monthStr] = dataDate.split("-");
    const dataMonth = parseInt(monthStr, 10);
    const dataYear = parseInt(yearStr, 10);
    const releaseMonth = dataMonth + 1;
    const releaseYear = releaseMonth > 12 ? dataYear + 1 : dataYear;
    const actualMonth = releaseMonth > 12 ? releaseMonth - 12 : releaseMonth;
    const paddedMonth = String(actualMonth).padStart(2, "0");
    const paddedDay = String(releaseDay).padStart(2, "0");
    const releaseDate = `${releaseYear}-${paddedMonth}-${paddedDay}`;

    releases.push({
      date: releaseDate,
      releaseTimeUTC: "12:30",
      indicator,
      actual: actualMoM,
      forecast: previousMoM,
      previous: previousMoM,
    });
  }

  return releases;
}

async function fetchIndicator(indicator) {
  const seriesID = FRED_SERIES[indicator];
  const startYear = 2018;
  const endYear = new Date().getFullYear();

  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesID}&cosd=${startYear}-01-01&coed=${endYear}-12-31&fq=Monthly`;

  console.log(`Fetching ${indicator} (${seriesID}) from ${startYear} to ${endYear}...`);

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 BTC500 Macro Dashboard" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`FRED CSV fetch failed for ${indicator}: ${response.status}`);
  }

  const csvText = await response.text();
  const releases = parseFRED_Csv(csvText, indicator);
  console.log(`  → Got ${releases.length} releases for ${indicator}`);
  return releases;
}

async function main() {
  console.log("Fetching CPI and PPI data from FRED...\n");

  const [cpiReleases, ppiReleases] = await Promise.all([
    fetchIndicator("CPI"),
    fetchIndicator("PPI"),
  ]);

  const data = {
    CPI: cpiReleases,
    PPI: ppiReleases,
  };

  const json = JSON.stringify(data, null, 2);
  const rootPath = resolve("fred-data.json");
  const publicPath = resolve("public/fred-data.json");
  writeFileSync(rootPath, json);
  writeFileSync(publicPath, json);
  console.log(`\nSaved to ${rootPath} and ${publicPath}`);
  console.log(`Total: CPI=${cpiReleases.length}, PPI=${ppiReleases.length}`);
}

main().catch((err) => {
  console.error("Failed to fetch FRED data:", err);
  process.exit(1);
});
