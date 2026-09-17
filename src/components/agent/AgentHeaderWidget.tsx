import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentContext } from "../../context/AgentContext";

export const AgentHeaderWidget: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeAgent,
    openConnectModal,
    disconnectAgent,
    testHandshake,
  } = useAgentContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = async (agentId: string) => {
    setIsPinging(true);
    setPingStatus("Testing...");
    try {
      const res = await testHandshake(agentId);
      setPingStatus(`${res.latencyMs}ms ✓`);
      setTimeout(() => setPingStatus(null), 3000);
    } catch {
      setPingStatus("Failed");
      setTimeout(() => setPingStatus(null), 3000);
    } finally {
      setIsPinging(false);
    }
  };

  const handleDisconnect = async (agentId: string) => {
    setDropdownOpen(false);
    await disconnectAgent(agentId);
  };

  // If no active agent is connected, show the prominent "Connect Agent" button (wallet style)
  if (!activeAgent || activeAgent.status !== "CONNECTED") {
    return (
      <button
        type="button"
        onClick={() => openConnectModal()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C96A2B] hover:bg-[#E08A3E] text-white text-xs font-semibold shadow-[0_0_14px_rgba(201,106,43,0.35)] transition-all cursor-pointer group"
        title="Connect your AI Agent just like connecting a Web3 wallet"
      >
        <span className="material-symbols-outlined text-[16px] group-hover:rotate-12 transition-transform">
          smart_toy
        </span>
        <span className="hidden sm:inline">Connect Agent</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

  // Active connected agent pill with dropdown
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs transition-all cursor-pointer shadow-sm group"
        title={`Connected Agent: ${activeAgent.name}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
        <span className="font-semibold text-[#FFF8F0] max-w-[110px] truncate">
          {activeAgent.name}
        </span>
        <span className="material-symbols-outlined text-[15px] text-[#B9A99B] group-hover:text-white transition-colors">
          arrow_drop_down
        </span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 top-11 w-64 rounded-2xl bg-[#1D110B] border border-[#4A2B1D] shadow-2xl z-50 p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Agent Info Header */}
            <div className="p-2.5 rounded-xl bg-[#160C08] border border-white/5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#FFF8F0] truncate">
                  {activeAgent.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/20 text-[#4ade80] font-semibold border border-[#22c55e]/30">
                  CONNECTED
                </span>
              </div>
              <span className="text-[11px] text-[#B9A99B] truncate font-code-sm">
                {activeAgent.runtime}
              </span>
              <div className="flex items-center justify-between text-[10px] text-[#A6998C] pt-1 border-t border-white/5 mt-1">
                <span>Pass Rate: {activeAgent.passRate}%</span>
                <span>Stellar Testnet</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 text-xs">
              {/* Test Handshake Ping */}
              <button
                type="button"
                onClick={() => handlePing(activeAgent.id)}
                disabled={isPinging}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[#F3E5D5] hover:bg-[#2C1710] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#E08A3E]">
                    bolt
                  </span>
                  <span>Test Handshake Ping</span>
                </div>
                {pingStatus && (
                  <span className="text-[10px] font-code-sm text-[#4ade80]">
                    {pingStatus}
                  </span>
                )}
              </button>

              {/* Switch / Connect Another Agent */}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  openConnectModal();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[#F3E5D5] hover:bg-[#2C1710] hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#B9A99B]">
                  swap_horiz
                </span>
                <span>Connect Another Agent</span>
              </button>

              {/* View Registry */}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/agents");
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[#F3E5D5] hover:bg-[#2C1710] hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#B9A99B]">
                  list_alt
                </span>
                <span>Agent Registry</span>
              </button>

              {/* Disconnect */}
              <button
                type="button"
                onClick={() => handleDisconnect(activeAgent.id)}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition-colors cursor-pointer pt-1 border-t border-white/5 mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  link_off
                </span>
                <span>Disconnect Agent</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
