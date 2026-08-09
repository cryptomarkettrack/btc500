import { useCallback, useEffect, useState } from "react";
import { getLiquidationData, type LiquidationData } from "@/lib/liquidation";

/** @param initialData - Server-rendered data from the route loader (SSR/SEO). */
export function useLiquidationData(initialData?: LiquidationData | null) {
  const [data, setData] = useState<LiquidationData | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(() => !initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Server data already rendered — skip the initial client fetch.
    if (initialData) return;
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getLiquidationData();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load liquidation data");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLiquidationData();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh liquidation data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch };
}
