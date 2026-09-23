import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAgentContext } from "../context/AgentContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const Agents: React.FC = () => {
  const { agents, loading, disconnectAgent, connectAgentWithConsent } = useAgentContext();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [runtime, setRuntime] = useState("Autonomous Agent Runtime");
  const [endpoint, setEndpoint] = useState("https://api.agent.internal/events");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;
    setIsSubmitting(true);
    try {
      await connectAgentWithConsent({
        name: agentName.trim(),
        runtime,
        endpoint,
        model: "agent-v1",
        capabilities: ["task_execution", "settlement"],
      });
      setAgentName("");
      setConnectModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#FFF8F0]">
            Agents
          </h1>
          <p className="text-xs sm:text-sm text-[#B9A99B] mt-1">
            Connected AI agents sending work to VeraOS for verification.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setConnectModalOpen(true)}
          icon={<span className="material-symbols-outlined text-[16px]">add</span>}
        >
          Connect Agent
        </Button>
      </div>

      {/* Agents Roster */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center gap-3 text-[#B9A99B]">
          <span className="w-8 h-8 border-2 border-[#C96A2B] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs">Loading connected agents...</span>
        </div>
      ) : agents.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-20 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FFF8F0]">
              No agents connected
            </h3>
            <p className="text-xs sm:text-sm text-[#B9A99B] max-w-sm mt-1.5 leading-relaxed">
              Connect an agent when you&apos;re ready to send work to VeraOS.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setConnectModalOpen(true)}
            icon={<span className="material-symbols-outlined text-[16px]">add</span>}
          >
            Connect Agent
          </Button>
        </div>
      ) : (
        /* Genuine Connected Agents Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Name & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#FFF8F0]">
                        {agent.name}
                      </h3>
                      <span className="font-mono text-[11px] text-[#B9A99B]">
                        {agent.runtime}
                      </span>
                    </div>
                  </div>

                  {agent.status === "CONNECTED" ? (
                    <Badge variant="passed" dot>
                      CONNECTED
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      DISCONNECTED
                    </Badge>
                  )}
                </div>

                {/* Metadata List */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#160C08] border border-[#4A2B1D]/60 text-xs font-mono mb-4">
                  <div className="flex flex-col">
                    <span className="text-[#B9A99B] text-[10px] uppercase">Last verification</span>
                    <span className="text-[#FFF8F0] mt-0.5 truncate">{agent.lastActive || "Recently active"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#B9A99B] text-[10px] uppercase">Verifications</span>
                    <span className="text-[#FFF8F0] mt-0.5">{agent.totalVerifications ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#4A2B1D] flex items-center justify-between">
                <Link to="/verify/new">
                  <Button variant="primary" size="sm">
                    Verify work
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => disconnectAgent(agent.id)}
                  className="text-xs text-[#B9A99B] hover:text-[#f87171] transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Agent Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setConnectModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#21110B] border border-[#4A2B1D] p-6 sm:p-8 flex flex-col gap-5 z-10 text-left shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-[#FFF8F0]">
                Connect Agent
              </h2>
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="text-[#B9A99B] hover:text-[#FFF8F0] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#B9A99B]">
              Add a new AI agent to establish verification handshakes and receive completed work.
            </p>

            <form onSubmit={handleConnectSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#FFF8F0]">
                  Agent Name
                </label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Settlement Agent #01"
                  className="px-3.5 py-2 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#FFF8F0]">
                  Runtime / Framework
                </label>
                <input
                  type="text"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  placeholder="e.g. LangChain, CrewAI, Custom Bot"
                  className="px-3.5 py-2 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#FFF8F0]">
                  Endpoint (Webhook / API)
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/agent"
                  className="px-3.5 py-2 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
              </div>

              <div className="pt-3 border-t border-[#4A2B1D] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="text-xs text-[#B9A99B] hover:text-[#FFF8F0] cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                >
                  Connect Agent
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
