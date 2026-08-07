import { useCallback, useEffect, useState } from "react";
import { getLiquidationData, type LiquidationData } from "@/lib/liquidation";

export function useLiquidationData() {
  const [data, setData] = useState<LiquidationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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
