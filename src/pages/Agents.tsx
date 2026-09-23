import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAgentContext } from "../context/AgentContext";

interface AgentItem {
  id: string;
  name: string;
  channel: "Telegram" | "API" | "Webhook";
  role: string;
  status: "Healthy" | "Review settings" | "Paused";
  verifiedCount: number;
  passRate: string;
  endpoint: string;
  lastActive: string;
}

const DEFAULT_AGENTS: AgentItem[] = [
  {
    id: "refund-bot",
    name: "Refund Bot",
    channel: "Telegram",
    role: "Telegram Bot • Inbound Customer Service",
    status: "Healthy",
    verifiedCount: 342,
    passRate: "98.2%",
    endpoint: "t.me/vera_refund_bot",
    lastActive: "4 mins ago",
  },
  {
    id: "vr-2048",
    name: "ResearchAgent VR-2048",
    channel: "API",
    role: "API • Liquidity & Protocol Settlement",
    status: "Healthy",
    verifiedCount: 512,
    passRate: "99.4%",
    endpoint: "https://api.acme.ai/workers/vr2048",
    lastActive: "12 mins ago",
  },
  {
    id: "settlement-bot",
    name: "Settlement Bot",
    channel: "Webhook",
    role: "Webhook • Stellar USDC Disbursement",
    status: "Review settings",
    verifiedCount: 284,
    passRate: "87.5%",
    endpoint: "https://disburse.worker.io/events",
    lastActive: "1 hour ago",
  },
  {
    id: "datasync-worker",
    name: "DataSync Worker",
    channel: "Webhook",
    role: "Webhook • CRM Sync & Reconciliation",
    status: "Paused",
    verifiedCount: 146,
    passRate: "91.0%",
    endpoint: "https://sync.internal.net/agent",
    lastActive: "2 days ago",
  },
];

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const { agents } = useAgentContext();
  const [filterChannel, setFilterChannel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = DEFAULT_AGENTS.filter((ag) => {
    const matchesFilter = filterChannel === "All" || ag.channel === filterChannel;
    const matchesSearch =
      ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* 1. Header (Image 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
            My agents
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
            Manage connected AI workers, review verification rates, and monitor channel health.
          </p>
        </div>

        <Link
          to="/connect-agent"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Connect agent</span>
        </Link>
      </div>

      {/* 2. Four Horizontal Metric Cards (Image 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: 4 Connected agents */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#6B635B] uppercase tracking-wider">
            Connected agents
          </p>
          <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#191513] mt-2">
            4
          </p>
          <span className="inline-block mt-2 font-mono text-[11px] text-[#1D7A46]">
            +1 this week
          </span>
        </div>

        {/* Metric 2: 1,284 Tasks verified */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#6B635B] uppercase tracking-wider">
            Tasks verified
          </p>
          <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#191513] mt-2">
            1,284
          </p>
          <span className="inline-block mt-2 font-mono text-[11px] text-[#6B635B]">
            Across all channels
          </span>
        </div>

        {/* Metric 3: 94.2% Pass rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#6B635B] uppercase tracking-wider">
            Pass rate
          </p>
          <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#191513] mt-2">
            94.2%
          </p>
          <span className="inline-block mt-2 font-mono text-[11px] text-[#1D7A46]">
            30-day average
          </span>
        </div>

        {/* Metric 4: 17 Flagged discrepancies */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm">
          <p className="text-xs font-semibold text-[#6B635B] uppercase tracking-wider">
            Flagged discrepancies
          </p>
          <p className="font-heading font-extrabold text-3xl sm:text-4xl text-[#B8621B] mt-2">
            17
          </p>
          <span className="inline-block mt-2 font-mono text-[11px] text-[#B8621B]">
            Require review
          </span>
        </div>
      </div>

      {/* 3. Main Connected Agents Card / Table (Image 5) */}
      <div className="rounded-2xl bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
        {/* Card Filter & Search Bar */}
        <div className="p-5 border-b border-[#E8E4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-base text-[#191513]">
              Connected agents
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E4DC] text-[#6B635B]">
              {filteredAgents.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs font-medium">
              {["All", "Telegram", "API", "Webhook"].map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setFilterChannel(channel)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterChannel === channel
                      ? "bg-white text-[#191513] font-semibold shadow-2xs"
                      : "text-[#6B635B] hover:text-[#191513]"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#9E948B] text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter agents..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-[#191513] placeholder-[#9E948B] focus:outline-none focus:border-[#181311]"
              />
            </div>
          </div>
        </div>

        {/* Agents List Rows (Image 5) */}
        <div className="divide-y divide-[#E8E4DC]">
          {filteredAgents.map((ag) => (
            <div
              key={ag.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
            >
              {/* Left: Avatar & Identity */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F3EFEA] border border-[#E8E4DC] text-[#191513] flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {ag.channel === "Telegram" ? (
                    <span className="material-symbols-outlined text-[20px] text-[#2AABEE]">
                      send
                    </span>
                  ) : ag.channel === "API" ? (
                    <span className="material-symbols-outlined text-[20px] text-[#D97736]">
                      api
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-[#6B635B]">
                      webhook
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-[#191513]">
                      {ag.name}
                    </h3>
                    {/* Status Badges Matching Image 5 */}
                    {ag.status === "Healthy" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                        <span>Healthy</span>
                      </span>
                    )}
                    {ag.status === "Review settings" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF5EB] border border-[#FADCC4] text-[#B8621B] font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                        <span>Review settings</span>
                      </span>
                    )}
                    {ag.status === "Paused" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EFEA] border border-[#E8E4DC] text-[#6B635B] font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B635B]" />
                        <span>Paused</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#6B635B] mt-0.5 font-sans">
                    {ag.role}
                  </p>
                </div>
              </div>

              {/* Right: Stats & Actions */}
              <div className="flex items-center gap-6 sm:self-center self-end">
                <div className="text-right hidden md:block">
                  <p className="font-heading font-semibold text-xs text-[#191513]">
                    {ag.verifiedCount} verified
                  </p>
                  <p className="font-mono text-[11px] text-[#1D7A46]">
                    {ag.passRate} pass rate
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/verifications"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#181311] text-xs font-semibold text-[#191513] transition-colors"
                  >
                    View runs
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate("/connect-agent")}
                    className="p-1.5 rounded-xl text-[#6B635B] hover:text-[#191513] hover:bg-white border border-transparent hover:border-[#E8E4DC] transition-colors cursor-pointer"
                    title="Agent Settings"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Agents;
