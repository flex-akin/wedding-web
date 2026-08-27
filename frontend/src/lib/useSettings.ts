import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Settings } from "../types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Settings>("/settings")
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading, error };
}
