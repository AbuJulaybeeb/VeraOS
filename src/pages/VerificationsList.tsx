import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVerificationsList } from "../hooks/useVerification";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const VerificationsList: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { verifications, loading, refetch } = useVerificationsList(
    statusFilter,
    searchQuery
  );

  const filterTabs = [
    { label: "All", value: "ALL" },
    { label: "Verified", value: "PASSED" },
    { label: "Failed", value: "FAILED" },
    { label: "Unverifiable", value: "UNVERIFIED" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#FFF8F0]">
            Verifications
          </h1>
          <p className="text-xs sm:text-sm text-[#B9A99B] mt-1">
            Audit history of all evaluated agent tasks and independent checks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/verify/new")}
            icon={<span className="material-symbols-outlined text-[16px]">add</span>}
          >
            New Verification
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[#21110B] border border-[#4A2B1D]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-[#C96A2B] text-white font-semibold"
                  : "text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2C1710]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B9A99B] text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, agent, or task..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder-[#B9A99B]/50 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
          />
        </div>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center gap-3 text-[#B9A99B]">
          <span className="w-8 h-8 border-2 border-[#C96A2B] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs">Loading verification records...</span>
        </div>
      ) : verifications.length === 0 ? (
        <div className="p-12 sm:p-20 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FFF8F0]">
              No verifications yet
            </h3>
            <p className="text-xs sm:text-sm text-[#B9A99B] max-w-sm mt-1.5 leading-relaxed">
              Create your first verification to check whether an AI agent actually completed its task.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/verify/new")}
            icon={<span className="material-symbols-outlined text-[16px]">add</span>}
          >
            New Verification
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {verifications.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/verify/${item.id}`)}
              className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] hover:border-[#E08A3E]/40 transition-all flex flex-col justify-between cursor-pointer group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-[#E08A3E]">
                    #{item.displayId}
                  </span>

                  {item.status === "PASSED" && (
                    <Badge variant="passed" dot>
                      VERIFIED
                    </Badge>
                  )}
                  {item.status === "FAILED" && (
                    <Badge variant="failed" dot>
                      FAILED
                    </Badge>
                  )}
                  {item.status === "UNVERIFIED" && (
                    <Badge variant="unverified" dot>
                      UNVERIFIABLE
                    </Badge>
                  )}
                  {item.status === "RUNNING" && (
                    <Badge variant="running" dot pulse>
                      RUNNING
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2 text-xs text-[#B9A99B]">
                  <span className="material-symbols-outlined text-[16px] text-[#B9A99B]">
                    smart_toy
                  </span>
                  <span className="font-heading font-medium text-[#FFF8F0] truncate">
                    {item.workerName || item.workerId}
                  </span>
                </div>

                <p className="text-xs text-[#B9A99B] line-clamp-3 leading-relaxed mb-4">
                  {item.taskPrompt}
                </p>
              </div>

              <div className="pt-3 border-t border-[#4A2B1D] flex items-center justify-between text-xs text-[#B9A99B]">
                <span className="font-mono text-[11px]">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-heading font-medium text-[#E08A3E] group-hover:text-white transition-colors">
                  <span>Inspect</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
