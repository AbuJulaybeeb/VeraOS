import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAgentContext } from "../context/AgentContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const Agents: React.FC = () => {
  const {
    agents,
    loading,
    activeAgent,
    openConnectModal,
    disconnectAgent,
    testHandshake,
  } = useAgentContext();

  const [pingStatuses, setPingStatuses] = useState<Record<string, string>>({});
  const [pingingId, setPingingId] = useState<string | null>(null);

  const handlePing = async (agentId: string) => {
    setPingingId(agentId);
    setPingStatuses((prev) => ({ ...prev, [agentId]: "Testing..." }));
    try {
      const res = await testHandshake(agentId);
      setPingStatuses((prev) => ({
        ...prev,
        [agentId]: `${res.latencyMs}ms`,
      }));
      setTimeout(() => {
        setPingStatuses((prev) => {
          const next = { ...prev };
          delete next[agentId];
          return next;
        });
      }, 4000);
    } catch {
      setPingStatuses((prev) => ({ ...prev, [agentId]: "Failed" }));
    } finally {
      setPingingId(null);
    }
  };

  const connectedAgents = agents.filter((a) => a.status === "CONNECTED" || a.status === "IDLE");
  const notConnectedAgents = agents.filter((a) => a.status === "NOT_CONNECTED");

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Agents
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Connect and manage the AI agents whose work VeraOS will verify.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => openConnectModal()}
          icon={<span className="material-symbols-outlined text-[18px]">add_circle</span>}
        >
          Connect Agent
        </Button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-body-sm text-body-sm">Loading agents...</span>
        </div>
      ) : agents.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center text-center gap-4 rounded-xl bg-surface-container-low border border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[28px]">smart_toy</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">No agents connected</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
              Connect an agent to start submitting its work for independent verification.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => openConnectModal()}>
            Connect your first agent
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {/* Connected agents */}
          {connectedAgents.length > 0 && (
            <div className="flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Connected
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {connectedAgents.map((agent) => {
                  const isCurrentlyActive = activeAgent?.id === agent.id && agent.status === "CONNECTED";
                  const currentPing = pingStatuses[agent.id];

                  return (
                    <div
                      key={agent.id}
                      className={`p-space-md rounded-2xl bg-surface-container-low border transition-all flex flex-col justify-between gap-space-md ${
                        isCurrentlyActive
                          ? "border-[#E08A3E]/50 shadow-[0_0_24px_rgba(201,106,43,0.12)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Top */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                {agent.name}
                              </h3>
                              <span className="font-code-sm text-code-sm text-outline">{agent.version}</span>
                              {isCurrentlyActive && (
                                <span className="px-1.5 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E] font-code-sm text-[9px] font-bold uppercase border border-[#E08A3E]/30">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant truncate block">
                              {agent.runtime}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {agent.status === "CONNECTED" && <Badge variant="passed" dot>CONNECTED</Badge>}
                          {agent.status === "IDLE" && <Badge variant="running" dot>IDLE</Badge>}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest/80 p-3 rounded-xl border border-white/5 font-code-sm text-code-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-outline text-[10px] uppercase">Model</span>
                          <span className="text-on-surface font-semibold truncate">{agent.model}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-outline text-[10px] uppercase">Network</span>
                          <span className="text-secondary font-semibold">Stellar Testnet</span>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {agent.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded bg-surface-container text-outline font-code-sm text-[10px] border border-white/5"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-outline font-code-sm text-code-sm min-w-0">
                          <span className="material-symbols-outlined text-[14px] shrink-0">key</span>
                          <span className="font-mono text-[11px] truncate">{agent.apiKeySnippet}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePing(agent.id)}
                            disabled={pingingId === agent.id}
                            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px] text-[#E08A3E]">bolt</span>
                            <span>{currentPing ?? "Test ping"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => disconnectAgent(agent.id)}
                            className="px-2 py-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 text-xs transition-colors cursor-pointer"
                            title="Disconnect Agent"
                          >
                            <span className="material-symbols-outlined text-[16px]">link_off</span>
                          </button>

                          <Link
                            to="/verify/new"
                            className="px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <span>Verify</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not connected agents */}
          {notConnectedAgents.length > 0 && (
            <div className="flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Not connected
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {notConnectedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-space-md rounded-2xl bg-surface-container-low border border-white/5 border-dashed flex flex-col gap-space-sm opacity-70"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
                          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{agent.name}</h3>
                          <span className="font-body-sm text-body-sm text-outline">{agent.runtime}</span>
                        </div>
                      </div>
                      <Badge variant="neutral">NOT CONNECTED</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => openConnectModal(agent)}
                      className="w-full py-2 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary hover:text-white text-sm font-semibold transition-all"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
