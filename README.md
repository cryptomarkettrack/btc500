# BTC500

Bitcoin 500-day cycle countdown and backtesting site, deployed at [https://btc500.net](https://btc500.net).

The product rule is fixed: buy 500 calendar days before a Bitcoin halving, sell 500 calendar days after. Historical halvings use recorded dates. The next halving date is estimated from live block height and the recently observed average block interval.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start + React 19 |
| Routing / data | TanStack Router, TanStack Query |
| Styling | Tailwind CSS v4, shadcn/ui |
| Language | TypeScript |
| Validation | Zod |
| Build | Vite 8 |
| Hosting | Vercel (`btc500.net`) |

Package manager: npm or bun. Lockfiles for both are in the repo.

## Features

- Homepage countdown (local tick; network state refreshes every 10 minutes)
- Historical simulator and DCA comparison (bundled daily archive)
- Timeline / time machine for realized vs live cycles
- Halving dates schedule from the canonical cycle model
- Articles, news, bear-market meter, liquidation, and insider-trading views

## Architecture

Domain math lives in `src/lib/halvings.ts`. That file is the single source of truth for:

- historical halvings (block, date, timestamp)
- next halving block (`210_000` epoch schedule)
- T-500 / T+500
- cycle kind (`historical` / `current` / `future`)
- estimated next-halving timestamp/date

Live Bitcoin network I/O is in `src/lib/btc.functions.ts`:

1. Tip height from mempool.space → blockchain.info → blockstream.info
2. Observed block interval from recent block timestamps
3. Fallback to the protocol 600s target, labelled as a fallback

Historical prices are CSV-first (`public/btc-usd-max.csv`). Bitstamp / blockchain.info are used only for dates the archive does not cover. Partial loads return completeness metadata; they are not presented as complete.

The in-memory cache in `src/lib/price-cache.ts` is instance-local (one Vercel isolate). It is not shared across instances. There is no Redis / Edge Config in this repo.

## Development

```bash
git clone https://github.com/cryptomarkettrack/btc500.git
cd btc500
npm install   # or: bun install
npm run dev   # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Domain tests + CSV integrity check |
| `npm run format` | Prettier |

## Environment variables

The web app does not require environment variables for countdown, prices, or historical pages.

Optional, scripts only:

- `scripts/search-console/` uses a local `credentials.json` service-account key (gitignored). See that folder's README.

## Data sources

| Data | Source |
| --- | --- |
| Tip height | mempool.space, blockchain.info, blockstream.info |
| Block interval | Recent block timestamps from mempool.space / blockstream.info |
| Live BTCUSD | Binance → CoinGecko → Coinbase → Kraken |
| Historical daily close | Bundled `btc-usd-max.csv` (CoinGecko max series; earlier prints from blockchain.info) |
| Post-archive tail | Bitstamp OHLC |

If live block data is unavailable, the UI uses a deterministic height estimate from the last confirmed halving and the protocol 10-minute target. That path is labelled as a fallback, not as a precise live reading.

## License

MIT. See `LICENSE` if present in the repository.
