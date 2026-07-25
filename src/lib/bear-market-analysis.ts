/**
 * BitView (BRK API) Bear Market Bottom Analysis
 *
 * Traverses all key on-chain indicators via the BitView API
 * and analyzes historical patterns at bear market bottoms.
 */

// === Indicator categories to analyze ===

export interface IndicatorAnalysis {
  name: string;
  category: string;
  apiSeriesName: string;
  indexes: string[];
  description: string;
  whyRelevant: string;
  historicalBottomRanges?: string;
  currentValue?: string;
  signalType: "absolute" | "ratio" | "zscore" | "percentile" | "crossing";
}

// Bear market bottoms in Bitcoin history (approximate dates and prices)
export const BEAR_MARKET_BOTTOMS = [
  { date: "2011-11-23", price: 2, cycle: 1, event: "2011 Bottom" },
  { date: "2015-01-14", price: 172, cycle: 2, event: "2015 Bottom" },
  { date: "2018-12-15", price: 3125, cycle: 3, event: "2018 Bottom" },
  { date: "2020-03-13", price: 3850, cycle: 3, event: "COVID Crash" },
  { date: "2022-11-09", price: 15460, cycle: 4, event: "2022 Bottom" },
];

// === Complete indicator list for bear market bottom detection ===

export const BEAR_MARKET_INDICATORS: IndicatorAnalysis[] = [
  // ===== PRICE-BASED INDICATORS =====
  {
    name: "Realized Price",
    category: "Price",
    apiSeriesName: "realized_price_cents",
    indexes: ["day1"],
    description: "Average cost basis of all coins (realized cap / circulating supply)",
    whyRelevant:
      "Price below realized price historically signals bear market bottoms (capitulation)",
    signalType: "absolute",
  },
  {
    name: "MVRV Ratio",
    category: "Valuation",
    apiSeriesName: "mvrv",
    indexes: ["day1"],
    description: "Market Value to Realized Value ratio",
    whyRelevant:
      "MVRV below 1 = market cap below realized cap (undervalued). MVRV < 1 has historically marked bottoms",
    signalType: "ratio",
  },
  {
    name: "MVRV Z-Score",
    category: "Valuation",
    apiSeriesName: "mvrv_zscore",
    indexes: ["day1"],
    description: "Z-score of MVRV deviation from trend",
    whyRelevant:
      "When MVRV Z-score drops to low levels (green zone), it signals bear market bottoms",
    signalType: "zscore",
  },
  {
    name: "NUPL",
    category: "Profitability",
    apiSeriesName: "nupl_bps",
    indexes: ["day1"],
    description: "Net Unrealized Profit/Loss ratio",
    whyRelevant:
      "NUPL crossing into negative territory (capitulation) then turning positive signals bottom",
    signalType: "ratio",
  },
  {
    name: "STH-NUPL",
    category: "Profitability",
    apiSeriesName: "sth_nupl_bps",
    indexes: ["day1"],
    description: "Short-Term Holder Net Unrealized Profit/Loss",
    whyRelevant: "STH-NUPL deeply negative shows STH capitulation - a bottom signal",
    signalType: "ratio",
  },
  {
    name: "LTH-NUPL",
    category: "Profitability",
    apiSeriesName: "lth_nupl_bps",
    indexes: ["day1"],
    description: "Long-Term Holder Net Unrealized Profit/Loss",
    whyRelevant:
      "LTH-NUPL near zero shows LTHs have barely any profit left - extreme bottom territory",
    signalType: "ratio",
  },

  // ===== SOPR INDICATORS =====
  {
    name: "SOPR (24h)",
    category: "Spending",
    apiSeriesName: "sopr_24h",
    indexes: ["day1"],
    description: "Spent Output Profit Ratio - realized profit/loss of spent coins",
    whyRelevant:
      "SOPR below 1 means sellers are realizing losses. SOPR < 1 at bottoms shows exhaustion of selling",
    signalType: "ratio",
  },
  {
    name: "STH-SOPR",
    category: "Spending",
    apiSeriesName: "sth_sopr_24h",
    indexes: ["day1"],
    description: "Short-Term Holder SOPR",
    whyRelevant: "STH-SOPR deeply below 1 shows panic selling; bottom forms when it resets above 1",
    signalType: "ratio",
  },
  {
    name: "LTH-SOPR",
    category: "Spending",
    apiSeriesName: "lth_sopr_24h",
    indexes: ["day1"],
    description: "Long-Term Holder SOPR",
    whyRelevant:
      "LTH-SOPR near or below 1 is rare and indicates extreme bearish sentiment, often at macro bottoms",
    signalType: "ratio",
  },

  // ===== REALIZED CAP INDICATORS =====
  {
    name: "Realized Cap",
    category: "Capitalization",
    apiSeriesName: "realized_cap_cents",
    indexes: ["day1"],
    description: "Sum of acquisition costs of all coins",
    whyRelevant: "Realized Cap stabilizing/flattening during bear market suggests bottom formation",
    signalType: "absolute",
  },
  {
    name: "LTH Realized Cap",
    category: "Capitalization",
    apiSeriesName: "lth_realized_cap",
    indexes: ["day1"],
    description: "Long-Term Holder realized cap",
    whyRelevant: "LTH realized cap growing while price drops signals accumulation by smart money",
    signalType: "absolute",
  },
  {
    name: "Realized Loss",
    category: "Realization",
    apiSeriesName: "realized_loss",
    indexes: ["day1"],
    description: "Realized losses being locked in by sellers",
    whyRelevant:
      "Spikes in realized loss indicate panic selling; declining realized loss post-spike signals bottom",
    signalType: "absolute",
  },

  // ===== RESERVE RISK =====
  {
    name: "Reserve Risk",
    category: "Risk/Reward",
    apiSeriesName: "reserve_risk",
    indexes: ["day1"],
    description: "Price vs coin days held ratio - long-term confidence indicator",
    whyRelevant:
      "Low Reserve Risk values have historically preceded major price appreciation (buy zone below 0.01?)",
    signalType: "ratio",
  },

  // ===== DORMANCY / SEC =====
  {
    name: "Dormancy (Supply Adj)",
    category: "Activity",
    apiSeriesName: "dormancy_supplyadj",
    indexes: ["day1"],
    description: "Coin days destroyed / total coin days",
    whyRelevant:
      "Low dormancy indicates HODLing behavior; extreme lows at bottoms show lack of selling interest",
    signalType: "ratio",
  },
  {
    name: "Seller Exhaustion Constant",
    category: "Exhaustion",
    apiSeriesName: "seller_exhaustion_constant",
    indexes: ["day1"],
    description: "Ratio of coin days destroyed to market cap",
    whyRelevant:
      "Low SEC values indicate seller exhaustion - historically aligns with bear market bottoms",
    signalType: "ratio",
  },

  // ===== MINING INDICATORS =====
  {
    name: "Puell Multiple",
    category: "Mining",
    apiSeriesName: "puell_multiple",
    indexes: ["day1"],
    description: "Daily coin issuance (USD) vs 365-day moving average",
    whyRelevant:
      "Puell Multiple below 0.5 has historically marked miner capitulation and bear market bottoms",
    signalType: "ratio",
  },
  {
    name: "Hash Rate MA (1m)",
    category: "Mining",
    apiSeriesName: "hash_rate_sma_1m",
    indexes: ["day1"],
    description: "1-month simple moving average of hashrate",
    whyRelevant: "Hash rate bottoming after a drawdown signals miner capitulation ending",
    signalType: "absolute",
  },
  {
    name: "Thermocap Multiple",
    category: "Mining",
    apiSeriesName: "thermocap_multiple",
    indexes: ["day1"],
    description: "Market cap / thermocap ratio",
    whyRelevant: "Thermocap Multiple below 1 has historically signaled undervaluation and bottoms",
    signalType: "ratio",
  },

  // ===== RHODL =====
  {
    name: "RHODL Ratio",
    category: "HODL Behavior",
    apiSeriesName: "rhodl_ratio_bps",
    indexes: ["day1"],
    description: "Ratio of 1-week to 1-2 year old coin supply",
    whyRelevant: "Low RHODL ratio (near green band) historically marks bear market bottoms",
    signalType: "ratio",
  },

  // ===== SUPPLY IN PROFIT/LOSS =====
  {
    name: "Supply in Profit",
    category: "Supply",
    apiSeriesName: "supply_in_profit",
    indexes: ["day1"],
    description: "Percentage of circulating supply in profit",
    whyRelevant:
      "Supply in Profit dropping below 50% historically coincides with bear market bottoms",
    signalType: "percentile",
  },
  {
    name: "Supply in Loss",
    category: "Supply",
    apiSeriesName: "supply_in_loss",
    indexes: ["day1"],
    description: "Percentage of circulating supply at a loss",
    whyRelevant: "Supply in Loss spiking above 50% signals capitulation; peak marks bottom",
    signalType: "percentile",
  },

  // ===== CVDD / CDD =====
  {
    name: "Coin Days Destroyed",
    category: "Activity",
    apiSeriesName: "coindays_destroyed_supplyadj",
    indexes: ["day1"],
    description: "Coin Days Destroyed supply-adjusted",
    whyRelevant:
      "Very low CDD indicates old coins not moving - HODLing conviction, typical at bottoms",
    signalType: "absolute",
  },

  // ===== STH/LTH SUPPLY RATIOS =====
  {
    name: "LTH Supply",
    category: "HODL Behavior",
    apiSeriesName: "lth_supply_sats",
    indexes: ["day1"],
    description: "Long-Term Holder supply in sats",
    whyRelevant: "LTH supply increasing during bear market shows accumulation by smart money",
    signalType: "absolute",
  },
  {
    name: "STH Supply",
    category: "HODL Behavior",
    apiSeriesName: "sth_supply_sats",
    indexes: ["day1"],
    description: "Short-Term Holder supply in sats",
    whyRelevant: "STH supply decreasing signals weak hands shaken out - typical bottom formation",
    signalType: "absolute",
  },
  {
    name: "LTH/STH Supply Ratio",
    category: "HODL Behavior",
    apiSeriesName: "lth_sth_supply_ratio",
    indexes: ["day1"],
    description: "Ratio of LTH to STH supply",
    whyRelevant: "Ratio rising during bear market confirms HODLing behavior and bottom formation",
    signalType: "ratio",
  },

  // ===== STH COST BASIS =====
  {
    name: "STH MVRV",
    category: "Valuation",
    apiSeriesName: "sth_mvrv",
    indexes: ["day1"],
    description: "Short-Term Holder MVRV",
    whyRelevant:
      "STH MVRV below 1 shows recent buyers underwater - bottom when it recovers above 1",
    signalType: "ratio",
  },
  {
    name: "LTH MVRV",
    category: "Valuation",
    apiSeriesName: "lth_mvrv",
    indexes: ["day1"],
    description: "Long-Term Holder MVRV",
    whyRelevant: "LTH MVRV near 1 indicates no profit - extreme undervaluation",
    signalType: "ratio",
  },

  // ===== COINTIME INDICATORS =====
  {
    name: "AVIV Ratio",
    category: "Cointime",
    apiSeriesName: "aviv_ratio",
    indexes: ["day1"],
    description: "Active Value / Invested Value ratio",
    whyRelevant:
      "Low AVIV ratio signals investor conviction; bottoms form when active value is low relative to invested",
    signalType: "ratio",
  },
  {
    name: "Liveliness",
    category: "Cointime",
    apiSeriesName: "liveliness",
    indexes: ["day1"],
    description: "Coin days destroyed / coin days created",
    whyRelevant:
      "Liveliness falling during bear market shows HODLing; the pivot point can signal bottom",
    signalType: "ratio",
  },
  {
    name: "Vaultedness",
    category: "Cointime",
    apiSeriesName: "vaultedness",
    indexes: ["day1"],
    description: "Vaulted supply / total supply",
    whyRelevant:
      "Vaultedness increasing shows coins being taken off market - accumulation, bottom formation",
    signalType: "ratio",
  },

  // ===== PI CYCLE =====
  {
    name: "Pi Cycle Ratio",
    category: "Cycle",
    apiSeriesName: "pi_cycle_ratio",
    indexes: ["day1"],
    description: "111d SMA / 350d SMA x 2 ratio",
    whyRelevant:
      "Pi Cycle cross below 1 historically marks cycle bottoms (also used for tops with different formula)",
    signalType: "crossing",
  },

  // ===== MACD =====
  {
    name: "RSI (1m)",
    category: "Momentum",
    apiSeriesName: "rsi_1m",
    indexes: ["day1"],
    description: "Monthly Relative Strength Index",
    whyRelevant: "Monthly RSI below 30 historically marks oversold bear market bottoms",
    signalType: "ratio",
  },
  {
    name: "RSI (1w)",
    category: "Momentum",
    apiSeriesName: "rsi_1w",
    indexes: ["day1"],
    description: "Weekly Relative Strength Index",
    whyRelevant: "Weekly RSI below 30 signals oversold conditions typical at bottoms",
    signalType: "ratio",
  },

  // ===== ATH DRAWDOWN =====
  {
    name: "ATH Drawdown",
    category: "Price",
    apiSeriesName: "ath_drawdown_bps",
    indexes: ["day1"],
    description: "Drawdown from All-Time High in basis points",
    whyRelevant:
      "Historical bear market bottoms show consistent drawdown ranges (-75% to -85%+ from ATH)",
    signalType: "ratio",
  },

  // ===== AVERAGE DOLLAR COST BASIS =====
  {
    name: "200 Week MA",
    category: "Moving Average",
    apiSeriesName: "price_sma_200w",
    indexes: ["day1"],
    description: "200-week simple moving average",
    whyRelevant:
      "Price below 200W MA historically marks bear market bottoms (never been below for long)",
    signalType: "crossing",
  },
  {
    name: "200 Week MA Ratio",
    category: "Moving Average",
    apiSeriesName: "price_sma_200w_ratio",
    indexes: ["day1"],
    description: "Price / 200-week SMA ratio",
    whyRelevant:
      "Ratio below 1 indicates price below 200W MA; extreme lows (<0.5) have marked bottoms",
    signalType: "ratio",
  },

  // ===== MINER INDICATORS =====
  {
    name: "Hash Ribbons (30d/60d)",
    category: "Mining",
    apiSeriesName: "hash_ribbon",
    indexes: ["day1"],
    description: "Hash rate 30-day MA crossing above 60-day MA",
    whyRelevant:
      "Hash ribbons squeeze/cross has historically signaled miner capitulation ending - a reliable bottom signal",
    signalType: "crossing",
  },

  // ===== ADDRESS ACTIVITY =====
  {
    name: "Active Addresses",
    category: "Network",
    apiSeriesName: "active_addresses",
    indexes: ["day1"],
    description: "Unique active addresses per day",
    whyRelevant:
      "Address activity bottoms before price bottoms; re-acceleration signals network recovery",
    signalType: "absolute",
  },

  // ===== STH/LTH Greed Index =====
  {
    name: "STH Greed Index",
    category: "Sentiment",
    apiSeriesName: "sth_greed_index",
    indexes: ["day1"],
    description: "Short-Term Holder Greed Index",
    whyRelevant: "Extreme fear/greed cycles - bottom when STH fear is max (low index value)",
    signalType: "ratio",
  },
  {
    name: "LTH Greed Index",
    category: "Sentiment",
    apiSeriesName: "lth_greed_index",
    indexes: ["day1"],
    description: "Long-Term Holder Greed Index",
    whyRelevant:
      "LTH greed index at lows shows even strong hands are fearful - contrarian buy signal",
    signalType: "ratio",
  },
];

// BITVIEW API INDICATOR HIERARCHY FLAT LIST (from brk.series)
// Each series is accessed via: /api/series/{series_name}/{index}/data?start=&end=
// Indexes: day1, week1, month1, halving, epoch, height, etc.
export const SERIES_INDEXES = [
  "minute10",
  "minute30",
  "hour1",
  "hour4",
  "hour12",
  "day1",
  "day3",
  "week1",
  "month1",
  "month3",
  "month6",
  "year1",
  "year10",
  "halving",
  "epoch",
  "height",
];
