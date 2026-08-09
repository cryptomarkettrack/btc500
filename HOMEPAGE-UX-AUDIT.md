# BTC500 Homepage Audit

**Role:** UX/UI · CRO · behavioral psychology  
**Goal:** Capture attention in 3–5 seconds → make users stay longer → drive deeper exploration  
**Live state used:** 114 days to buy · buy date Nov 30, 2026 · score 52 “Mid-cycle drift” · −47% from peak · path 1.00× vs ~9.89× median  
**Primary surfaces reviewed:** `HomePage.tsx`, `Btc500Hero.tsx`, `CommandCenter.tsx`, `Nav.tsx`, live `btc500.net`

---

## Context

Users are typically:

- Curious but impatient
- Scanning quickly (not reading)
- Skeptical by default
- Used to high-quality, fast, clean interfaces

---

## 1. Brutal first impression summary

**In 5 seconds this feels like a polished brand splash + a dense dashboard — not a reason to stay.**

Users open with a stylized cycle chart and the word **BTC500**. Smart visitors may *guess* “Bitcoin timing tool.” Most will not instantly know *why it matters*, *what to do*, or *what’s different from every other halving countdown*.

| Dimension | Current state |
|-----------|----------------|
| **Visually dominant** | SVG cycle chart |
| **Emotion** | Clean, competent, slightly **cold** |
| **Behavior** | **No job to do** in the hero — no primary CTA, no outcome, no social proof |

The real product (a rules-based buy/sell protocol + live “is the script intact?” score) sits **below the brand art**, then under jargon and secondary actions (preview UI after buy window, share card, embed kit).

**Honest read:** Looks legit. Explains slowly. Converts weakly. For impatient crypto scanners, it risks a bounce after “pretty chart → unclear next step.”

---

## 2. Key problems ranked by impact

| Rank | Problem | Why it kills attention / retention |
|------|---------|-------------------------------------|
| **1** | **Hero answers “what brand?” not “why care?”** | H1 is `BTC500`. Value is small mono copy under a large abstract chart. 3-second test fails for cold traffic. |
| **2** | **Best hook is underplayed: “114 days until buy”** | Buy window is imminent. That’s urgency + FOMO. It’s trapped in Command Center after brand + chart. |
| **3** | **No single primary CTA above the fold** | After hero: “Preview the homepage after the buy window,” Share, Embed. Creator tools before conviction. Wrong funnel order. |
| **4** | **Command Center is expert-dense on first contact** | “Mid-cycle drift,” “Path 1.00× vs 9.89× median,” “On-chain 5/32 · CAUTIOUS,” “Cycle command center” = cognitive tax. Skeptics leave before trust forms. |
| **5** | **Historical returns are the conversion engine — and optional/late** | Section only renders if simulator data loads; not in first viewport. Proof of the rule is the #1 reason to explore Simulator / Timeline. |
| **6** | **“Explore All Tools” is an 8-card tool dump** | Equal weight = decision paralysis. No path by intent (new / waiting / deep research). |
| **7** | **Weak action language** | Score next action: “Stay on BTC500 rules. Noise is not a signal.” True to philosophy, dead for first-visit conversion. |
| **8** | **Meta CTA competes for attention** | “Preview the homepage after the buy window” is product-theater, not the visitor’s goal. |
| **9** | **Trust signals arrive too late** | Free, no account, multi-source prices, methodology tooltips — but first screen feels like “another crypto site” without proof. |
| **10** | **Mobile: chart + full dual-panel CC = long scroll before payoff** | Thumb friction before “How it works” / returns / tools. |

---

## 3. Framework analysis

### 3.1 First impression (0–5 seconds)

**What they think now:** “Bitcoin branding… maybe a countdown… something about 500 days?”  
**Should think:** “There’s a simple rule for when to buy/sell Bitcoin around halvings — and the next buy is in **114 days**.”

**Emotion now:** mild curiosity, low urgency, possible confusion.  
**Dominant visual:** chart. **Should be:** big number + rule + one proof + one CTA.

#### Exact improvements

- Collapse hero order to: **badge → outcome headline → subhead (rule) → big “114 days to buy” → 1 primary + 1 secondary CTA → then chart or mini chart**.
- Chart becomes *supporting illustration*, not the whole above-fold story.
- Move live price next to the countdown, not as a lonely pill under the title.
- Replace brand-only H1 with a **value H1**; keep “BTC500” as logo/wordmark in nav (already there).

---

### 3.2 Clarity of value proposition

**Can they answer “Why should I care?” in 3s?**  
Barely. The rule is clear *if* they read the subhead. The *payoff* is not.

**Hook missing:** historical multiples + “next official buy in 114 days” + “no TA / one rule.”

**Rewrite direction:**

- Not: “we are BTC500.”
- Yes: “one mechanical rule has historically captured the fat part of the cycle — next buy is soon — here’s the live status.”

Full rewrite options: [§5 Rewritten homepage hero](#5-rewritten-homepage-hero).

---

### 3.3 Visual hierarchy & attention flow

**Current eye path (desktop)**

1. Nav  
2. Tiny badge  
3. **Big cycle chart** (Buy −500 / Halving / Sell +500 / “we are here”)  
4. **BTC500**  
5. Buy/sell rule  
6. Price chip  
7. **Command Center** (two competing giants: days + score)  
8. Meta preview / share / embed  

**Problem:** two “main characters” (chart story vs dashboard story) fight before the user has a reason to care.

#### Recommended first screen

```
[ Live · Next buy Nov 30, 2026 ]

HEADLINE (outcome)
SUB (rule in one breath)

[ 114 ] days to official buy date     |   optional mini score chip: 52 · Script intact?

[ Primary CTA ]  [ Secondary CTA ]

Trust row: Free · No login · Rule since 2012 · Data: blocks + multi-exchange price

THEN: simplified cycle diagram OR collapsible “See the rule on the chart”
THEN: Command Center (or rename to “Today’s cycle status”)
```

#### Inside Command Center

- Lead with **one sentence in plain English** above the score:  
  *“Buy window opens in 114 days. Cycle is mid-path: not euphoria, not a bottom signal. Rule still stands.”*
- Demote block height / monospaced block range under a “Details” disclosure on mobile.
- Rename “Cycle command center” → **“Today’s status”** or **“Cycle status”** (less mil-sim, more human).

#### Spacing

- Reduce vertical gap before first payoff (returns or CTA).
- Don’t put three secondary links (Bear / Liq / Embed) as the only “exits” from the score panel — put **one** deep-link: “See full score breakdown →” into bear meter or a score explainer.

---

### 3.4 Engagement triggers

**What makes them scroll now?** Mild curiosity about the big number; little “I need to know what happens next.”

#### Pattern interrupts to add

1. **Sticky mini-bar on scroll (mobile):** `114d to buy · Score 52 · Stay on plan`
2. **Animated counter only for days** — pair with **“Buy window opens Nov 30, 2026”** as a fixed target date.
3. **“What if you put $10k on the last buy date?”** micro-calculator teaser (exists inside phase modal — **surface on-page**, not only behind “preview after buy window”).
4. **Scroll chapter markers:** Status → Proof → How it works → Tools for *your* phase → FAQ.
5. **Chart interaction:** hover/tap zones: Buy / Halving / Sell / You are here → tooltip with date + one line.
6. **Score as a “health bar for the thesis”** not a mystery number: green/amber framing + one plain line.

#### Kill or demote

- “Preview the homepage after the buy window” as a primary-looking pill. Put it under a “Curious?” or “For nerds” secondary row, or inside a text link: *“See how this page looks after the buy.”*

---

### 3.5 Trust & credibility

**Feels legit?** Design quality: yes. **Credible strategy platform?** Incomplete in 5s.

#### Missing instant signals

- Hard numbers from completed cycles **above the fold** (e.g. “Across past full cycles: +X% / +Y% / …”).
- One-line methodology: *“Dates are calendar-fixed from the live halving estimate. Score is transparent weighted components.”*
- **Not financial advice** near outcomes (currently FAQ-only; skeptics want it near big claims).
- “Free · no account · no trading · educational” chip row.
- Source line higher: *“Block height · multi-exchange BTC price”* (currently footer-only).
- Optional: “Embeddable widgets used by newsletters/blogs” only if true — don’t fake social proof.

#### Caution

Do **not** overclaim “proven system” in the bottom CTA while score says mid-cycle drift and path is 1.00× vs 9.89× median. That tension feels salesy.

Prefer: *“Historically strong on completed cycles; live path is tracked honestly.”*

---

### 3.6 Call-to-action (CTA)

**What should the next step be?**  
For most visitors: **feel the outcome** (Simulator) or **understand the rule** (strategy article / How it works).

#### Current CTA stack (broken)

1. Preview homepage after buy window  
2. Share / download / embed  
3. Later: Calculate Your Returns  
4. Explore tools grid  
5. Final: Try Simulator / Read Strategy  

#### Improve

| Placement | Primary | Secondary |
|-----------|---------|-----------|
| Hero | **See historical returns** → `/simulator` | **How the rule works** → `#how-it-works` or strategy article |
| After score | **Open full simulator with this cycle** | **Bear meter** (why score says what it says) |
| After returns cards | **Run my $ amount** | **Compare DCA** |
| Mid-page tools | Intent-based 3 cards only | “All tools” accordion |
| Sticky mobile | **114d · Run simulator** | — |

#### CTA copy upgrades

| Avoid | Prefer |
|-------|--------|
| Calculate Your Returns | **See what $10,000 would have done** |
| Try the Simulator | **Backtest every cycle since 2012** |
| Ready to Master the Halving Cycle? | **Next buy window: Nov 30, 2026. Know the plan before it opens.** |
| Preview the homepage after the buy window | (secondary) **Peek at post-buy mode** |

---

### 3.7 Information density

| Zone | Assessment |
|------|------------|
| Above fold | Too much abstraction, not enough meaning |
| Command Center | Too much jargon density |
| Tools grid | Too many equal options |
| How it works | Good density — keep, **move up** |
| FAQ | Fine for SEO/skeptics — keep low |

#### Remove / demote

- Hero-level embed kit push  
- Share as equal peer to primary action  
- Duplicate BTC price (hero pill + CC chip) — keep one  
- Full block progress strip on first mobile view  

#### Simplify

- Score subline → one sentence max  
- Component meters: show top 2 drivers by default; “4 components” expand  
- Path multiple: translate: *“This cycle’s price path is ~1× so far; past median finished near ~10× by sell. Early.”*

#### Emphasize

- Days to buy  
- Buy date  
- 3-step rule  
- Historical return cards  
- One primary deep link  

---

### 3.8 Retention & exploration

**Why continue now?** Mostly if they already understand BTC500. New users need **guided curiosity paths**.

#### Paths by mindset

1. **“Prove it”** → Historical returns strip → Simulator  
2. **“Where are we?”** → Today’s status / score → Bear meter  
3. **“When do I act?”** → Days to buy + calendar dates → set reminder (even mailto/calendar `.ics`)  
4. **“I’m a content person”** → Embed kit (keep, later)  
5. **“I want noise”** → Liquidation / News (clearly labeled as optional market tools, not the strategy)

Nav is better grouped (Tools / Research) but homepage still dumps tools. Mirror nav intent on-page: **“For the strategy”** vs **“Market side tools”**.

#### Recommended section order

1. Hero (hook + CTA)  
2. Today’s status (slim CC)  
3. **Proof: historical performance** (never optional empty — skeleton or static fallback)  
4. How it works  
5. Phase-aware “What to do next” (3 actions max)  
6. Featured tools (3) + rest collapsed  
7. Articles  
8. FAQ  
9. Final CTA  

---

### 3.9 Mobile experience (critical)

#### Risks

- Full SVG chart height before value  
- CC stacks: giant days, then giant score, then meters — very long  
- Primary-looking orange outline button is a **meta preview**, not conversion  
- Feature grid of 8 cards is endless thumb work  
- Tooltips are hover-biased  

#### Mobile-first fixes

1. **Hero without full chart first:** number + rule + CTAs; chart behind “Show cycle chart” or half-height.  
2. **Status as two swipeable cards:** “Countdown” | “Score” (or tabs).  
3. **Sticky bottom bar:** `114 days to buy` + `See returns` (thumb zone).  
4. **Tap targets:** score tooltips → bottom sheet “How score works.”  
5. **One CTA per fold** — no share row until after proof.  
6. Compress How it works to horizontal step scroller with snap.

---

## 4. Specific improvement suggestions (concrete)

### Hero / `Btc500Hero.tsx`

1. Change H1 from brand-only `BTC500` to an outcome headline (days-to-buy or rule + payoff).  
2. Put the two-line rule **above** or immediately under the headline — not after a full chart.  
3. Add primary + secondary CTA row in hero.  
4. Shrink chart or move below CTAs; keep “we are here” only if readable on mobile.  
5. Co-locate BTC price with countdown, not as a lonely chip.

### Command Center / `CommandCenter.tsx`

1. Rename “Cycle command center” → “Today’s cycle status”.  
2. Front-run jargon with one plain-English status sentence.  
3. Translate path multiple into human language.  
4. Rewrite next-action to include **date + task** (not only philosophy).  
5. Replace Bear / Liq / Embed chip row with one primary deep link + optional overflow.  
6. Mobile: collapse block progress under “Details”.

### HomePage flow / `HomePage.tsx`

1. Demote “Preview the homepage after the buy window” (de-orange, secondary placement).  
2. Demote Share + Embed until after proof.  
3. Always render Historical Performance (skeleton / cached fallback if query fails).  
4. Move Historical Performance **immediately after** status.  
5. Move How it works up (after proof).  
6. Feature 3 tools by phase; collapse the rest.  
7. Rewrite final CTA to date-based urgency.  
8. Add trust chips under hero: Free · No login · Educational · Multi-source price.

### Copy paste patches

**Command Center header**

- From: `Cycle command center` / `Today's read · Waiting to buy`  
- To: `Today’s cycle status` / `Waiting to buy · 114 days to the official entry`

**Score next-action (first visit)**

- From: `Stay on BTC500 rules. Noise is not a signal.`  
- To: `No action yet. Official buy date is Nov 30, 2026 — mark it, ignore the noise until then.`

**Explore section title**

- From: `Explore All Tools`  
- To: `Go deeper` + tabs: `Strategy` | `Market data` | `Publish`

**How it works subhead**

- Keep: “No charts, no TA, no emotions.” — one of the strongest lines on the page. **Move section higher.**

---

## 5. Rewritten homepage hero

### Option A — Urgency + rule (recommended for current phase)

**Badge:** `Next buy window · Nov 30, 2026`  

**Headline:**  
**114 days until the BTC500 buy date.**

**Subhead:**  
Buy exactly 500 days before the halving. Sell exactly 500 days after. One rule. No charts. No emotions.

**Proof line:**  
Past full cycles returned **[X]% / [Y]% / …** following this calendar rule.*

**Primary CTA:** `See historical returns`  
**Secondary CTA:** `How the rule works`

\*Pull live from simulator; if loading, show “Loading cycle returns…” not silence.

---

### Option B — Outcome-first (cold traffic / ads)

**Headline:**  
**A mechanical Bitcoin rule built around the halving.**

**Subhead:**  
Enter 500 days before. Exit 500 days after. Track whether this cycle is still on script — live.

**Primary CTA:** `Backtest every cycle since 2012`  
**Secondary CTA:** `Check today’s cycle score`

---

### Option C — Skepticism-aware (high trust)

**Headline:**  
**Don’t trade the noise. Trade the calendar.**

**Subhead:**  
BTC500 is a public, rules-based plan: buy −500d, sell +500d from the halving. Free tools. Transparent score. No account.

**Primary CTA:** `Show me the track record`  
**Secondary CTA:** `Explain the strategy in 60 seconds`

---

### Option D — Score-led (return visitors / retention)

**Headline:**  
**Cycle score 52 — mid-cycle drift.**

**Subhead:**  
114 days to buy. Path ~1× so far vs a historical median finish near ~10×. Stay on the rule until the date.

**Primary CTA:** `Why the score is 52`  
**Secondary CTA:** `Open bear market meter`

Use D as a **status module**, not the only first-time hero.

---

## 6. New section ideas (engagement + depth)

1. **“What $10,000 did last cycle”**  
   One big P&L card → “Adjust amount” → deep link Simulator. (Lift from `PhasePreviewModal`.)

2. **“Where you are on the 1000-day map”**  
   Linear phase bar: Wait → Buy window → Hold → Sell window → Wait. Pin “You are here · 114d pre-buy.”

3. **Phase playbook (dynamic)**  
   For `wait-buy`:  
   - Don’t FOMO dip-buy  
   - Watch score / on-chain for curiosity only  
   - Mark Nov 30, 2026  
   - Optional: set calendar reminder  

4. **Ghost Ledger teaser** (see `BTC500-RETENTION-STRATEGY.md`)  
   “Official paper position follows the rule. Live mark. Shareable.” Even a static mock drives return visits.

5. **Honest score explainer strip**  
   “Score is not a buy signal. It’s script integrity: price path, drawdown, phase, on-chain bottoms.” Reduces skepticism of 52.

6. **Proof strip that never fails**  
   Static fallback multiples if API slow — empty historical section is a conversion hole.

7. **“Strategy vs noise tools”**  
   Two columns: Core (Simulator, Timeline, DCA, Articles) vs Market radar (Liq, Insider, News). Stops product identity blur.

8. **60-second strategy**  
   Short video or 3 auto-advancing panels — better than 8 equal cards.

9. **Share after proof only**  
   After returns: “Share this cycle card” — social once they believe.

---

## 7. Quick wins vs big improvements

### Quick wins (days, high ROI)

| Win | Detail |
|-----|--------|
| **Rewrite H1 + subhead** | Stop using brand-only H1; lead with days-to-buy or the rule + outcome. |
| **Hero CTAs** | Primary → Simulator with outcome copy; secondary → How it works anchor. |
| **Demote meta preview + embed** | Below status or footer of hero; de-orange the preview button. |
| **Surface buy date next to big number** | “114 days · Buy Nov 30, 2026” is clearer than “Days to buy” alone. |
| **Plain-English score line** | Replace or front-run jargon with one human sentence. |
| **Historical returns: always visible** | Skeleton + cached last known; never omit the whole section. |
| **Shrink first-screen chart** | Or move under CTAs; keep “we are here” only if readable on mobile. |
| **Final CTA rewrite** | Date-based urgency, not “master the cycle.” |
| **Tools: feature 3, collapse 5** | Simulator, Timeline, Bear meter first for this phase. |
| **Trust chips under hero** | Free · No login · Educational · Multi-source price. |

### Big improvements (weeks, structural)

| Bet | Why |
|-----|-----|
| **Hero → Status → Proof → Teach → Tools** information architecture | Matches how skeptical scanners decide. |
| **Phase-aware homepage** | Copy, CTAs, and featured tools change in wait-buy / hold / sell. |
| **Mobile dual-card status + sticky CTA bar** | Fixes retention on the real device mix. |
| **Interactive chart with dated tooltips** | Turns decoration into understanding. |
| **On-page $10k teaser calculator** | Instant “why care” without full sim navigation. |
| **Ghost Ledger / public position** | Daily reason to return when buy is still 100+ days out. |
| **Score education UX** | Bottom sheet methodology; less tooltip-only. |
| **Intent paths instead of tool directory** | Higher deep exploration, lower bounce from overwhelm. |

---

## 8. Final judgment

### Strengths (don’t throw away)

- Clear rule once found  
- Strong visual craft  
- Live countdown  
- Transparent-ish score components  
- Real secondary tools  
- Good FAQ honesty (“not financial advice”)

### Core failure

The homepage is designed like a **product showcase for people who already get it**, not a **conversion funnel for impatient skeptics**.

The chart and brand win the first glance; the **114-day buy clock**, **historical multiples**, and **one obvious next step** should.

### If you only do three things

1. **Lead with “114 days to buy” + the two-line rule + Simulator CTA.**  
2. **Put historical performance immediately after status — non-optional.**  
3. **Stop leading with preview/share/embed.**

That single reorder will do more for attention, time-on-page, and deeper exploration than any new animation.

---

## Related files

- `src/components/home/HomePage.tsx`
- `src/components/home/CommandCenter.tsx`
- `src/components/Btc500Hero.tsx`
- `src/components/Nav.tsx`
- `BTC500-RETENTION-STRATEGY.md`
- `UI-GUIDELINES.md`
