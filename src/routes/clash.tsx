import { createFileRoute } from "@tanstack/react-router";

import { ClashPage } from "@/components/clash/ClashPage";
import { RouteDataError } from "@/components/route/RouteDataError";
import { RoutePending } from "@/components/route/RoutePending";
import { getClashStateFn } from "@/lib/clash/functions";
import { generatePageHead } from "@/lib/site";

const PATH = "/clash";
const TITLE = "Candle Clash — Free Bitcoin Candle Forecasting Game";
const DESCRIPTION =
  "Predict whether the next BTC/USDT candle closes up or down. Free to play, settled from verified Binance candle data, with points, streaks and a leaderboard.";

export const Route = createFileRoute("/clash")({
  head: () =>
    generatePageHead({
      path: PATH,
      title: TITLE,
      description: DESCRIPTION,
      keywords:
        "bitcoin prediction game, btc candle forecast, crypto accuracy leaderboard, free bitcoin game",
      ogTitle: TITLE,
      ogDescription: DESCRIPTION,
      ogImageAlt: "Candle Clash — BTC/USDT candle forecasting game",
      twitterDescription: DESCRIPTION,
      // The leaderboard is user-generated and the game is a retention surface
      // for the research brand, not an SEO destination. Kept out of the index
      // for the MVP; flip this if the product later earns its own search demand.
      noIndex: true,
    }),
  loader: () => getClashStateFn(),
  component: ClashPage,
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteDataError error={error} />,
});
