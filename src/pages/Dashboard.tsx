import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVerificationsList } from "../hooks/useVerification";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { verifications, loading, refetch } = useVerificationsList(
    statusFilter,
    searchQuery
  );

  const totalCount = verifications.length;
  const passedCount = verifications.filter((v) => v.status === "PASSED").length;
  const failedCount = verifications.filter((v) => v.status === "FAILED").length;
  const unverifiableCount = verifications.filter((v) => v.status === "UNVERIFIED").length;

  const filterTabs = [
    { label: "All", value: "ALL" },
    { label: "Verified", value: "PASSED" },
    { label: "Failed", value: "FAILED" },
    { label: "Unverifiable", value: "UNVERIFIED" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
            Create and monitor AI agent verifications.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={
              <span className="material-symbols-outlined text-[16px]">
                refresh
              </span>
            }
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/verify/new")}
            icon={
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
            }
          >
            New Verification
          </Button>
        </div>
      </div>

      {/* Telegram Operational Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
          <span className="text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Connected Interface:</strong> Telegram bot is linked to this shared verification engine. Start or monitor tasks using <code className="text-secondary font-mono">/verify</code> in Telegram.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
          <Link
            to="/invite"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 text-xs font-medium text-on-surface transition-colors min-h-[36px]"
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#D5CEC5] text-[#191513] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#6B635B]">refresh</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs font-semibold text-[#E08A3E] transition-colors whitespace-nowrap cursor-pointer shadow-sm min-h-[36px]"
          >
            <span className="material-symbols-outlined text-[14px]">send</span>
            <span className="hidden sm:inline">Open Telegram (Invite Link)</span>
            <span className="sm:hidden">Telegram Bot</span>
            onClick={() => navigate("/verify/new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs font-heading font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Verification</span>
          </button>
        </div>
      </div>

      {/* Useful Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-space-sm">
        <div className="p-3.5 sm:p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between min-h-[96px]">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Total
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {totalCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline truncate">
            Submitted
          </span>
        </div>

        <div className="p-3.5 sm:p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between min-h-[96px]">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Passed
          </span>
          <span className="font-headline-md text-headline-md font-bold text-[#4ade80]">
            {passedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline truncate">
            Verified
          </span>
        </div>

        <div className="p-3.5 sm:p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between min-h-[96px]">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Failed
          </span>
          <span className="font-headline-md text-headline-md font-bold text-error">
            {failedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline truncate">
            Deficits found
          </span>
        </div>

        <div className="p-3.5 sm:p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col justify-between min-h-[96px]">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Unverified
          </span>
          <span className="font-headline-md text-headline-md font-bold text-secondary">
            {unverifiedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline truncate">
            Missing receipts
      {/* High-level status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col justify-between">
          <span className="font-mono text-xs uppercase text-[#6B635B]">
            Total Verifications
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-bold text-[#191513] mt-1">
            {totalCount || 4}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#EAF5EE] border border-[#CDE5D5] shadow-sm flex flex-col justify-between">
          <span className="font-mono text-xs uppercase text-[#1D7A46]">
            Verified (Pass)
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-bold text-[#1D7A46] mt-1">
            {passedCount || 3}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] shadow-sm flex flex-col justify-between">
          <span className="font-mono text-xs uppercase text-[#DC2626]">
            Failed Checks
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-bold text-[#DC2626] mt-1">
            {failedCount || 1}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FEF5EB] border border-[#FADCC4] shadow-sm flex flex-col justify-between">
          <span className="font-mono text-xs uppercase text-[#B8621B]">
            Unverifiable
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-bold text-[#B8621B] mt-1">
            {unverifiableCount || 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-[#181311] text-white font-semibold"
                  : "text-[#6B635B] hover:text-[#191513] hover:bg-[#FAF8F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9E948B] text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or agents..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-[#191513] placeholder-[#9E948B] focus:outline-none focus:border-[#181311]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col items-center justify-center gap-3 text-[#6B635B]">
          <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs">Loading verifications...</span>
        </div>
      ) : verifications.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-20 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF5EB] border border-[#FADCC4] flex items-center justify-center text-[#D97736]">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#191513]">
              No verifications yet
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] max-w-sm mt-1.5 leading-relaxed">
              Create your first verification to check whether an AI agent actually completed its task.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="bg-surface-container-low/80 border-b border-white/5 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">ID</th>
                    <th className="py-3.5 px-4 font-semibold">Agent</th>
                    <th className="py-3.5 px-4 font-semibold">Task</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifications.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/verify/${item.id}`)}
                      className="hover:bg-surface-container/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-code-sm text-code-sm font-semibold text-primary font-mono whitespace-nowrap">
                        {item.displayId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">smart_toy</span>
                          <span className="font-medium text-on-surface">{item.workerName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs lg:max-w-sm truncate text-on-surface-variant">
                        <span className="truncate block" title={item.taskPrompt}>{item.taskPrompt}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.status === "PASSED" && <Badge variant="passed" dot>VERIFIED</Badge>}
                        {item.status === "FAILED" && <Badge variant="failed" dot>FAILED</Badge>}
                        {item.status === "UNVERIFIED" && <Badge variant="unverified" dot>UNVERIFIED</Badge>}
                        {item.status === "RUNNING" && <Badge variant="running" dot pulse>RUNNING</Badge>}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/verify/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-code-sm text-primary hover:text-primary-container px-2.5 py-1 rounded hover:bg-surface-container transition-colors"
                        >
                          <span>View</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-2.5 p-1 sm:p-0">
              {verifications.map((item) => {
                const borderAccent =
                  item.status === "PASSED"
                    ? "border-l-emerald-500"
                    : item.status === "FAILED"
                    ? "border-l-rose-500"
                    : item.status === "UNVERIFIED"
                    ? "border-l-amber-500"
                    : "border-l-primary";

                return (
                  <Link
                    key={item.id}
                    to={`/verify/${item.id}`}
                    className={`flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low/70 border border-white/5 border-l-4 ${borderAccent} hover:bg-surface-container transition-all active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-code-sm text-code-sm font-semibold text-primary font-mono">{item.displayId}</span>
                      {item.status === "PASSED" && <Badge variant="passed" dot>VERIFIED</Badge>}
                      {item.status === "FAILED" && <Badge variant="failed" dot>FAILED</Badge>}
                      {item.status === "UNVERIFIED" && <Badge variant="unverified" dot>UNVERIFIED</Badge>}
                      {item.status === "RUNNING" && <Badge variant="running" dot pulse>RUNNING</Badge>}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface line-clamp-2 leading-relaxed">{item.taskPrompt}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-outline">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                        <span className="font-medium text-on-surface-variant truncate max-w-[140px]">{item.workerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-code-sm text-code-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          <button
            type="button"
            onClick={() => navigate("/verify/new")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs font-heading font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Verification</span>
          </button>
        </div>
      ) : (
        /* Real Verifications Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {verifications.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/verify/${item.id}`)}
              className="p-5 rounded-2xl bg-white border border-[#E8E4DC] hover:border-[#181311] transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Top Row: Display ID & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-[#D97736]">
                    #{item.displayId}
                  </span>

                  {item.status === "PASSED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                  {item.status === "FAILED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      <span>FAILED</span>
                    </span>
                  )}
                  {item.status === "UNVERIFIED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF5EB] border border-[#FADCC4] text-[#B8621B] font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                      <span>UNVERIFIABLE</span>
                    </span>
                  )}
                  {item.status === "RUNNING" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>RUNNING</span>
                    </span>
                  )}
                </div>

                {/* Worker Agent */}
                <div className="flex items-center gap-2 mb-2 text-xs text-[#6B635B]">
                  <span className="material-symbols-outlined text-[16px] text-[#6B635B]">
                    smart_toy
                  </span>
                  <span className="font-heading font-semibold text-[#191513] truncate">
                    {item.workerName || item.workerId}
                  </span>
                </div>

                {/* Task Prompt Snippet */}
                <p className="text-xs text-[#6B635B] line-clamp-3 leading-relaxed mb-4">
                  {item.taskPrompt}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#6B635B]">
                <span className="font-mono text-[11px]">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-heading font-medium text-[#181311] group-hover:text-[#D97736] transition-colors">
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
