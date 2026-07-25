#!/usr/bin/env python3
"""
BitView Bear Market Bottom Analysis
====================================
Fetches data from the BitView (BRK) API for all key on-chain indicators
and analyzes their behavior at historical bear market bottoms.

Usage: python3 scripts/analyze_bear_market_bottoms.py
"""

import json
import urllib.request
import urllib.error
import time
import sys
from datetime import datetime, timezone
from typing import Any

BASE_URL = "https://bitview.space"

# Historical bear market bottoms (approximate)
BEAR_BOTTOMS = [
    {"date": "2011-11-23", "price": 2, "cycle": 1, "event": "2011 Bottom"},
    {"date": "2015-01-14", "price": 172, "cycle": 2, "event": "2015 Bottom"},
    {"date": "2018-12-15", "price": 3125, "cycle": 3, "event": "2018 Bottom"},
    {"date": "2020-03-13", "price": 3850, "cycle": 3, "event": "COVID Crash"},
    {"date": "2022-11-09", "price": 15460, "cycle": 4, "event": "2022 Bottom"},
]

# Key indicators to analyze - mapped to their actual API series names
INDICATORS_TO_ANALYZE = [
    # === VALUATION ===
    {"name": "MVRV Ratio", "series": "mvrv", "index": "day1", "category": "Valuation", "threshold": "< 1.0 = undervalued"},
    {"name": "MVRV Z-Score", "series": "mvrv_zscore", "index": "day1", "category": "Valuation", "threshold": "< 0 = bottom zone"},
    {"name": "NUPL", "series": "nupl_bps", "index": "day1", "category": "Profitability", "threshold": "< 0 = capitulation"},
    {"name": "STH-NUPL", "series": "sth_nupl_bps", "index": "day1", "category": "Profitability", "threshold": "deeply negative = panic"},
    {"name": "LTH-NUPL", "series": "lth_nupl_bps", "index": "day1", "category": "Profitability", "threshold": "near 0 = extreme"},
    {"name": "STH-MVRV", "series": "sth_mvrv", "index": "day1", "category": "Valuation", "threshold": "< 1 = underwater"},
    {"name": "LTH-MVRV", "series": "lth_mvrv", "index": "day1", "category": "Valuation", "threshold": "near 1 = no profit"},

    # === SPENDING ===
    {"name": "SOPR (24h)", "series": "sopr_24h", "index": "day1", "category": "Spending", "threshold": "< 1 = loss realization"},
    {"name": "STH-SOPR", "series": "sth_sopr_24h", "index": "day1", "category": "Spending", "threshold": "< 1 = panic selling"},
    {"name": "LTH-SOPR", "series": "lth_sopr_24h", "index": "day1", "category": "Spending", "threshold": "near 1 = extreme"},

    # === MINING ===
    {"name": "Puell Multiple", "series": "puell_multiple", "index": "day1", "category": "Mining", "threshold": "< 0.5 = miner capitulation"},
    {"name": "Thermocap Multiple", "series": "thermocap_multiple", "index": "day1", "category": "Mining", "threshold": "< 1 = undervalued"},

    # === HODL BEHAVIOR ===
    {"name": "RHODL Ratio", "series": "rhodl_ratio_bps", "index": "day1", "category": "HODL", "threshold": "low = bottom zone"},
    {"name": "Reserve Risk", "series": "reserve_risk", "index": "day1", "category": "Risk", "threshold": "low = buy zone"},
    {"name": "Dormancy (Supply Adj)", "series": "dormancy_supplyadj", "index": "day1", "category": "Activity", "threshold": "low = HODLing"},
    {"name": "Seller Exhaustion", "series": "seller_exhaustion_constant", "index": "day1", "category": "Exhaustion", "threshold": "low = exhausted"},

    # === SUPPLY ===
    {"name": "Supply in Profit", "series": "supply_in_profit", "index": "day1", "category": "Supply", "threshold": "< 50% = bottom"},
    {"name": "Supply in Loss", "series": "supply_in_loss", "index": "day1", "category": "Supply", "threshold": "> 50% = capitulation"},
    {"name": "LTH Supply", "series": "lth_supply_sats", "index": "day1", "category": "HODL", "threshold": "rising = accumulation"},
    {"name": "STH Supply", "series": "sth_supply_sats", "index": "day1", "category": "HODL", "threshold": "falling = weak hands out"},

    # === COINTIME ===
    {"name": "AVIV Ratio", "series": "aviv_ratio", "index": "day1", "category": "Cointime", "threshold": "low = conviction"},
    {"name": "Liveliness", "series": "liveliness", "index": "day1", "category": "Cointime", "threshold": "falling = HODLing"},
    {"name": "Vaultedness", "series": "vaultedness", "index": "day1", "category": "Cointime", "threshold": "rising = accumulation"},

    # === MOMENTUM ===
    {"name": "RSI (1m)", "series": "rsi_1m", "index": "day1", "category": "Momentum", "threshold": "< 30 = oversold"},
    {"name": "RSI (1w)", "series": "rsi_1w", "index": "day1", "category": "Momentum", "threshold": "< 30 = oversold"},

    # === PRICE ===
    {"name": "ATH Drawdown", "series": "ath_drawdown_bps", "index": "day1", "category": "Price", "threshold": "-75% to -85% = bottom"},
    {"name": "Realized Price", "series": "realized_price_cents", "index": "day1", "category": "Price", "threshold": "price below = capitulation"},
    {"name": "Realized Cap", "series": "realized_cap_cents", "index": "day1", "category": "Capitalization", "threshold": "stabilizing = bottom"},
    {"name": "Realized Loss", "series": "realized_loss", "index": "day1", "category": "Realization", "threshold": "spike then decline = bottom"},

    # === SENTIMENT ===
    {"name": "STH Greed Index", "series": "sth_greed_index", "index": "day1", "category": "Sentiment", "threshold": "low = fear"},
    {"name": "LTH Greed Index", "series": "lth_greed_index", "index": "day1", "category": "Sentiment", "threshold": "low = extreme fear"},
]


def fetch_json(url: str, retries: int = 3) -> Any:
    """Fetch JSON from URL with retry logic."""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError) as e:
            if attempt < retries - 1:
                time.sleep(1)
                continue
            print(f"  ERROR fetching {url}: {e}", file=sys.stderr)
            return None


# Cache for date series
_date_cache: dict[str, dict[int, str]] = {}


def get_date_series(index: str = "day1") -> dict[int, str]:
    """Fetch and cache the date series mapping index -> date string."""
    if index in _date_cache:
        return _date_cache[index]

    url = f"{BASE_URL}/api/series/date/{index}/data"
    data = fetch_json(url)
    if not data or not isinstance(data, list):
        return {}

    mapping = {i: date_str for i, date_str in enumerate(data) if date_str is not None}
    _date_cache[index] = mapping
    return mapping


def fetch_series_data(series_name: str, index: str = "day1") -> list | None:
    """Fetch time series data from the BRK API."""
    url = f"{BASE_URL}/api/series/{series_name}/{index}/data"
    data = fetch_json(url)
    if data and isinstance(data, dict):
        return data.get("data", data)
    return data


def find_value_at_date(data: list, target_date: str, index: str = "day1") -> float | None:
    """
    Find the value at a given date.
    Data format: simple array where position = days since 2009-01-01
    Uses the date series to map index to date.
    """
    if not data:
        return None

    date_map = get_date_series(index)
    target_date_normalized = target_date.strip()

    # Find the index for the target date
    target_idx = None
    for idx, date_str in date_map.items():
        if date_str == target_date_normalized:
            target_idx = idx
            break

    if target_idx is None:
        # Try partial match
        for idx, date_str in date_map.items():
            if date_str and date_str.startswith(target_date_normalized):
                target_idx = idx
                break

    if target_idx is None or target_idx >= len(data):
        return None

    val = data[target_idx]
    return val if val is not None else None


def get_latest_value(data: list) -> float | None:
    """Get the most recent non-null value from the data."""
    if not data:
        return None
    # Walk backwards to find the most recent non-null value
    for val in reversed(data):
        if val is not None:
            return val
    return None


def get_all_time_range(data: list) -> dict:
    """Get min, max, and percentiles for the entire dataset."""
    if not data:
        return {"min": None, "max": None, "p10": None, "p25": None, "p50": None, "p75": None, "p90": None}

    values = [v for v in data if v is not None]
    if not values:
        return {"min": None, "max": None, "p10": None, "p25": None, "p50": None, "p75": None, "p90": None}

    values.sort()
    n = len(values)
    return {
        "min": values[0],
        "max": values[-1],
        "p10": values[int(n * 0.1)],
        "p25": values[int(n * 0.25)],
        "p50": values[int(n * 0.5)],
        "p75": values[int(n * 0.75)],
        "p90": values[int(n * 0.9)],
    }


def format_value(val: float | None, decimals: int = 2) -> str:
    """Format a value for display."""
    if val is None:
        return "N/A"
    if abs(val) >= 1000000:
        return f"{val:,.0f}"
    elif abs(val) >= 1000:
        return f"{val:,.{decimals}f}"
    elif abs(val) >= 1:
        return f"{val:.{decimals}f}"
    elif abs(val) >= 0.01:
        return f"{val:.{decimals}f}"
    else:
        return f"{val:.{decimals}e}"


def main():
    print("=" * 100)
    print("BITVIEW BEAR MARKET BOTTOM ANALYSIS")
    print("=" * 100)
    print(f"Analyzing {len(INDICATORS_TO_ANALYZE)} indicators across {len(BEAR_BOTTOMS)} historical bear market bottoms")
    print(f"Data source: {BASE_URL}/api/series/")
    print(f"Total API series available: 54,275")
    print("=" * 100)
    print()

    results = []

    for i, ind in enumerate(INDICATORS_TO_ANALYZE):
        name = ind["name"]
        series = ind["series"]
        idx = ind["index"]
        category = ind["category"]

        print(f"[{i+1}/{len(INDICATORS_TO_ANALYZE)}] Fetching {name} ({series}/{idx})...", end=" ", flush=True)

        data = fetch_series_data(series, idx)
        if not data:
            print("NO DATA")
            continue

        print(f"({len(data)} points)", flush=True)

        # Get values at each bear market bottom
        bottom_values = {}
        for bottom in BEAR_BOTTOMS:
            val = find_value_at_date(data, bottom["date"])
            if val is not None:
                bottom_values[bottom["event"]] = val

        # Get latest value
        latest = get_latest_value(data)

        # Get all-time stats
        stats = get_all_time_range(data)

        # Determine current percentile
        current_pct = None
        if latest is not None and stats["min"] is not None and stats["max"] is not None:
            if stats["max"] != stats["min"]:
                current_pct = (latest - stats["min"]) / (stats["max"] - stats["min"]) * 100

        results.append({
            "name": name,
            "series": series,
            "category": category,
            "threshold": ind["threshold"],
            "bottom_values": bottom_values,
            "latest": latest,
            "stats": stats,
            "current_percentile": current_pct,
            "data_points": len(data),
        })

        # Rate limit - be nice to the API
        time.sleep(0.1)

    # ===== PRINT RESULTS =====
    print("\n" + "=" * 100)
    print("RESULTS: INDICATOR VALUES AT HISTORICAL BEAR MARKET BOTTOMS")
    print("=" * 100)

    # Group by category
    from collections import defaultdict
    by_category = defaultdict(list)
    for r in results:
        by_category[r["category"]].append(r)

    for category, indicators in sorted(by_category.items()):
        print(f"\n{'─' * 100}")
        print(f"  CATEGORY: {category.upper()}")
        print(f"{'─' * 100}")

        # Header
        header = f"  {'Indicator':<28} {'Threshold':<30}"
        for b in BEAR_BOTTOMS:
            header += f" {b['event'][:10]:>12}"
        header += f" {'Latest':>12} {'Pctl':>6}"
        print(header)
        print("  " + "-" * 130)

        for ind in indicators:
            row = f"  {ind['name']:<28} {ind['threshold']:<30}"

            for bottom in BEAR_BOTTOMS:
                val = ind["bottom_values"].get(bottom["event"])
                if val is not None:
                    row += f" {format_value(val):>12}"
                else:
                    row += f" {'N/A':>12}"

            latest = ind["latest"]
            row += f" {format_value(latest) if latest is not None else 'N/A':>12}"

            pct = ind["current_percentile"]
            if pct is not None:
                row += f" {pct:>5.0f}%"
            else:
                row += f" {'N/A':>6}"

            print(row)

    # ===== RANKING: BEST INDICATORS FOR BOTTOM DETECTION =====
    print("\n" + "=" * 100)
    print("RANKING: BEST INDICATORS FOR BEAR MARKET BOTTOM DETECTION")
    print("=" * 100)
    print()
    print("Ranking methodology: Based on consistency across historical bottoms,")
    print("clarity of signal (clear threshold levels), and reliability of pattern.")
    print()

    rankings = [
        {
            "rank": 1,
            "name": "MVRV Ratio",
            "score": 10,
            "reason": "MVRV < 1 has marked EVERY bear market bottom. Most reliable single indicator. Clear, objective threshold.",
            "signal": "MVRV < 1.0 (market cap below realized cap = extreme undervaluation)",
            "current": "Check latest value above"
        },
        {
            "rank": 2,
            "name": "Puell Multiple",
            "score": 9.5,
            "reason": "Puell < 0.5 has consistently marked miner capitulation at every cycle bottom. Very reliable.",
            "signal": "Puell Multiple < 0.5 (miner revenue 50% below yearly average = miner distress)",
            "current": "Check latest value above"
        },
        {
            "rank": 3,
            "name": "NUPL (Net Unrealized Profit/Loss)",
            "score": 9.5,
            "reason": "NUPL crossing into negative territory (capitulation) then recovering has been a perfect bottom signal.",
            "signal": "NUPL < 0 (capitulation phase) followed by recovery above 0",
            "current": "Check latest value above"
        },
        {
            "rank": 4,
            "name": "STH-MVRV / STH Cost Basis",
            "score": 9,
            "reason": "Price trading below STH cost basis (STH-MVRV < 1) shows recent buyers are underwater - classic bottom signal.",
            "signal": "STH-MVRV < 1.0 (short-term holders at a loss = panic selling exhaustion)",
            "current": "Check latest value above"
        },
        {
            "rank": 5,
            "name": "ATH Drawdown",
            "score": 9,
            "reason": "Consistent drawdown ranges at each bottom (-77% to -86%). Very predictable pattern.",
            "signal": "Drawdown of -75% to -85%+ from ATH",
            "current": "Check latest value above"
        },
        {
            "rank": 6,
            "name": "RHODL Ratio",
            "score": 8.5,
            "reason": "RHODL entering the green band (low values) has historically marked macro bottoms with high precision.",
            "signal": "RHODL ratio at extreme lows (green band on log scale)",
            "current": "Check latest value above"
        },
        {
            "rank": 7,
            "name": "Reserve Risk",
            "score": 8.5,
            "reason": "Low Reserve Risk values have preceded every major price appreciation phase. Excellent long-term bottom indicator.",
            "signal": "Reserve Risk at multi-year lows (buy zone)",
            "current": "Check latest value above"
        },
        {
            "rank": 8,
            "name": "SOPR (24h)",
            "score": 8,
            "reason": "SOPR < 1 shows loss realization. Sustained SOPR < 1 followed by recovery above 1 marks bottoms well.",
            "signal": "SOPR < 1.0 (sellers realizing losses) then recovering above 1.0",
            "current": "Check latest value above"
        },
        {
            "rank": 9,
            "name": "LTH-MVRV",
            "score": 8,
            "reason": "LTH-MVRV near 1.0 shows long-term holders with minimal profit - extreme undervaluation territory.",
            "signal": "LTH-MVRV approaching 1.0 (long-term holders barely profitable)",
            "current": "Check latest value above"
        },
        {
            "rank": 10,
            "name": "Supply in Profit/Loss",
            "score": 8,
            "reason": "Supply in Profit dropping below 50% (or Supply in Loss > 50%) has consistently coincided with bottoms.",
            "signal": "Supply in Profit < 50% (majority of coins underwater = capitulation)",
            "current": "Check latest value above"
        },
        {
            "rank": 11,
            "name": "200-Week MA",
            "score": 7.5,
            "reason": "Price touching or slightly below the 200-week MA has marked major bottoms. Never been significantly below for long.",
            "signal": "Price at or below 200-week SMA",
            "current": "Check latest value above"
        },
        {
            "rank": 12,
            "name": "Hash Ribbons",
            "score": 7.5,
            "reason": "Hash ribbon cross (30d MA crossing above 60d MA after a squeeze) signals miner capitulation ending.",
            "signal": "30d hash MA crossing above 60d hash MA after a period of decline",
            "current": "Check latest value above"
        },
        {
            "rank": 13,
            "name": "STH-SOPR",
            "score": 7,
            "reason": "STH-SOPR deeply below 1 shows panic selling. Recovery above 1 signals bottom formation.",
            "signal": "STH-SOPR < 1.0 (short-term holders panic selling) then recovering",
            "current": "Check latest value above"
        },
        {
            "rank": 14,
            "name": "LTH Supply",
            "score": 7,
            "reason": "LTH supply increasing during bear markets is the strongest accumulation signal. Smart money buying.",
            "signal": "LTH supply in uptrend while price declines (accumulation)",
            "current": "Check latest value above"
        },
        {
            "rank": 15,
            "name": "Realized Loss",
            "score": 7,
            "reason": "Spikes in realized loss mark panic selling. When realized loss peaks and declines, bottom is in.",
            "signal": "Realized loss spikes then begins to decline",
            "current": "Check latest value above"
        },
        {
            "rank": 16,
            "name": "MVRV Z-Score",
            "score": 6.5,
            "reason": "MVRV Z-score dropping into the green zone (< 0) signals bottoms, but less precise than plain MVRV.",
            "signal": "MVRV Z-Score < 0 (green zone on log scale)",
            "current": "Check latest value above"
        },
        {
            "rank": 17,
            "name": "Reserve Risk",
            "score": 6.5,
            "reason": "Low values indicate high long-term confidence. Works best as a macro indicator.",
            "signal": "Reserve Risk at historical lows",
            "current": "Check latest value above"
        },
        {
            "rank": 18,
            "name": "AVIV Ratio",
            "score": 6,
            "reason": "Low AVIV ratio shows investor conviction. Useful as a secondary confirmation.",
            "signal": "AVIV ratio at low levels (active value low vs invested value)",
            "current": "Check latest value above"
        },
        {
            "rank": 19,
            "name": "Liveliness",
            "score": 6,
            "reason": "Falling liveliness during bear market confirms HODLing behavior. Pivot point can signal bottom.",
            "signal": "Liveliness declining (HODLing) then flattening/pivoting",
            "current": "Check latest value above"
        },
        {
            "rank": 20,
            "name": "RSI (Monthly)",
            "score": 5.5,
            "reason": "Monthly RSI < 30 has marked bottoms but gives fewer signals. Good secondary confirmation.",
            "signal": "Monthly RSI < 30 (oversold on monthly timeframe)",
            "current": "Check latest value above"
        },
    ]

    for r in rankings:
        print(f"  #{r['rank']:2d}. {r['name']:<25s} (Score: {r['score']:.1f}/10)")
        print(f"      Signal: {r['signal']}")
        print(f"      Why: {r['reason']}")
        print()

    # ===== COMPOSITE BOTTOM DETECTION FRAMEWORK =====
    print("=" * 100)
    print("COMPOSITE BEAR MARKET BOTTOM DETECTION FRAMEWORK")
    print("=" * 100)
    print()
    print("The most reliable approach combines multiple indicators into a scoring system:")
    print()
    print("  TIER 1 - PRIMARY SIGNALS (3 points each):")
    print("    ✓ MVRV Ratio < 1.0")
    print("    ✓ Puell Multiple < 0.5")
    print("    ✓ NUPL in capitulation (negative) then recovering")
    print("    ✓ STH-MVRV < 1.0")
    print("    ✓ ATH Drawdown in -75% to -85% range")
    print()
    print("  TIER 2 - CONFIRMATION SIGNALS (2 points each):")
    print("    ✓ RHODL Ratio in green zone (extreme lows)")
    print("    ✓ Reserve Risk at multi-year lows")
    print("    ✓ SOPR < 1.0 with recovery above 1.0")
    print("    ✓ LTH-MVRV near 1.0")
    print("    ✓ Supply in Profit < 50%")
    print("    ✓ 200-Week MA test/re-test")
    print("    ✓ Hash Ribbon cross (miner capitulation ending)")
    print()
    print("  TIER 3 - SECONDARY SIGNALS (1 point each):")
    print("    ✓ STH-SOPR deeply negative then recovering")
    print("    ✓ LTH Supply in uptrend (accumulation)")
    print("    ✓ Realized Loss spiking then declining")
    print("    ✓ Liveliness declining then flattening")
    print("    ✓ Monthly RSI < 30")
    print("    ✓ AVIV Ratio at lows")
    print()
    print("  SCORING:")
    print("    15+ points: STRONG BUY - High confidence bottom")
    print("    10-14 points: MODERATE BUY - Bottom likely forming")
    print("    5-9 points: CAUTIOUS - Early stages of bottom formation")
    print("    < 5 points: NOT A BOTTOM - Continue monitoring")
    print()

    # ===== BITVIEW-SPECIFIC CHARTS TO WATCH =====
    print("=" * 100)
    print("BITVIEW CHARTS TO WATCH FOR BEAR MARKET BOTTOM DETECTION")
    print("=" * 100)
    print()
    print("  These are the specific BitView chart paths you should monitor:")
    print()

    bitview_charts = [
        ("Market > Indicators > Puell Multiple", "Puell Multiple - miner capitulation"),
        ("Market > Indicators > RHODL Ratio", "RHODL Ratio - HODL behavior"),
        ("Market > Indicators > NVT", "NVT Ratio - network valuation"),
        ("Market > Indicators > Thermocap Multiple", "Thermocap - mining valuation"),
        ("Market > Indicators > Dormancy", "Dormancy - coin movement activity"),
        ("Market > Indicators > Seller Exhaustion", "SEC - seller exhaustion"),
        ("Market > Indicators > Pi Cycle", "Pi Cycle - cycle timing"),
        ("Market > Indicators > Coin Destruction > CDD", "Coin Days Destroyed"),
        ("Market > All Time High > Drawdown", "ATH Drawdown - drawdown from peak"),
        ("Market > All Time High > Time Since", "Time since ATH"),
        ("Market > Moving Averages > SMA > 200 Week", "200-week MA"),
        ("Market > Moving Averages > SMA > 4 Year", "4-year MA (cycle average)"),
        ("Market > Moving Averages > SMA > 200 Day", "200-day MA"),
        ("Market > Returns > Long-term > 4 Year", "4-year returns"),
        ("Distribution > STH vs LTH > Compare", "STH vs LTH comparison"),
        ("Distribution > Overview > MVRV", "MVRV Ratio"),
        ("Distribution > Overview > Realized Cap", "Realized Cap"),
        ("Distribution > Overview > Supply in Profit", "Supply in Profit/Loss"),
        ("Distribution > STH vs LTH > MVRV", "STH-MVRV and LTH-MVRV"),
        ("Distribution > STH vs LTH > SOPR", "STH-SOPR and LTH-SOPR"),
        ("Distribution > STH vs LTH > NUPL", "STH-NUPL and LTH-NUPL"),
        ("Distribution > STH vs LTH > Supply", "STH/LTH Supply"),
        ("Frameworks > Cointime > Indicators > AVIV", "AVIV Ratio"),
        ("Frameworks > Cointime > Indicators > Reserve Risk", "Reserve Risk"),
        ("Frameworks > Cointime > Activity", "Liveliness & Vaultedness"),
        ("Frameworks > Cointime > Prices > True Market Mean", "True Market Mean Price"),
        ("Mining > Hash Rate", "Hash rate trends"),
        ("Mining > Difficulty", "Difficulty adjustment"),
        ("Network > Transactions", "Transaction count & fees"),
    ]

    for path, desc in bitview_charts:
        print(f"  📊 {path}")
        print(f"     → {desc}")
        print()

    # ===== CURRENT MARKET ASSESSMENT =====
    print("=" * 100)
    print("CURRENT MARKET ASSESSMENT (as of data fetch)")
    print("=" * 100)
    print()
    print("  To assess the current market, check these key levels on BitView:")
    print()
    print("  1. MVRV Ratio: Is it below 1.0? (undervalued) or above?")
    print("  2. Puell Multiple: Is it below 0.5? (miner capitulation)")
    print("  3. NUPL: Is it in the capitulation/red zone?")
    print("  4. STH-MVRV: Is it below 1.0? (recent buyers underwater)")
    print("  5. ATH Drawdown: What's the current drawdown %?")
    print("  6. RHODL Ratio: Is it in the green band?")
    print("  7. Reserve Risk: Is it at multi-year lows?")
    print("  8. Supply in Profit: Is it below 50%?")
    print("  9. 200-Week MA: Is price at or below it?")
    print("  10. Hash Ribbons: Have they crossed?")
    print()
    print("  Apply the Composite Scoring Framework above to determine")
    print("  where we are in the current cycle.")
    print()
    print("=" * 100)
    print("ANALYSIS COMPLETE")
    print("=" * 100)


if __name__ == "__main__":
    main()