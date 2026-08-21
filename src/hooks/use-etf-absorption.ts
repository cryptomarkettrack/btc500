import { useCallback, useEffect, useState } from "react";
import { getBitcoinEtfAbsorption, type EtfAbsorptionSnapshot } from "@/lib/etf";

export function useEtfAbsorption(initialData?: EtfAbsorptionSnapshot | null) {
  const [data, setData] = useState<EtfAbsorptionSnapshot | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(() => !initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getBitcoinEtfAbsorption();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Bitcoin ETF flows");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBitcoinEtfAbsorption();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh Bitcoin ETF flows");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch };
}
