# BTC500 Retention Strategy

**Constraint that governs everything:** BTC500 is not a trading terminal. It is a **multi-year decision protocol** with rare action moments and long stretches of boredom. Retention that only works in a bull run is fake retention.

**The real product question:**  
*Why would someone open BTC500 on a random Tuesday in a sideways market, when no buy/sell is due for months?*

---

## First principles: why people return

| Mechanic | What it feels like | BTC500-native form |
|---|---|---|
| **Anticipation** | “Something is approaching” | Days-to-window, phase transitions |
| **Changing data** | “Something is different today” | Path vs history, script integrity |
| **Ownership** | “This is mine” | My plan, my entry, my P&L |
| **Shared scoreboard** | “We’re watching the same game” | One public ghost portfolio |
| **Identity** | “This is who I am” | “I follow the 500-day rule” |
| **Uncertainty / resolution** | “Is the thesis still alive?” | Script intact vs broken |
| **Comparison** | “Where am I vs them / vs past” | Cycle overlays, entry quality |
| **Progression** | “I’m further along” | Day N of the 1000-day window |
| **Ritual** | “I check this at the same time” | Morning cycle brief |
| **Social proof / FOMO** | “Others are doing this” | Commitments, shared cards |
| **Preparation** | “I need to be ready” | Buy-window readiness |

### What already exists (and what it is *not*)

You already have strong **destination** features: countdown, Cycle Score, simulator, timeline, bear bottoms, liquidations, shares/embeds.

What you mostly lack is a **habit object** — something that:

1. changes meaningfully day to day  
2. is emotionally yours or socially shared  
3. only makes sense *inside* the BTC500 philosophy  
4. still matters in a boring market  

Most crypto sites solve boredom with noise (news, prices, endless charts). That trains users to leave when BTC500 is quiet. **Do the opposite: make the quiet part of the product.**

---

# Idea generation (filtered hard)

I generated and discarded many candidates. Below are survivors only — each passed:

- “Would I open this tomorrow?”  
- “Does it strengthen buy/hold/sell-by-the-rule?”  
- “Would it still work if TradingView and Reddit vanished?”  
- “Would it still work in 18 months of sideways?”  

---

## 1. Ghost Ledger

### Name
**Ghost Ledger** (aka *The Public Position*)

### Why users return
One global paper portfolio that follows the rule perfectly:

- On the official buy date → “buys” a fixed notional (e.g. 1 BTC or $10,000)  
- Marks to market daily  
- Publishes ROI, max drawdown, days held, distance to sell, vs HODL-from-same-day, vs “bought the top”

**Behavioral loop:**  
*Shared sports score for the strategy.*  
Not “what’s BTC doing?” — “how is **the rule** doing?”

In sideways markets this is even stickier: drawdown from cycle peak, underwater days, patience pain — all update daily.

### Why competitors don't have it
Everyone shows price. Almost nobody runs a **public, rule-locked, cycle-timed paper fund** as the brand’s living proof. It is inseparable from the 500/500 rule. CoinMarketCap cannot own “BTC500’s official position.”

### User journey
- **Day 1:** Sees “Ghost Ledger is +47% since official buy · −18% from peak · 312 days to sell.” Shares the card.  
- **Day 2:** Checks if green/red day changed the story.  
- **Week 2:** Starts comparing weekly equity curve to prior cycles.  
- **Month 6:** Ghost Ledger is their mental anchor for “is this working?” — they open BTC500 before CoinMarketCap.

### Viral potential
**High.** “Official BTC500 position is +X% / −Y% DD” is a natural tweet, screenshot, and argument ender. One number, one philosophy.

### Development complexity
**M**

### Retention score
**9/10**

### Implementation notes
- Server job: daily close (and optional live mark) from existing price sources  
- State machine: `pre-buy` → `position open` → `sold` → `waiting next buy`  
- Persist series: equity, drawdown, days-in-trade  
- Share card + embed widget  
- No accounts required for the public ledger  

---

## 2. Cycle Day Atlas

### Name
**Cycle Day Atlas** (`/cycle/day/347`)

### Why users return
Every calendar day maps to **Day N since last halving** (and Day N relative to buy/sell windows). Each day gets a living page:

- price multiple vs halving-day price  
- same day-offset across 2012 / 2016 / 2020 / 2024  
- “historical twin” (closest prior path)  
- script status + distance to next rule action  
- one-sentence narrative that changes as data changes  

**Loop:** *“What day of the cycle is it, and what does that day usually mean?”*  
Becomes language people use: “We’re on Day 480.”

### Why competitors don't have it
TradingView can overlay charts; it does not publish **day-indexed cycle literature** as a product surface + SEO engine + ritual.

### User journey
- **Day 1:** Lands on today’s Cycle Day; understands “where we are.” Bookmarks.  
- **Day 2:** Day number +1; twin cycle may flip; multiple vs median shifts.  
- **Week 2:** Notices weekly path drift vs 2020.  
- **Month 6:** Uses Cycle Day as vocabulary with friends; checks before big market moves.

### Viral potential
**High for SEO + medium-high social.** “Day 500 after the halving” content compounds. Share cards for notable days (Day 0, Day 500, Day 1000) go nuclear.

### Development complexity
**M** (content system + path math; you already have much of the data path in Cycle Score)

### Retention score
**8.5/10**

### Implementation notes
- Canonical route `/cycle/day/:n` + `/cycle/today` redirect  
- Precompute historical multiples by day-offset (CSV archive)  
- SSR pages for SEO; regenerate narrative fields on price refresh  
- OG image per day or template with Day N + multiple  
- Internal links from Command Center  

---

## 3. My 500 (Personal Rule Plan)

### Name
**My 500**

### Why users return
Optional local (or lightweight link) plan:

- “I will buy / I bought on [date]”  
- amount (or BTC size)  
- optional actual fill price  
- mode: *strict rule* vs *I entered early/late*  

Dashboard becomes **their** cycle:

- unrealized P&L vs perfect rule entry  
- “entry quality” score (days early/late drag)  
- days to their sell date  
- reminders only at phase edges (not spam)

**Loop:** ownership + investment tracking without becoming a brokerage.

### Why competitors don't have it
Portfolio trackers ignore **rule fidelity**. “How wrong was my timing vs the 500-day rule?” is a BTC500-only question.

### User journey
- **Day 1:** Creates plan in 30 seconds (localStorage first). Sees projected sell date.  
- **Day 2:** Checks mark-to-market.  
- **Week 2:** Compares self vs Ghost Ledger.  
- **Month 6:** Won’t abandon the tab that holds *their* multi-year position narrative.

### Viral potential
**Medium-high.** “I entered 40 days early — cost me X% vs pure BTC500” share cards are ego + learning content.

### Development complexity
**S–M** (local-first = S; sync links/accounts = M)

### Retention score
**8.5/10** (9 if they actually committed capital; 7 if paper-only)

### Implementation notes
- v1: localStorage + exportable JSON + shareable read-only URL (`?plan=...` signed/compressed)  
- v2: optional passkey/email magic link later — only after value exists  
- Never require login to start  
- Privacy-first; amounts can be relative (“units”) not real $  

---

## 4. Script Divergence

### Name
**Script Divergence**

### Why users return
Make Cycle Score **narrative and visual**, not a static gauge:

- continuous “distance from historical median path”  
- band chart: cold / on-script / hot  
- **daily delta:** “script integrity −4 pts since yesterday”  
- plain-English: what changed (path, drawdown, on-chain flips)

**Loop:** uncertainty resolution. People reopen to see if the story broke or healed.

### Why competitors don't have it
Generic “fear & greed” is mood. This is **thesis integrity for one specific playbook.**

### User journey
- **Day 1:** “Script intact — 78. On median path.”  
- **Day 2:** Big red candle → “Hot zone. Integrity 61.” They feel the plot twist.  
- **Week 2:** Watches component contributions (path vs on-chain).  
- **Month 6:** Script Divergence is their anti-anxiety / anti-euphoria instrument.

### Viral potential
**High** when status flips. “Script broken?” posts travel. Status-change cards are built for X.

### Development complexity
**S** (extends existing Cycle Score; add history series + share states)

### Retention score
**8/10**

### Implementation notes
- Persist daily score snapshots (you need history for “delta”)  
- Event log: component that moved most  
- Threshold alerts via browser push / optional email later  
- Homepage hero integration with Ghost Ledger  

---

## 5. Path Theater

### Name
**Path Theater**

### Why users return
The definitive visualization:

- all cycles aligned on **halving = Day 0**  
- optional align on **buy date = Day −500**  
- live “you are here” marker  
- buy/sell window bands as sacred zones  
- hover any day → multi-cycle comparison  

Not a chart playground. An **opinionated theater** for one story.

### Why competitors don't have it
Overlays exist in pro tools; the **ritualized, window-banded, shareable cycle stage** does not exist as a brand experience.

### User journey
- **Day 1:** Instant orientation. “We’re here vs 2016/2020.” Bookmark.  
- **Day 2:** Marker moved one day; path shape shifts vs peers.  
- **Week 2:** Uses it after every major move.  
- **Month 6:** Default mental model of “the cycle.”

### Viral potential
**High.** Best-in-class share image: four ghost paths + live path + window bands.

### Development complexity
**M–L**

### Retention score
**8/10**

### Implementation notes
- Normalize price series by day-offset from halvings (data already in archive)  
- Canvas/WebGL or high-perf SVG; mobile-first scrubbing  
- Deep-link state: `/path?align=halving&day=340`  
- Export frame for shares  

---

## 6. Patience Protocol

### Name
**Patience Protocol**

### Why users return
The strategy’s real enemy is psychology, not data.

A living psychological instrument:

- **Underwater clock** (days Ghost / My 500 below cost)  
- **Boredom index** (realized vol + range compression in the window)  
- **Temptation map:** “historically, people panic-sell here” zones on Path Theater  
- **Hold quality:** time following rule without deviation  
- Phase-aware coaching copy (wait / buy open / hold / sell approaching)

**Loop:** when markets are boring or cruel, this is *more* useful, not less.

### Why competitors don't have it
Trading apps optimize for action. BTC500 can own **inaction as a feature.**

### User journey
- **Day 1:** “Patience load: moderate. 0 days underwater.”  
- **Day 2:** Mild red day — protocol explains this is normal at Day N.  
- **Week 2:** Starts trusting the protocol over Twitter.  
- **Month 6:** Opens BTC500 specifically when anxious — habit loop of emotional regulation.

### Viral potential
**Medium.** Less flashy daily; extremely shareable during crashes (“Don’t break the rule — Day 218 underwater happened in 2019 too”).

### Development complexity
**S–M**

### Retention score
**7.5/10** (spikes to 9 in drawdowns)

### Implementation notes
- Derive from Ghost Ledger + historical path bands  
- No fake streaks for “opened the app” — only rule-relevant metrics  
- Pair with calm UI; anti-casino aesthetic  

---

## 7. Window Rituals

### Name
**Window Rituals**

### Why users return
Phase-specific *ceremonies* that make rare moments unforgettable and quiet phases purposeful:

| Phase | Ritual |
|---|---|
| Far from buy | **Readiness** — capital plan, reminders, “why we wait” |
| T−90 → T−1 | **Approach** — escalating countdown, checklist, historical buy-day stats |
| Buy window open | **Execution week** — live “window open” state, share “I followed the rule” |
| Hold | **Stewardship** — Ghost + Patience + Script |
| T−90 to sell | **Exit approach** — historical post-halving +500 distributions |
| Sell day | **Close the book** — final card, cycle epitaph, start next wait |

**Loop:** calendar-bound identity events, like tax day or marathon week — plus preparatory micro-habits before them.

### Why competitors don't have it
Nobody productizes **the social and emotional calendar of a 1000-day rule**.

### User journey
- **Day 1:** Sees current ritual stage.  
- **Day 2:** Small checklist progress (optional).  
- **Week 2:** As stage intensity rises, visit frequency rises.  
- **Month 6:** They stayed for the hold-phase tools; rituals keep them oriented.

### Viral potential
**Extreme at transitions.** Buy-open and sell-day will be the Super Bowl ads of BTC500.

### Development complexity
**M**

### Retention score
**7.5/10** baseline; **10/10** near windows

### Implementation notes
- Phase engine already exists (`wait-buy` / `wait-sell` / `done`)  
- Content + UI skins per stage  
- Optional calendar subscribe (ICS) for buy/sell/halving  
- Generate “I bought on the rule” / “I sold on the rule” certificates (share cards, not badges spam)  

---

## 8. Entry Autopsy

### Name
**Entry Autopsy**

### Why users return
Users paste any historical buy date/price (or “I bought Jan 2024”). Site answers only BTC500-relevant questions:

- vs buying exactly 500 days pre-halving  
- vs selling exactly 500 post  
- “rule alpha / drag” in %  
- which cycle phase they actually bought in  
- counterfactual ending if they had obeyed  

**Loop:** after every personal trade regret or victory, they return for judgment against the rule — which reinforces the philosophy.

### Why competitors don't have it
PnL calculators ignore **rule counterfactuals tied to halving geometry**.

### User journey
- **Day 1:** Autopsies their bag. Mild trauma / relief. Shares result.  
- **Day 2:** Tries a friend’s entry.  
- **Week 2:** Uses it when debating DCA vs lump sum (ties to existing `/dca`).  
- **Month 6:** Default way they evaluate any Bitcoin purchase.

### Viral potential
**Very high.** “My entry was −31% vs pure BTC500” is confession content. People love being scored.

### Development complexity
**S**

### Retention score
**7/10** (more episodic than daily; strong re-acquisition + sharing)

### Implementation notes
- Reuse simulator price-on-date + phase math  
- Share card with “Rule drag: −X%”  
- SEO landing: “Bitcoin buy date analyzer”  

---

## 9. Cycle Brief

### Name
**Cycle Brief** (daily, 60-second)

### Why users return
Not a news feed. A **single screen, once per day**, generated from BTC500 data only:

1. Day N + phase  
2. Ghost Ledger daily change  
3. Script Divergence delta  
4. Path vs median  
5. On-chain flips (only if relevant to bottoms/heat)  
6. One sentence: *what this means for the next rule action*  
7. One shareable card  

**Loop:** Duolingo-simple daily open. Done in under a minute. No rabbit hole required.

### Why competitors don't have it
News apps summarize the world. This summarizes **one thesis**.

### User journey
- **Day 1:** Subscribes to brief (web; optional email later).  
- **Day 2:** Opens because yesterday’s number is stale.  
- **Week 2:** Muscle memory: coffee → Cycle Brief.  
- **Month 6:** Primary homepage job-to-be-done.

### Viral potential
**Medium-high** if the card is beautiful and opinionated. Daily card series can build an audience on X without becoming a media company.

### Development complexity
**S–M**

### Retention score
**8/10** if distribution is solved (homepage default + optional push)

### Implementation notes
- Compose from Ghost Ledger + score history + path stats  
- `/brief/YYYY-MM-DD` archive (SEO)  
- Homepage module above the fold  
- Avoid any headline scraping — purity is the brand  

---

## 10. Commitment Map

### Name
**Commitment Map**

### Why users return
Lightweight, anti-social-network commitment:

- “I’m sitting out until the buy window”  
- “I’m holding to the sell date”  
- optional anonymous cohort counts by phase  
- no feed, no comments, no moderation surface  

**Loop:** identity + FOMO without Reddit. Seeing “12,482 people waiting for the same buy window” creates belonging.

### Why competitors don't have it
Social apps need content. This is **coordinated patience**, not discussion.

### User journey
- **Day 1:** One-click commit (local + optional anonymous server count).  
- **Day 2:** Weak alone — must sit next to Ghost Ledger / Brief.  
- **Week 2:** Cohort size becomes a status people share.  
- **Month 6:** Cultural identity: “committed to the 2028 sell.”

### Viral potential
**Medium.** Cohort milestones and personal commitment cards share well; thin without the ledger.

### Development complexity
**S**

### Retention score
**6.5/10** alone; **+1 boost** when bundled with Ghost Ledger

### Implementation notes
- Anonymous counter with rate limits / proof-of-work / device hash  
- No profiles, no DMs, no posts  
- Phase-scoped commitments auto-expire at window  

---

## 11. Rule Replay (Live Season)

### Name
**Rule Replay**

### Why users return
Treat the current cycle like a **season of a show**:

- episode markers: buy day, halving, local tops, deep drawdowns, sell day  
- auto-chaptering from data  
- “previously on this cycle” recap  
- compare season arcs across cycles  

**Loop:** narrative transportation. People return to see how the season is unfolding.

### Why competitors don't have it
Price history ≠ **dramaturgy of a rule-based season**.

### User journey
- **Day 1:** Watches current season so far.  
- **Day 2:** Only if a new “episode” fires (big move) — so pair with Brief.  
- **Week 2:** Shares season poster.  
- **Month 6:** Deep emotional investment in “this season’s arc.”

### Viral potential
**High** for season posters and episode cards.

### Development complexity
**M**

### Retention score
**7/10**

### Implementation notes
- Event detection on price/on-chain thresholds  
- Episode objects with OG images  
- Integrates Path Theater + Ghost Ledger  

---

## 12. Sell Distribution Oracle

### Name
**Sell Window Oracle**

### Why users return
As sell date approaches (and educationally before):

- historical return distributions for buy→sell  
- what “500 days after” actually captured vs peak  
- opportunity cost vs holding longer  
- confidence intervals, not price targets  

**Loop:** intensifies near exits; educational earlier via simulator upgrade.

### Why competitors don't have it
Everyone predicts price. This analyzes **a fixed exit rule’s historical geometry**.

### User journey
Episodic until late cycle, then weekly/daily.

### Viral potential
**Medium-high** near sell windows.

### Development complexity
**S**

### Retention score
**6.5/10** overall; **9** near sell

### Implementation notes
- Extend simulator with distribution charts, not single averages  
- Honest: small n of cycles; show uncertainty  

---

# Self-critique (skeptical VC pass)

## Kill / demote

| Idea | Verdict | Why |
|---|---|---|
| Commitment Map alone | **Demote to booster** | Empty identity without a scoreboard. Duolingo without lessons. |
| Sell Window Oracle alone | **Keep as module, not pillar** | Too seasonal. |
| Pure streak “opened app 7 days” | **Killed** | Gimmick; violates constraints. |
| News / liquidation as retention core | **Killed for this mission** | Fine as side tools; they make BTC500 interchangeable. |
| Generic AI chat “explain the cycle” | **Killed** | Not bookmark-worthy; commodity. |
| Badges / XP | **Killed** | Meaningless without capital or rule fidelity. |
| Login-first social | **Killed** | Cost without habit object. |

## Stress tests

**If TradingView vanished, still visit?**  
Ghost Ledger, Cycle Day Atlas, Script Divergence, My 500, Cycle Brief — **yes**. Path Theater — **yes** (narrower job than TV).  

**If Reddit vanished, still discuss?**  
People will discuss Ghost P&L, script breaks, and buy-window rituals on X anyway — if the artifact is sharp. Commitment Map without an artifact — **no**.  

**18-month sideways?**  
Winners: Ghost Ledger (underwater days), Patience Protocol, Script Divergence, Cycle Brief, My 500.  
Losers: pure countdown, hype-only virality, liquidation heat maps.

## Improved survivors (merged systems)

The winning architecture is not 12 tabs. It is **one daily ritual surface** fed by a few deep objects:

```
                    ┌─────────────────────┐
                    │   CYCLE BRIEF (UI)  │  ← daily habit
                    └──────────┬──────────┘
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    Ghost Ledger        Script Divergence      Cycle Day Atlas
    (shared stake)      (thesis health)        (orientation)
           │                   │                   │
           └────────────┬──────┴────────┬──────────┘
                        ▼               ▼
                   Path Theater    My 500 / Autopsy
                   (visual truth)  (personal stake)
                        │
                        ▼
                 Window Rituals (phase skins)
                        │
                        ▼
                 Patience Protocol (psych layer)
```

---

# TOP 10 prioritization

| Rank | Idea | Retention | Virality | Dev Effort | Uniqueness | Overall |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | **Ghost Ledger** | 9 | 9 | M | 10 | **9.5** |
| 2 | **Cycle Brief** (composites the system) | 8 | 8 | S–M | 8 | **8.8** |
| 3 | **Script Divergence** (Cycle Score, made habitual) | 8 | 8 | S | 8 | **8.5** |
| 4 | **My 500** | 8.5 | 7 | S–M | 9 | **8.4** |
| 5 | **Cycle Day Atlas** | 8.5 | 8 | M | 9 | **8.4** |
| 6 | **Path Theater** | 8 | 9 | M–L | 9 | **8.2** |
| 7 | **Patience Protocol** | 7.5 | 6 | S–M | 9 | **7.8** |
| 8 | **Window Rituals** | 7.5 | 10* | M | 9 | **7.8** |
| 9 | **Entry Autopsy** | 7 | 9 | S | 8 | **7.5** |
| 10 | **Rule Replay (Season)** | 7 | 8 | M | 8 | **7.2** |

\*Virality of Window Rituals is event-spiked (buy/sell days), not daily.

**Build order (practical):**  
1) Script history + deltas → 2) Ghost Ledger → 3) Cycle Brief homepage → 4) My 500 local → 5) Cycle Day Atlas SEO → 6) Path Theater → 7) Patience + Rituals skins → 8) Entry Autopsy polish → 9) Season episodes.

---

# THE KILLER FEATURE

## Name
**The Ghost Ledger**  
*(Signature experience: “Check the Ledger.”)*

Not a widget. The **reason the brand exists in public.**

> BTC500 doesn’t just describe a strategy.  
> It **runs** the strategy in the open, every day, forever.

When someone says “BTC500,” the association should be:

**“That’s the site with the public Bitcoin position that buys 500 days before the halving and sells 500 days after — and you can watch it live.”**

---

## Product definition

### Core object: one official paper fund

| Field | Spec |
|---|---|
| Name | **BTC500 Ghost Ledger** |
| Mandate | Buy on official buy date; sell on official sell date; flat otherwise |
| Sizing | Dual display: **1.00000000 BTC** unit *and* **$10,000** inception notionals (user toggles) |
| Venue | Theoretical spot, daily close + live mark |
| Fees | Optional toggle 0 / 0.1% / 0.5% for honesty |
| Benchmarks | (1) Cash, (2) HODL from same buy, (3) Buy ATH of prior cycle & hold to sell date, (4) Perfect BTC500 historical multi-cycle stack |
| State machine | `AWAITING_BUY` → `IN_POSITION` → `REALIZED` → `AWAITING_BUY` |
| Publicness | Fully public; no login to view |

### What you see on open (signature screen)

**Above the fold — 5 seconds to value:**

1. **Status pill:** `IN POSITION · Day 418 of hold · Sell in 82 days`  
2. **Hero number:** live value / ROI since buy  
3. **Pain number:** max drawdown & current drawdown from peak since entry  
4. **Script chip:** intact / hot / lagging (from Script Divergence)  
5. **Sparkline:** equity since entry  
6. **Primary CTA:** Share Ledger card · Open Path Theater · Set My 500  

**Secondary modules (same page, not separate products):**

- Equity curve vs prior cycles’ Ghost Ledgers (synthetic historical ghosts)  
- “Days underwater” counter  
- Distance to sell window with progress ring  
- Cycle Brief strip for today  
- If `AWAITING_BUY`: capital readiness countdown + historical buy-day returns  

### Why this is the habit

| User type | Why they return |
|---|---|
| Believer following the rule | “How is **our** trade doing?” |
| Skeptic | “Waiting for it to fail so I can screenshot it” |
| Sideways-market holder | Underwater clock + drawdown is more relevant than price |
| Pre-buy waiter | Anticipation of the next official fill |
| Sharer / influencer | Fresh numbers daily without creating content from scratch |

**Would I come back tomorrow?**  
Yes — if I have emotional or intellectual stake in whether the rule is winning. The Ghost Ledger creates that stake for free, even before My 500.

**TradingView gone?** Still need the Ledger.  
**Reddit gone?** The Ledger *is* the discussion object.  
**18 months sideways?** The Ledger becomes a patience documentary.

---

## Architecture (engineering-ready)

### Domain model

```ts
type LedgerPhase = "awaiting_buy" | "in_position" | "realized";

interface GhostFill {
  side: "buy" | "sell";
  date: string;          // YYYY-MM-DD (UTC cycle calendar)
  price: number;         // official print
  btcSize: number;       // e.g. 1.0
  usdNotional: number;   // price * btcSize at fill
  cycleId: string;       // e.g. "2028-halving"
  reason: "rule_buy" | "rule_sell";
}

interface GhostPosition {
  cycleId: string;
  phase: LedgerPhase;
  entry?: GhostFill;
  exit?: GhostFill;
  // live
  markPrice: number;
  markTime: string;
  equityUsd: number;
  equityBtc: number;
  roiPct: number;
  peakEquityUsd: number;
  drawdownPct: number;
  maxDrawdownPct: number;
  daysHeld: number;
  daysUnderwater: number;
  daysToSell: number | null;
  daysToBuy: number | null;
}

interface GhostDailyBar {
  date: string;
  close: number;
  equityUsd: number;
  roiPct: number;
  drawdownPct: number;
  scriptScore: number | null;
  phase: LedgerPhase;
}

interface GhostCycleArchive {
  cycleId: string;
  buyDate: string;
  sellDate: string;
  entry: GhostFill;
  exit: GhostFill | null; // null if live
  bars: GhostDailyBar[];
  summary: {
    roiPct: number | null;
    maxDrawdownPct: number;
    daysHeld: number;
    beatHodl: boolean | null;
  };
}
```

### Services

1. **`cycle-calendar`**  
   Already conceptually in `phase.ts` / halvings: buy = nextHalving − 500d, sell = nextHalving + 500d.  
   Produce deterministic UTC dates for fills.

2. **`price-print`**  
   Reuse CSV archive + Bitstamp/exchange fallbacks.  
   Define **official print policy**: e.g. UTC 00:00 daily close from primary series; document it publicly (trust is the product).

3. **`ledger-engine` (pure functions + cron)**  
   - On each day boundary: if date == buyDate and flat → open position  
   - if date == sellDate and open → close position  
   - else mark to market  
   - update peak, DD, underwater days  
   - append `GhostDailyBar`  
   - snapshot Script Score into bar for Brief

4. **`ledger-store`**  
   - Object storage or DB: current position JSON + append-only daily bars  
   - Historical cycles as immutable archives  
   - Cache: edge-cached `GET /api/ghost-ledger` ~1–5 min TTL; daily bars long-cache

5. **`brief-composer`**  
   Inputs: ledger delta, script delta, day N, on-chain flips → Cycle Brief DTO

6. **`share-renderer`**  
   Server or client card: ROI, DD, Day N, phase, “Official BTC500 Ghost Ledger”

### API surface

```
GET /api/ghost-ledger              → current position + today brief fields
GET /api/ghost-ledger/history      → daily bars (range)
GET /api/ghost-ledger/cycles       → archived cycles summaries
GET /api/ghost-ledger/card.png     → OG image (dynamic)
GET /brief/today                   → HTML brief
GET /cycle/day/:n                  → atlas page (sibling system)
```

### Frontend routes

| Route | Role |
|---|---|
| `/` | Command Center + **Ledger hero** (replace price-as-hero) |
| `/ledger` | Full Ghost Ledger experience |
| `/ledger/history` | Prior official cycles |
| `/brief` | Daily Cycle Brief |
| Embed | `embed/ledger` mini widget for blogs |

### Event timeline (ops)

- **Daily 00:05 UTC:** close print → engine tick → store bar → regenerate OG  
- **Intraday:** mark price every 1–5 min for live hero (clearly labeled “live mark”)  
- **On buy/sell day:** special UI mode + push optional later + fixed ceremony card  

### Trust & integrity (non-negotiable)

- Publish methodology page: print source, timezone, fee assumptions  
- Never restate past official fills  
- Show “what if fees” honestly  
- Disclaimer: paper performance, not a fund, not advice  
- Small sample of real cycles — never overclaim  

### My 500 attachment (phase 2 on same architecture)

```
Ghost Ledger  = the reference clock
My 500        = user fork of the same engine with custom size/date/fill
```

Same equity math, same DD, same cards — personal overlay. This is how ownership compounds the killer feature without splitting the brand.

### Success metrics (retention-native)

| Metric | Target signal |
|---|---|
| D1/D7 return rate to `/` or `/ledger` | Leading indicator |
| Median visits / user / week | Core goal |
| Share card exports / day | Virality |
| Embed installs of ledger widget | Distribution |
| % sessions where Ledger is first viewport interaction | Product-market fit for the signature |
| Visit rate during low-volatility weeks | True habit (not bull-market mirage) |

### Why competitors will copy — and still lose

They can clone a paper portfolio. They cannot clone:

1. **The rule** as cultural IP  
2. **Years of archived official ghosts** once you start  
3. **The coupling** to Cycle Day, Script Divergence, and Window Rituals  
4. **The phrase** people will say: *“Check the Ledger.”*

Starting the Ghost Ledger **this cycle** is a moat timestamp. Every day you wait is a day of history you can’t backfill with the same authenticity (you can simulate past cycles — and should — but live unbroken public marking is the brand).

---

## Final recommendation

**Ship the habit object, not more destinations.**

1. **Ghost Ledger** as the signature experience  
2. **Script Divergence history** so the thesis can “move” day to day  
3. **Cycle Brief** as the daily wrapper  
4. **My 500** so the public game becomes personal  
5. **Cycle Day Atlas + Path Theater** for orientation, SEO, and visual monopoly  

Everything else (Patience, Rituals, Autopsy, Season) is amplification.

**North star sentence for the team:**

> If a user has one minute on a Tuesday in a boring market, BTC500 should answer — better than anyone else — *“How is the 500-day rule doing, where are we in the cycle, and what does that mean for my next decision?”*

That is not a dashboard.  
That is a **reason to bookmark.**
