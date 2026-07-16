import * as cheerio from "cheerio";

const URL = "https://www.investing.com/economic-calendar/more-history";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
};

let timestamp = "2026-07-14";

const releases = [];

while (true) {
  const body = new URLSearchParams({
    eventID: "733",
    event_attr_ID: "733",
    event_timestamp: timestamp,
    is_speech: "0",
  });

  const res = await fetch(URL, {
    method: "POST",
    headers,
    body,
  });

  const json = await res.json();

  const $ = cheerio.load(`<table>${json.historyRows}</table>`);

  $("tr").each((_, row) => {
    const td = $(row).find("td");

    if (td.length < 5) return;

    releases.push({
      releaseDate: $(td[0]).text().trim(),
      time: $(td[1]).text().trim(),
      actual: $(td[2]).text().trim(),
      forecast: $(td[3]).text().trim(),
      previous: $(td[4]).text().trim(),
    });
  });

  if (!json.hasMoreHistory) break;

  timestamp = releases.at(-1).releaseDate;
}

console.log(releases);
