import { useState, useEffect, useCallback } from "react";
import { Agent } from "../types/agent";
import { agentsApi } from "../services/agentsApi";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentsApi.list();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const connectAgent = async (params: {
    name: string;
    endpoint: string;
    runtime: string;
    model: string;
    capabilities: string[];
  }) => {
    try {
      const created = await agentsApi.connect(params);
      await fetchAgents();
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect agent");
      return null;
    }
  };

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    connectAgent,
  };
}
