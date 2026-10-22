import type { QueryClient } from "@tanstack/react-query";
import { estimateHalvingInfo, getHalvingSnapshot, type HalvingInfo } from "@/lib/btc.functions";
import { halvingQuery } from "@/lib/queries";

/**
 * Budget for the live height call. The full network snapshot (height + observed
 * interval) can take several seconds if an upstream provider is slow; the
 * countdown must never hold the whole HTML for that long. A cached height call
 * is normally well under 300 ms.
 */
const SEED_TIMEOUT_MS = 2_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("halving-seed-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/**
 * Put the shared halving snapshot in the query cache before the page renders.
 *
 * The server HTML and the hydrated client then start from the exact same
 * values, so the countdown no longer renders a protocol estimate and then jumps
 * to the live date a second later. Only the tip height is fetched (the date is
 * projected from it at the protocol 10-minute target), which keeps SSR fast.
 *
 * If the live call is unavailable or too slow, the deterministic estimate is
 * still rendered. It is seeded as fresh (like the live value) so the client
 * hydrates the exact text the server sent instead of refetching mid-hydration;
 * a root-level effect retries the live snapshot right after hydration.
 */
export async function seedHalving(queryClient: QueryClient): Promise<void> {
  if (queryClient.getQueryData(halvingQuery.queryKey)) return;

  let info: HalvingInfo;
  try {
    info = await withTimeout(getHalvingSnapshot(), SEED_TIMEOUT_MS);
  } catch (err) {
    console.warn("[halving] live seed unavailable, using protocol estimate:", err);
    info = estimateHalvingInfo();
  }

  queryClient.setQueryData(halvingQuery.queryKey, info);
}
