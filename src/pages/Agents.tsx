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
        [agentId]: `${res.latencyMs}ms ✓ Stellar RPC`,
      }));
      setTimeout(() => {
        setPingStatuses((prev) => {
          const next = { ...prev };
          delete next[agentId];
          return next;
        });
      }, 4000);
    } catch {
      setPingStatuses((prev) => ({ ...prev, [agentId]: "Ping Failed" }));
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Autonomous Agent Registry
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code-sm text-code-sm text-secondary border border-white/5">
              {agents.length} Registered
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Connect and manage autonomous AI agents with wallet-style consent and Stellar cryptographic verification.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => openConnectModal()}
          icon={
            <span className="material-symbols-outlined text-[18px]">
              smart_toy
            </span>
          }
          className="shadow-[0_0_16px_rgba(201,106,43,0.35)]"
        >
          Connect Agent
        </Button>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-code-sm text-code-sm">Loading registered agents...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {agents.map((agent) => {
            const isConnected = agent.status === "CONNECTED";
            const isCurrentlyActive = activeAgent?.id === agent.id && isConnected;
            const currentPing = pingStatuses[agent.id];

            return (
              <div
                key={agent.id}
                className={`p-space-md rounded-2xl bg-surface-container-low border transition-all flex flex-col justify-between group ${
                  isCurrentlyActive
                    ? "border-[#E08A3E]/60 shadow-[0_0_24px_rgba(201,106,43,0.15)]"
                    : "border-white/10 hover:border-white/20 shadow-lg"
                }`}
              >
                <div>
                  {/* Top Row: Avatar, Name, Status Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-md">
                        <span className="material-symbols-outlined text-[22px]">
                          smart_toy
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            {agent.name}
                          </h3>
                          <span className="font-code-sm text-code-sm text-outline">
                            {agent.version}
                          </span>
                          {isCurrentlyActive && (
                            <span className="px-1.5 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E] font-code-sm text-[9px] font-bold uppercase border border-[#E08A3E]/30">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <span className="font-code-sm text-[11px] text-on-surface-variant">
                          {agent.runtime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {agent.status === "CONNECTED" && (
                        <Badge variant="passed" dot>
                          CONNECTED
                        </Badge>
                      )}
                      {agent.status === "IDLE" && (
                        <Badge variant="running" dot>
                          IDLE
                        </Badge>
                      )}
                      {agent.status === "NOT_CONNECTED" && (
                        <Badge variant="neutral">NOT CONNECTED</Badge>
                      )}
                    </div>
                  </div>

                  {/* Agent Details Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-lowest/80 p-3 rounded-xl border border-white/5 font-code-sm text-code-sm mb-4">
                    <div className="flex flex-col">
                      <span className="text-outline text-[10px] uppercase">
                        Model
                      </span>
                      <span className="text-on-surface font-semibold truncate">
                        {agent.model}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-outline text-[10px] uppercase">
                        Verifications
                      </span>
                      <span className="text-on-surface font-semibold">
                        {agent.totalVerifications}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-outline text-[10px] uppercase">
                        Pass Rate
                      </span>
                      <span className="text-[#4ade80] font-semibold">
                        {agent.passRate}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-outline text-[10px] uppercase">
                        Active
                      </span>
                      <span className="text-secondary font-semibold">
                        {agent.lastActive}
                      </span>
                    </div>
                  </div>

                  {/* Capabilities & Scopes */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    <span className="font-label-caps text-label-caps text-outline uppercase mr-1">
                      Scopes:
                    </span>
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded bg-surface-container text-outline font-code-sm text-[10px] border border-white/5"
                      >
                        {cap}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded bg-[#2C1710] text-[#E08A3E] font-code-sm text-[10px] border border-[#E08A3E]/30">
                      Stellar Testnet
                    </span>
                  </div>
                </div>

                {/* Card Footer: Credentials & Actions */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-code-sm">
                  <div className="flex items-center gap-1.5 text-outline">
                    <span className="material-symbols-outlined text-[14px]">
                      key
                    </span>
                    <span className="font-mono text-[11px] truncate max-w-[160px]">
                      {agent.apiKeySnippet}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If NOT_CONNECTED, show 1-click Connect Agent button */}
                    {agent.status === "NOT_CONNECTED" && (
                      <button
                        type="button"
                        onClick={() => openConnectModal(agent)}
                        className="px-3 py-1.5 rounded-lg bg-[#C96A2B] hover:bg-[#E08A3E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          hub
                        </span>
                        <span>Connect Agent</span>
                      </button>
                    )}

                    {/* If CONNECTED, show Test Ping and Disconnect options */}
                    {isConnected && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePing(agent.id)}
                          disabled={pingingId === agent.id}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface flex items-center gap-1 transition-colors cursor-pointer"
                          title="Send a verification handshake ping"
                        >
                          <span className="material-symbols-outlined text-[14px] text-[#E08A3E]">
                            bolt
                          </span>
                          <span>{currentPing || "Test Ping"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => disconnectAgent(agent.id)}
                          className="px-2 py-1.5 rounded-lg text-outline hover:text-red-400 hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
                          title="Disconnect Agent"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            link_off
                          </span>
                        </button>

                        <Link
                          to="/verify/new"
                          className="px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <span>Verify</span>
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </Link>
                      </>
                    )}

                    {agent.status === "IDLE" && (
                      <Link
                        to="/verify/new"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-medium transition-colors"
                      >
                        <span>Verify Task</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
