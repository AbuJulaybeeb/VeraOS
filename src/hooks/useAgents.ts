import { useAgentContext } from "../context/AgentContext";

export function useAgents() {
  const ctx = useAgentContext();
  return {
    agents: ctx.agents,
    activeAgent: ctx.activeAgent,
    loading: ctx.loading,
    error: ctx.error,
    refetch: ctx.refetchAgents,
    connectAgent: ctx.connectAgentWithConsent,
    disconnectAgent: ctx.disconnectAgent,
    testHandshake: ctx.testHandshake,
    openConnectModal: ctx.openConnectModal,
    closeConnectModal: ctx.closeConnectModal,
    isConnectModalOpen: ctx.isConnectModalOpen,
  };
}
