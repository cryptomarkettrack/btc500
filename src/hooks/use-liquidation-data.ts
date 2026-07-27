import { useCallback, useEffect, useState } from "react";
import { getLiquidationData, type LiquidationData } from "@/lib/liquidation";

export function useLiquidationData() {
  const [data, setData] = useState<LiquidationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getLiquidationData();
        if (!cancelled) setData(result);
      } catch {
        // keep null data
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
    try {
      const result = await getLiquidationData();
      setData(result);
    } catch {
      // keep stale data
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, refetch };
}
