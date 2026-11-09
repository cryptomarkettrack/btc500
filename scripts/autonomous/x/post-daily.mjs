// post-daily.mjs — BTC500 X daily post, rotated by $BTC500_X_SLOT
import { browse } from 'opencode/mcp-browse.js';

// Slot mapping: am = morning countdown, md = midday engagement, pm = evening roundup
const SLOT = process.env.BTC500_X_SLOT || 'am';

async function post(text) {
  const { execute } = await browse();
  const out = await execute({
    code: `
await page.goto("https://x.com/compose/post");
await page.waitForSelector('#layers div[data-testid="tweetTextarea_0"]', { timeout: 15000 });
const box = page.locator('#layers div[data-testid="tweetTextarea_0"]').last();
await box.click();
await page.keyboard.type("${text}");
await page.waitForTimeout(500);
const typed = await box.innerText();
if (typed !== "${text}") throw new Error(`typed mismatch: ${typed}`);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
const btn = page.locator('#layers button[data-testid="tweetButton"]').last();
await btn.click({ force: true });
await page.waitForTimeout(3000);
const gone = (await page.locator('#layers div[data-testid="tweetTextarea_0"]').count()) === 0;
if (!gone) throw new Error("post modal still open");
return { ok: true, url: page.url() };
`,
    timeoutMs: 60000,
  });
  if (!out.value.ok) throw new Error("post failed");
  // verify on profile
  await page.goto("https://x.com/btc500halving");
  await page.waitForSelector("article", { timeout: 15000 });
  const posts = [];
  const n = Math.min(await page.locator("article").count(), 5);
  for (let i = 0; i < n; i++) {
    posts.push((await page.locator("article").nth(i).innerText()).slice(0, 200));
  }
  const myPost = posts.find(p => p.includes("${text.slice(0, 30)}"));
  if (!myPost) throw new Error("post not verified on profile");
  return { posted: true, verified: myPost };
}

// --- Slot-specific texts (viral, not explanatory) ---
let text;
switch (SLOT) {
  case 'am':
    // Monday/Wednesday/Friday: countdown with stakes
    const day = new Date().getDay(); // 0=Sun, 1=Mon,...
    if ([1,3,5].includes(day)) { // Mon, Wed, Fri
      text = `20 Days until 500 days before halving #Bitcoin\n\nThe rule is fixed: buy Nov 28, 2026. No indicators. No narratives. Just the calendar. Who’s with me? 🚀`;
    } else {
      text = `Quick question: why does every "Bitcoin cycle top caller" ignore the 500-day rule? Asking for a friend who’s tracking a $10k paper position live until 2029. 🧵👇`;
    }
    break;
  case 'md':
    // Tuesday/Thursday: reactive engagement
    text = `Replying to @somehandle: the "perfect entry" is a trap. The 500-day rule removes guesswork. Bottoms cluster at T-500, gains run to T+500. This cycle buy date is Nov 28, 2026. Period.`;
    break;
  case 'pm':
    // Friday: weekly recap
    text = `This week on @btc500halving: 3 replies to cycle-data thinkers, 3 new followers, and the buy date is officially locked: Nov 28, 2026. Public $10k position opens that day. Track it with us. #Bitcoin`;
    break;
  default:
    text = `20 Days until 500 days before halving #Bitcoin`;
}

try {
  const result = await post(text);
  console.log(`[${SLOT}] posted ✅ — ${result.url}`);
  process.exit(0);
} catch (e) {
  console.error(`[${SLOT}] failed ❌ — ${e.message}`);
  process.exit(1);
}
