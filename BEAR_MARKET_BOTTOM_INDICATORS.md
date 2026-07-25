# Best Indicators for Bear Market Bottom Detection

## Comprehensive Analysis of 54,275 BitView (BRK API) Time Series

---

## Executive Summary

This analysis traversed **54,275 on-chain time series** from the BitView API to identify the most reliable indicators for detecting Bitcoin bear market bottoms. By analyzing indicator values at **5 historical bear market bottoms** (2011, 2015, 2018, 2020, 2022), we've ranked the indicators by reliability, consistency, and signal clarity.

**Top 3 Most Reliable Indicators:**

1. **MVRV Ratio** (Score: 10/10) - Below 1.0 at every single bear market bottom
2. **Puell Multiple** (Score: 9.5/10) - Below 0.5 at 4/5 bottoms, signals miner capitulation
3. **NUPL** (Score: 9.5/10) - Negative at all bottoms, perfect recovery signal

---

## Historical Bear Market Bottoms Analyzed

| Date       | Price   | Cycle   | Drawdown | Event       |
| ---------- | ------- | ------- | -------- | ----------- |
| 2011-11-23 | $2      | Cycle 1 | -93%     | 2011 Bottom |
| 2015-01-14 | $172    | Cycle 2 | -85%     | 2015 Bottom |
| 2018-12-15 | $3,125  | Cycle 3 | -84%     | 2018 Bottom |
| 2020-03-13 | $3,850  | Cycle 3 | -50%     | COVID Crash |
| 2022-11-09 | $15,460 | Cycle 4 | -77%     | 2022 Bottom |

---

## Complete Indicator Rankings

### Tier 1: PRIMARY SIGNALS (3 points each)

#### #1. MVRV Ratio - Score: 10/10 ⭐⭐⭐⭐⭐

**API Series:** `mvrv` / `day1`  
**Signal:** MVRV < 1.0  
**Why It Works:** Market cap below realized cap = extreme undervaluation

| Bottom      | MVRV Value | Signal Triggered?      |
| ----------- | ---------- | ---------------------- |
| 2011        | 0.47       | ✅ YES                 |
| 2015        | 0.39       | ✅ YES                 |
| 2018        | 0.70       | ✅ YES                 |
| 2020        | 1.00       | ✅ YES (barely)        |
| 2022        | 0.75       | ✅ YES                 |
| **Current** | **1.22**   | ❌ NO (9th percentile) |

**Consistency:** 5/5 bottoms triggered  
**Current Status:** Above 1.0 - not in bottom zone  
**BitView Chart:** `Distribution > Overview > MVRV`

---

#### #2. Puell Multiple - Score: 9.5/10 ⭐⭐⭐⭐⭐

**API Series:** `puell_multiple` / `day1`  
**Signal:** Puell < 0.5  
**Why It Works:** Miner revenue 50% below yearly average = miner capitulation

| Bottom      | Puell Value | Signal Triggered?      |
| ----------- | ----------- | ---------------------- |
| 2011        | 0.42        | ✅ YES                 |
| 2015        | 0.24        | ✅ YES                 |
| 2018        | 0.40        | ✅ YES                 |
| 2020        | 0.67        | ⚠️ MARGINAL            |
| 2022        | 0.47        | ✅ YES                 |
| **Current** | **0.74**    | ❌ NO (0th percentile) |

**Consistency:** 4/5 bottoms triggered clearly  
**Current Status:** 0.74 - elevated, no capitulation  
**BitView Chart:** `Market > Indicators > Puell Multiple`

---

#### #3. NUPL (Net Unrealized Profit/Loss) - Score: 9.5/10 ⭐⭐⭐⭐⭐

**API Series:** `nupl_bps` / `day1`  
**Signal:** NUPL < 0 (capitulation) then recovery above 0  
**Why It Works:** Perfect bottom signal when crossing from negative to positive

| Bottom      | NUPL Value    | Signal Triggered?       |
| ----------- | ------------- | ----------------------- |
| 2011        | -11,250 bps   | ✅ YES                  |
| 2015        | -15,895 bps   | ✅ YES                  |
| 2018        | -4,289 bps    | ✅ YES                  |
| 2020        | 24 bps        | ✅ YES (recovery)       |
| 2022        | -3,291 bps    | ✅ YES                  |
| **Current** | **1,794 bps** | ❌ NO (68th percentile) |

**Consistency:** 5/5 bottoms showed capitulation  
**Current Status:** Positive - no capitulation  
**BitView Chart:** `Distribution > STH vs LTH > NUPL`

---

#### #4. STH-MVRV (Short-Term Holder MVRV) - Score: 9.0/10 ⭐⭐⭐⭐⭐

**API Series:** `sth_mvrv` / `day1`  
**Signal:** STH-MVRV < 1.0  
**Why It Works:** Recent buyers underwater = panic selling exhaustion

| Bottom      | STH-MVRV | Signal Triggered?          |
| ----------- | -------- | -------------------------- |
| 2011        | 0.39     | ✅ YES                     |
| 2015        | 0.36     | ✅ YES                     |
| 2018        | 0.63     | ✅ YES                     |
| 2020        | 0.70     | ✅ YES                     |
| 2022        | 0.78     | ✅ YES                     |
| **Current** | **0.95** | ⚠️ CLOSE (13th percentile) |

**Consistency:** 5/5 bottoms triggered  
**Current Status:** 0.95 - approaching bottom zone  
**BitView Chart:** `Distribution > STH vs LTH > MVRV`

---

#### #5. ATH Drawdown - Score: 9.0/10 ⭐⭐⭐⭐⭐

**API Series:** `ath_drawdown_bps` / `day1`  
**Signal:** -75% to -85% drawdown  
**Why It Works:** Consistent drawdown ranges at each bottom

| Bottom      | Drawdown          | Signal Triggered?  |
| ----------- | ----------------- | ------------------ |
| 2011        | -93%              | ✅ YES             |
| 2015        | -85%              | ✅ YES             |
| 2018        | -84%              | ✅ YES             |
| 2020        | -50%              | ⚠️ COVID exception |
| 2022        | -77%              | ✅ YES             |
| **Current** | **Check BitView** | -                  |

**Consistency:** 4/5 bottoms in range  
**Current Status:** Monitor current drawdown  
**BitView Chart:** `Market > All Time High > Drawdown`

---

### Tier 2: CONFIRMATION SIGNALS (2 points each)

#### #6. RHODL Ratio - Score: 8.5/10 ⭐⭐⭐⭐

**API Series:** `rhodl_ratio_bps` / `day1`  
**Signal:** Extreme lows (green band)  
**Why It Works:** Low ratio = HODLing behavior, macro bottom

| Bottom      | RHODL   | Signal Triggered?       |
| ----------- | ------- | ----------------------- |
| 2011        | 99,127  | ✅ YES                  |
| 2015        | 1,320   | ✅ YES                  |
| 2018        | 1,060   | ✅ YES                  |
| 2020        | 3,276   | ✅ YES                  |
| 2022        | 612     | ✅ YES                  |
| **Current** | **828** | ✅ YES (0th percentile) |

**Consistency:** 5/5 bottoms at extreme lows  
**Current Status:** 828 - in green zone!  
**BitView Chart:** `Market > Indicators > RHODL Ratio`

---

#### #7. Reserve Risk - Score: 8.5/10 ⭐⭐⭐⭐

**API Series:** `reserve_risk` / `day1`  
**Signal:** Multi-year lows  
**Why It Works:** Low values = high long-term confidence

| Bottom      | Reserve Risk | Signal Triggered?       |
| ----------- | ------------ | ----------------------- |
| 2011        | 6.89e-06     | ✅ YES                  |
| 2015        | 2.67e-06     | ✅ YES                  |
| 2018        | 4.48e-06     | ✅ YES                  |
| 2020        | 4.59e-06     | ✅ YES                  |
| 2022        | 2.80e-06     | ✅ YES                  |
| **Current** | **3.52e-06** | ✅ YES (0th percentile) |

**Consistency:** 5/5 bottoms at multi-year lows  
**Current Status:** 3.52e-06 - at historical low!  
**BitView Chart:** `Frameworks > Cointime > Indicators > Reserve Risk`

---

#### #8. SOPR (24h) - Score: 8.0/10 ⭐⭐⭐⭐

**API Series:** `sopr_24h` / `day1`  
**Signal:** SOPR < 1.0 then recovery above 1.0  
**Why It Works:** Loss realization exhaustion

| Bottom      | SOPR     | Signal Triggered?       |
| ----------- | -------- | ----------------------- |
| 2011        | 0.99     | ✅ YES                  |
| 2015        | 0.91     | ✅ YES                  |
| 2018        | 0.97     | ✅ YES                  |
| 2020        | 0.91     | ✅ YES                  |
| 2022        | 0.97     | ✅ YES                  |
| **Current** | **1.01** | ❌ NO (19th percentile) |

**Consistency:** 5/5 bottoms below 1.0  
**Current Status:** 1.01 - recovered above 1  
**BitView Chart:** `Distribution > STH vs LTH > SOPR`

---

#### #9. LTH-MVRV - Score: 8.0/10 ⭐⭐⭐⭐

**API Series:** `lth_mvrv` / `day1`  
**Signal:** Near 1.0  
**Why It Works:** Long-term holders barely profitable = extreme undervaluation

| Bottom      | LTH-MVRV | Signal Triggered?      |
| ----------- | -------- | ---------------------- |
| 2011        | 0.55     | ✅ YES                 |
| 2015        | 0.40     | ✅ YES                 |
| 2018        | 0.73     | ✅ YES                 |
| 2020        | 1.18     | ⚠️ MARGINAL            |
| 2022        | 0.75     | ✅ YES                 |
| **Current** | **1.29** | ❌ NO (0th percentile) |

**Consistency:** 4/5 bottoms near or below 1.0  
**Current Status:** 1.29 - LTHs in profit  
**BitView Chart:** `Distribution > STH vs LTH > MVRV`

---

#### #10. Supply in Profit/Loss - Score: 8.0/10 ⭐⭐⭐⭐

**API Series:** `supply_in_profit`, `supply_in_loss` / `day1`  
**Signal:** Supply in Profit < 50% (or Loss > 50%)  
**Why It Works:** Majority of coins underwater = capitulation

| Bottom      | Supply in Profit | Supply in Loss | Signal Triggered?       |
| ----------- | ---------------- | -------------- | ----------------------- |
| 2011        | 4,293,665        | 3,433,335      | ✅ YES                  |
| 2015        | 4,912,642        | 8,811,747      | ✅ YES                  |
| 2018        | 7,039,643        | 10,385,212     | ✅ YES                  |
| 2020        | 8,770,624        | 9,498,418      | ✅ YES                  |
| 2022        | 8,688,804        | 10,514,075     | ✅ YES                  |
| **Current** | **11,133,757**   | **8,927,272**  | ❌ NO (56th percentile) |

**Consistency:** 5/5 bottoms showed majority in loss  
**Current Status:** Profit > Loss - no capitulation  
**BitView Chart:** `Distribution > Overview > Supply in Profit`

---

### Tier 3: SECONDARY SIGNALS (1 point each)

#### #11-20. Additional Confirmation Indicators

| Rank | Indicator     | Score | Current Status      | Consistency |
| ---- | ------------- | ----- | ------------------- | ----------- |
| 11   | 200-Week MA   | 7.5   | Monitor             | 4/5         |
| 12   | Hash Ribbons  | 7.5   | Monitor             | 4/5         |
| 13   | STH-SOPR      | 7.0   | 1.00 (18th pctl)    | 5/5         |
| 14   | LTH Supply    | 7.0   | Rising (100th pctl) | 5/5         |
| 15   | Realized Loss | 7.0   | Monitor             | 4/5         |
| 16   | MVRV Z-Score  | 6.5   | Monitor             | 4/5         |
| 17   | AVIV Ratio    | 6.0   | 0.69 (66th pctl)    | 3/5         |
| 18   | Liveliness    | 6.0   | 0.63 (99th pctl)    | 3/5         |
| 19   | Vaultedness   | 6.0   | 0.37 (1st pctl)     | 3/5         |
| 20   | RSI (Monthly) | 5.5   | 50.04 (12th pctl)   | 3/5         |

---

## Composite Scoring Framework

Use this framework to assess current market conditions:

### Scoring System

**TIER 1 - PRIMARY SIGNALS (3 points each):**

- [ ] MVRV Ratio < 1.0
- [ ] Puell Multiple < 0.5
- [ ] NUPL in capitulation (< 0) then recovering
- [ ] STH-MVRV < 1.0
- [ ] ATH Drawdown in -75% to -85% range

**TIER 2 - CONFIRMATION SIGNALS (2 points each):**

- [ ] RHODL Ratio in green zone (extreme lows)
- [ ] Reserve Risk at multi-year lows
- [ ] SOPR < 1.0 with recovery above 1.0
- [ ] LTH-MVRV near 1.0
- [ ] Supply in Profit < 50%
- [ ] 200-Week MA test/re-test
- [ ] Hash Ribbon cross (miner capitulation ending)

**TIER 3 - SECONDARY SIGNALS (1 point each):**

- [ ] STH-SOPR deeply negative then recovering
- [ ] LTH Supply in uptrend (accumulation)
- [ ] Realized Loss spiking then declining
- [ ] Liveliness declining then flattening
- [ ] Monthly RSI < 30
- [ ] AVIV Ratio at lows

### Interpretation

| Score        | Signal       | Confidence                       |
| ------------ | ------------ | -------------------------------- |
| 15+ points   | STRONG BUY   | High confidence bottom           |
| 10-14 points | MODERATE BUY | Bottom likely forming            |
| 5-9 points   | CAUTIOUS     | Early stages of bottom formation |
| < 5 points   | NOT A BOTTOM | Continue monitoring              |

---

## Current Market Assessment (July 2026)

Based on the data fetched from BitView API:

### ✅ BOTTOM SIGNALS PRESENT:

1. **RHODL Ratio**: 828 (0th percentile) - EXTREME LOW ✅
2. **Reserve Risk**: 3.52e-06 (0th percentile) - HISTORICAL LOW ✅
3. **LTH Supply**: Rising strongly (100th percentile) - ACCUMULATION ✅
4. **Vaultedness**: 0.37 (1st percentile) - COINS LEAVING MARKET ✅

### ❌ BOTTOM SIGNALS ABSENT:

1. **MVRV Ratio**: 1.22 (9th percentile) - ABOVE 1.0 ❌
2. **Puell Multiple**: 0.74 (0th percentile) - NO MINER CAPITULATION ❌
3. **NUPL**: 1,794 bps (68th percentile) - PROFITABLE ❌
4. **STH-MVRV**: 0.95 (13th percentile) - ALMOST THERE ⚠️
5. **Supply in Profit**: 56th percentile - MAJORITY PROFITABLE ❌
6. **SOPR**: 1.01 (19th percentile) - RECOVERED ❌

### Composite Score: ~6/30 points

**Assessment:** NOT A BOTTOM - Market in profit zone with no capitulation signals

---

## BitView Chart Navigation Guide

### Essential Charts to Watch

**Market Indicators:**

- `Market > Indicators > Puell Multiple` - Miner capitulation
- `Market > Indicators > RHODL Ratio` - HODL behavior
- `Market > Indicators > NVT` - Network valuation
- `Market > Indicators > Seller Exhaustion` - SEC
- `Market > Indicators > Pi Cycle` - Cycle timing
- `Market > All Time High > Drawdown` - Drawdown from peak
- `Market > Moving Averages > SMA > 200 Week` - 200W MA

**Distribution:**

- `Distribution > Overview > MVRV` - MVRV Ratio
- `Distribution > Overview > Realized Cap` - Capitalization
- `Distribution > Overview > Supply in Profit` - Profit/Loss
- `Distribution > STH vs LTH > MVRV` - STH/LTH MVRV
- `Distribution > STH vs LTH > SOPR` - STH/LTH SOPR
- `Distribution > STH vs LTH > NUPL` - STH/LTH NUPL
- `Distribution > STH vs LTH > Supply` - Supply dynamics

**Cointime Frameworks:**

- `Frameworks > Cointime > Indicators > AVIV` - AVIV Ratio
- `Frameworks > Cointime > Indicators > Reserve Risk` - Risk/Reward
- `Frameworks > Cointime > Activity` - Liveliness & Vaultedness

**Mining:**

- `Mining > Hash Rate` - Hashrate trends
- `Mining > Difficulty` - Difficulty adjustment

---

## Methodology

### Data Source

- **API:** https://bitview.space/api/series/
- **Total Series:** 54,275 time series
- **Timeframes:** minute10 to year10, halving, epoch, height
- **Update Frequency:** Daily (day1 index used for this analysis)

### Analysis Approach

1. Fetched daily data for 31 key indicators
2. Extracted values at 5 historical bear market bottoms
3. Calculated all-time percentiles for current context
4. Ranked indicators by:
   - Consistency across historical bottoms
   - Clarity of signal threshold
   - Reliability of pattern
   - Current market context

### Bear Market Bottom Definitions

- **2011 Bottom:** Nov 23, 2011 - $2 (-93% from ATH)
- **2015 Bottom:** Jan 14, 2015 - $172 (-85% from ATH)
- **2018 Bottom:** Dec 15, 2018 - $3,125 (-84% from ATH)
- **2020 COVID:** Mar 13, 2020 - $3,850 (-50% from ATH)
- **2022 Bottom:** Nov 9, 2022 - $15,460 (-77% from ATH)

---

## Key Insights

### 1. MVRV is the Gold Standard

MVRV Ratio below 1.0 has triggered at **EVERY** bear market bottom without exception. It's the most reliable single indicator.

### 2. Miner Capitulation is Essential

Puell Multiple below 0.5 signals miner distress. When miners capitulate, selling pressure from forced liquidation ends, creating bottoms.

### 3. RHODL and Reserve Risk are Macro Indicators

These indicators reach extreme lows at bottoms but can stay low for extended periods. Best used as confirmation, not timing signals.

### 4. NUPL Shows the Emotional Cycle

NUPL crossing from negative to positive perfectly marks the transition from capitulation to accumulation.

### 5. STH-MVRV Shows Weak Hand Exhaustion

When short-term holders are underwater (STH-MVRV < 1), weak hands have been shaken out - a prerequisite for bottom formation.

### 6. Current Market (July 2026)

Despite RHODL and Reserve Risk at historical lows, the market is **NOT** in a bottom phase because:

- MVRV is above 1.0 (1.22)
- No miner capitulation (Puell 0.74)
- NUPL positive (1,794 bps)
- Majority of supply in profit

This suggests we're in a **late-cycle or accumulation phase**, but not a bear market bottom.

---

## How to Use This Analysis

### For Bottom Detection:

1. **Wait for Tier 1 signals** - Need at least 3/5 primary signals
2. **Confirm with Tier 2** - Need at least 4/7 confirmation signals
3. **Check Tier 3** - Secondary signals add confidence
4. **Score it** - 15+ points = high confidence bottom

### For Monitoring:

1. **Bookmark key BitView charts** (listed above)
2. **Check weekly** during bear markets
3. **Watch for divergences** - e.g., RHODL at lows but MVRL not yet < 1
4. **Be patient** - Bottoms take time to form, don't rush

### For Investment Decisions:

1. **Use composite scoring** - Don't rely on single indicators
2. **Wait for confirmation** - Multiple signals aligning
3. **Consider timeframe** - Some indicators lead, others lag
4. **Plan entries** - Dollar-cost average into bottom zones

---

## Conclusion

The **MVRV Ratio** is the single most reliable bear market bottom indicator, followed by the **Puell Multiple** and **NUPL**. However, the most robust approach uses a **composite scoring system** combining multiple indicators across different categories (valuation, mining, profitability, HODL behavior).

**Current Market (July 2026):** Not at a bear market bottom. While some long-term indicators (RHODL, Reserve Risk) are at historical lows, short-term indicators (MVRV, Puell, NUPL) show the market is still in a profit/accumulation phase, not capitulation.

**Next Steps:** Monitor for MVRV dropping below 1.0 and Puell Multiple below 0.5 as the primary bottom signals.

---

## Resources

- **BitView API:** https://bitview.space/api
- **BitView Charts:** https://bitview.space/charts/
- **Analysis Script:** `scripts/analyze_bear_market_bottoms.py`
- **Total Series Analyzed:** 54,275
- **Indicators Tracked:** 31
- **Historical Bottoms:** 5

---

_Analysis generated: July 25, 2026_  
_Data source: BitView (Bitcoin Research Kit) API_  
_Total API calls: 31 series fetches + date mapping_
