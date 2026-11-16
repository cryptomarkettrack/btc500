// post-daily.mjs — BTC500 X daily post, rotated by BTC500_X_SLOT
//
// Runs the real Brave browser through the local browse MCP's `execute` tool.
// `browse mcp` exposes three tools (execute, status, tabs); this file contains
// the tiny stdio JSON-RPC client needed to call `execute` from plain Node.
import { spawn } from "node:child_process";

const SLOT = process.env.BTC500_X_SLOT || "am";

/** Minimal stdio client for `browse mcp`. */
async function browse() {
  const child = spawn("browse", ["mcp"], { stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map();
  let buffer = "";
  let nextId = 1;
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    let i;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    }
  });
  child.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  function send(method, params = {}) {
    const id = nextId++;
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (pending.delete(id)) reject(new Error(`browse mcp timeout: ${method}`));
      }, 90_000);
    });
  }

  try {
    await send("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "btc500-post-daily", version: "1" },
    });
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n",
    );

    return {
      async execute({ code, timeoutMs = 90_000 }) {
        const result = await send("tools/call", {
          name: "execute",
          arguments: { code, timeoutMs },
        });
        const text = result?.content?.map((c) => c.text ?? "").join("\n") ?? "";
        if (result?.isError) throw new Error(text || stderr || "browse execute failed");
        let value;
        try {
          value = JSON.parse(text);
        } catch {
          value = { raw: text };
        }
        return { value };
      },
      close() {
        child.kill();
      },
    };
  } catch (err) {
    child.kill();
    throw err;
  }
}

/** Read the live buy date from the site's own llms.txt so post copy can't go stale. */
async function liveBuyDate() {
  try {
    const res = await fetch("https://btc500.net/llms.txt");
    const txt = await res.text();
    const match = /Next BTC500 buy date:.*?is ([A-Z][a-z]+ \d{1,2}, \d{4})/.exec(txt);
    if (match) return new Date(`${match[1]} 00:00:00 GMT`);
  } catch {
    // fall through to a clearly-labelled unknown
  }
  return null;
}

function daysUntil(date) {
  if (!date) return null;
  const start = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  );
  return Math.max(0, Math.round((date.getTime() - start) / 86_400_000));
}

function buildText(buyDate, days) {
  const dateLabel = buyDate
    ? buyDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "the buy window";
  const stake = days !== null ? `${days} days until` : "Countdown to";

  switch (SLOT) {
    case "am": {
      if (days !== null && days <= 0) {
        return `The BTC500 buy window is open. Public $50,000 paper position, live P&L from today:\nhttps://btc500.net/paper-buy\n\nOne rule. No indicators. #Bitcoin`;
      }
      return `${stake} the BTC500 buy date (${dateLabel}).\n\nBuy 500 days before the halving. Sell 500 days after. No indicators, no narratives.\n\nFrom that date: a public $50,000 paper position with live P&L.\nhttps://btc500.net/paper-buy\n\n#Bitcoin`;
    }
    case "md":
      return `"Perfect entry" is a trap. The 500-day rule removes the guesswork: buy ${dateLabel}, sell 500 days after the halving.\n\nWe track $50,000 in public from that date:\nhttps://btc500.net/paper-buy\n\n#Bitcoin`;
    case "pm":
      return `The only trade on this account is a date: ${dateLabel}.\n\n$50,000 paper position, live P&L, no discretionary exits.\nhttps://btc500.net/paper-buy\n\n#Bitcoin`;
    default:
      return `BTC500: buy 500 days before the halving, sell 500 days after.\n\nBuy date ${dateLabel}. Public $50,000 paper record:\nhttps://btc500.net/paper-buy\n\n#Bitcoin`;
  }
}

async function main() {
  const buyDate = await liveBuyDate();
  const text = buildText(buyDate, daysUntil(buyDate));
  if (text.length > 280) throw new Error(`post too long (${text.length} chars)`);

  const b = await browse();
  try {
    // Escape the post text as a JSON string literal so quotes, newlines and
    // emoji cannot break the generated JavaScript.
    const jsText = JSON.stringify(text);
    const compose = `
const text = ${jsText};
await page.goto("https://x.com/compose/post");
await page.waitForSelector('#layers div[data-testid="tweetTextarea_0"]', { timeout: 15000 });
const box = page.locator('#layers div[data-testid="tweetTextarea_0"]').last();
await box.click();
// Clear any autosaved draft before typing.
if ((await box.innerText()).trim()) {
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
}
for (const [i, line] of text.split("\\n").entries()) {
  if (i > 0) await page.keyboard.press("Shift+Enter");
  await page.keyboard.type(line);
}
await page.waitForTimeout(500);
const typed = await box.innerText();
if (typed !== text) throw new Error("typed mismatch: " + JSON.stringify(typed));
await page.keyboard.press("Escape"); // dismiss hashtag autocomplete
await page.waitForTimeout(300);
const btn = page.locator('#layers button[data-testid="tweetButton"]').last();
if (!(await btn.isEnabled())) throw new Error("post button disabled");
await btn.click({ force: true });
await page.waitForTimeout(3000);
const gone = (await page.locator('#layers div[data-testid="tweetTextarea_0"]').count()) === 0;
return { ok: gone, url: page.url() };
`;
    const posted = await b.execute({ code: compose, timeoutMs: 90_000 });
    if (!posted.value?.ok) throw new Error(`post not accepted: ${JSON.stringify(posted.value)}`);

    // Verification stays inside execute — `page` does not exist in Node.
    const verify = `
await page.goto("https://x.com/btc500halving");
await page.waitForSelector("article", { timeout: 15000 });
const n = Math.min(await page.locator("article").count(), 6);
const posts = [];
for (let i = 0; i < n; i++) {
  posts.push((await page.locator("article").nth(i).innerText()).slice(0, 400));
}
return { posts, needle: ${JSON.stringify(text.slice(0, 24))} };
`;
    const verified = await b.execute({ code: verify, timeoutMs: 60_000 });
    const found = (verified.value?.posts ?? []).find((p) => p.includes(verified.value.needle));
    if (!found) throw new Error("post not verified on profile");

    console.log(`[${SLOT}] posted and verified — ${posted.value.url}`);
    console.log(found.split("\n").slice(0, 8).join("\n"));
  } finally {
    b.close();
  }
}

main().catch((e) => {
  console.error(`[${SLOT}] failed — ${e.message}`);
  process.exit(1);
});
