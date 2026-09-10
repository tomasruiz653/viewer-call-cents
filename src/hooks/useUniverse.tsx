import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { checkForUpdate, loadUniverse } from "@/lib/universe-loader";
import type { LoadStatus, Universe } from "@/types/universe";

interface UniverseState {
  status: LoadStatus;
  universe: Universe | null;
  error: string | null;
  updateAvailable: boolean;
  refresh: () => void;
}

const UniverseContext = createContext<UniverseState | null>(null);

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [universe, setUniverse] = useState<Universe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const load = useCallback(async (force: boolean) => {
    setStatus((prev) => (prev === "ready" ? "ready" : "loading"));
    setError(null);
    setUpdateAvailable(false);
    try {
      const result = await loadUniverse({ force });
      setUniverse(result.universe);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to load the universe.");
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  // Best-effort background revalidation using safelisted headers only (see universe-loader).
  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    checkForUpdate()
      .then((changed) => {
        if (!cancelled && changed) setUpdateAvailable(true);
      })
      .catch(() => {
        /* freshness check is best-effort */
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  return (
    <UniverseContext.Provider value={{ status, universe, error, updateAvailable, refresh }}>
      {children}
    </UniverseContext.Provider>
  );
}

export function useUniverse(): UniverseState {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error("useUniverse must be used within a UniverseProvider");
  return ctx;
}
