import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Agent, GuardrailMode } from "../types/agent";
import { agentsApi } from "../services/agentsApi";

interface AgentContextType {
  agents: Agent[];
  activeAgent: Agent | null;
  loading: boolean;
  error: string | null;
  isConnectModalOpen: boolean;
  preselectedAgent: Partial<Agent> | null;
  openConnectModal: (preset?: Partial<Agent>) => void;
  closeConnectModal: () => void;
  connectAgentWithConsent: (data: {
    id?: string;
    name: string;
    endpoint?: string;
    runtime?: string;
    model?: string;
    capabilities?: string[];
    permissions?: string[];
    guardrailMode?: GuardrailMode;
    stellarAccount?: string;
  }) => Promise<Agent>;
  disconnectAgent: (agentId: string) => Promise<void>;
  testHandshake: (agentId: string) => Promise<{
    success: boolean;
    latencyMs: number;
    network: string;
    txHash: string;
    message: string;
  }>;
  selectActiveAgent: (agentId: string) => void;
  refetchAgents: () => Promise<void>;
}

const STORAGE_ACTIVE_AGENT_KEY = "vera_active_agent_id_v1";

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_ACTIVE_AGENT_KEY);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [preselectedAgent, setPreselectedAgent] = useState<Partial<Agent> | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentsApi.list();
      setAgents(data);

      // If no active agent is set, or current active agent is not connected, set first connected agent
      if (!activeAgentId) {
        const firstConnected = data.find((a) => a.status === "CONNECTED");
        if (firstConnected) {
          setActiveAgentId(firstConnected.id);
          localStorage.setItem(STORAGE_ACTIVE_AGENT_KEY, firstConnected.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [activeAgentId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const activeAgent = agents.find((a) => a.id === activeAgentId) || null;

  const openConnectModal = useCallback((preset?: Partial<Agent>) => {
    setPreselectedAgent(preset || null);
    setIsConnectModalOpen(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setIsConnectModalOpen(false);
    setPreselectedAgent(null);
  }, []);

  const connectAgentWithConsent = useCallback(
    async (data: {
      id?: string;
      name: string;
      endpoint?: string;
      runtime?: string;
      model?: string;
      capabilities?: string[];
      permissions?: string[];
      guardrailMode?: GuardrailMode;
      stellarAccount?: string;
    }) => {
      setError(null);
      const connected = await agentsApi.connectWithConsent(data);
      await fetchAgents();
      setActiveAgentId(connected.id);
      localStorage.setItem(STORAGE_ACTIVE_AGENT_KEY, connected.id);
      return connected;
    },
    [fetchAgents]
  );

  const disconnectAgent = useCallback(
    async (agentId: string) => {
      await agentsApi.disconnect(agentId);
      await fetchAgents();
      if (activeAgentId === agentId) {
        const remaining = agents.find((a) => a.id !== agentId && a.status === "CONNECTED");
        if (remaining) {
          setActiveAgentId(remaining.id);
          localStorage.setItem(STORAGE_ACTIVE_AGENT_KEY, remaining.id);
        } else {
          setActiveAgentId(null);
          localStorage.removeItem(STORAGE_ACTIVE_AGENT_KEY);
        }
      }
    },
    [activeAgentId, agents, fetchAgents]
  );

  const testHandshake = useCallback(async (agentId: string) => {
    return agentsApi.testPing(agentId);
  }, []);

  const selectActiveAgent = useCallback((agentId: string) => {
    setActiveAgentId(agentId);
    localStorage.setItem(STORAGE_ACTIVE_AGENT_KEY, agentId);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        agents,
        activeAgent,
        loading,
        error,
        isConnectModalOpen,
        preselectedAgent,
        openConnectModal,
        closeConnectModal,
        connectAgentWithConsent,
        disconnectAgent,
        testHandshake,
        selectActiveAgent,
        refetchAgents: fetchAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgentContext must be used within an AgentProvider");
  }
  return context;
};
