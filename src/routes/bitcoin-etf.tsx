import { createFileRoute } from "@tanstack/react-router";
import { getBitcoinEtfAbsorption, type EtfAbsorptionSnapshot } from "@/lib/etf";
import { EtfAbsorptionDashboard } from "@/components/etf/EtfAbsorptionDashboard";
import { useEtfAbsorption } from "@/hooks/use-etf-absorption";
import { ETF_FAQ } from "@/lib/etf-faq";
import {
  generateFaqSchema,
  generatePageHead,
  generateSpeakableSchema,
  generateWebPageSchema,
  SITE_URL,
} from "@/lib/site";

const PATH = "/bitcoin-etf";
const TITLE = "Bitcoin ETF Inflows & Outflows — Absorption vs Miner Issuance";
const DESCRIPTION =
  "Track US spot Bitcoin ETF inflows and outflows in BTC, compared with daily miner issuance and the 500-day cycle. See whether ETFs absorbed more coins than miners created.";

const pageSchema = generateWebPageSchema({
  path: PATH,
  name: TITLE,
  description: DESCRIPTION,
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Bitcoin ETF Absorption", path: PATH },
  ],
  datePublished: "2026-08-21",
  dateModified: "2026-08-21",
});

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "US spot Bitcoin ETF daily flows, converted to BTC vs miner issuance",
  description: DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  variableMeasured: [
    "Daily net Bitcoin ETF flow in USD",
    "Daily net Bitcoin ETF flow in BTC",
    "Daily miner issuance in BTC",
  ],
  creator: {
    "@type": "Organization",
    name: "BTC500",
    url: `${SITE_URL}/`,
  },
};

export const Route = createFileRoute("/bitcoin-etf")({
  component: BitcoinEtfRoute,
  loader: async (): Promise<EtfAbsorptionSnapshot | null> => {
    try {
      return await getBitcoinEtfAbsorption();
    } catch (e) {
      console.error("[bitcoin-etf] Loader error:", e);
      return null;
    }
  },
  head: () =>
    generatePageHead({
      path: PATH,
      title: `${TITLE} | BTC500`,
      description: DESCRIPTION,
      keywords:
        "bitcoin etf inflows, bitcoin etf outflows, bitcoin etf flows, spot bitcoin etf, IBIT inflows, bitcoin etf absorption, miner issuance vs etf, US bitcoin ETF, GBTC flows, Fidelity FBTC",
      ogTitle: "Did Bitcoin ETFs eat today's new coins? | BTC500",
      ogDescription: DESCRIPTION,
      ogImageAlt: "Bitcoin ETF absorption board — inflows versus miner issuance",
      twitterTitle: "Bitcoin ETF inflows vs miner issuance",
      twitterDescription:
        "US spot Bitcoin ETF flows converted to BTC and stacked against new miner supply.",
      schema: [
        pageSchema,
        generateFaqSchema(ETF_FAQ),
        generateSpeakableSchema({
          path: PATH,
          cssSelectors: [".lead"],
        }),
        datasetSchema,
      ],
      publishedTime: "2026-08-21",
      modifiedTime: "2026-08-21",
    }),
});

function BitcoinEtfRoute() {
  const initialData = Route.useLoaderData();
  const { data, isLoading, error, refetch } = useEtfAbsorption(initialData);
  return (
    <EtfAbsorptionDashboard
      data={data}
      error={error}
      isLoading={isLoading}
      onRefresh={() => void refetch()}
    />
  );
}
