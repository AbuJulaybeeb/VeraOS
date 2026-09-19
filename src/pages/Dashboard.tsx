import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVerificationsList } from "../hooks/useVerification";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { TELEGRAM_BOT_URL } from "../config/env";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { verifications, loading, refetch } = useVerificationsList(
    statusFilter,
    searchQuery
  );

  const filterTabs = [
    { label: "All Verifications", value: "ALL" },
    { label: "Passed", value: "PASSED" },
    { label: "Failed", value: "FAILED" },
    { label: "Unverified", value: "UNVERIFIED" },
  ];

  const totalCount = verifications.length;
  const passedCount = verifications.filter((v) => v.status === "PASSED").length;
  const failedCount = verifications.filter((v) => v.status === "FAILED").length;
  const unverifiedCount = verifications.filter((v) => v.status === "UNVERIFIED").length;

  return (
    <div className="flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Verification Telemetry
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code-sm text-code-sm text-secondary border border-white/5">
              Live Feed
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Deterministic evaluation stream of autonomous agent tasks against Stellar Horizon ledger ground truth and invariant kernel.
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
      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
          <span className="text-on-surface-variant">
            <strong className="text-on-surface">Connected Interface:</strong> Telegram bot is linked to this shared verification engine. Start or monitor tasks using <code className="text-secondary font-mono">/verify</code> or <code className="text-secondary font-mono">/status</code> in Telegram.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Link
            to="/invite"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 text-xs font-medium text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-primary">vpn_key</span>
            <span>Invite Portal</span>
          </Link>
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs font-semibold text-[#E08A3E] transition-colors whitespace-nowrap"
          >
            <span>Open Telegram Bot</span>
            <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
          </a>
        </div>
      </div>

      {/* Useful Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Total Ingested
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {totalCount}
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Across active sessions
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Attested Passed
          </span>
          <span className="font-headline-md text-headline-md font-bold text-[#4ade80]">
            {passedCount}
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Stellar Ledger Verified
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Breached Invariants
          </span>
          <span className="font-headline-md text-headline-md font-bold text-error">
            {failedCount}
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Remediation queued
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Unverified Claims
          </span>
          <span className="font-headline-md text-headline-md font-bold text-secondary">
            {unverifiedCount}
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Missing independent proof
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ID, worker, task..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container border border-white/5 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>

      {/* Verifications Table / Card List */}
      <div className="rounded-xl bg-surface-container-lowest border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
            <span className="font-code-sm text-code-sm">Loading verification registry...</span>
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[28px]">
                playlist_remove
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                NO VERIFICATIONS FOUND
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
                {searchQuery || statusFilter !== "ALL"
                  ? "No verification records match your filter criteria. Reset filters or search term."
                  : "Create your first verification to start independently checking AI agent outputs."}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
                navigate("/verify/new");
              }}
            >
              Create Verification
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low/80 border-b border-white/5 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Worker Agent</th>
                  <th className="py-3.5 px-4 font-semibold">Task Specification</th>
                  <th className="py-3.5 px-4 font-semibold">Network</th>
                  <th className="py-3.5 px-4 font-semibold">Attempt</th>
                  <th className="py-3.5 px-4 font-semibold">Verdict</th>
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
                    {/* ID */}
                    <td className="py-3.5 px-4 font-code-sm text-code-sm font-semibold text-primary font-mono whitespace-nowrap">
                      {item.displayId}
                    </td>

                    {/* Worker */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          smart_toy
                        </span>
                        <span className="font-medium text-on-surface">
                          {item.workerName}
                        </span>
                      </div>
                    </td>

                    {/* Task Prompt */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md truncate text-on-surface-variant">
                      <span className="truncate block" title={item.taskPrompt}>
                        {item.taskPrompt}
                      </span>
                    </td>

                    {/* Network */}
                    <td className="py-3.5 px-4 font-code-sm text-code-sm text-outline whitespace-nowrap">
                      {item.network}
                    </td>

                    {/* Attempt */}
                    <td className="py-3.5 px-4 font-code-sm text-code-sm whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface">
                        {item.currentAttempt} / {item.maxAttempts}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
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
                          UNVERIFIED
                        </Badge>
                      )}
                      {item.status === "RUNNING" && (
                        <Badge variant="running" dot pulse>
                          RUNNING
                        </Badge>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/verify/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-code-sm text-primary hover:text-primary-container px-2.5 py-1 rounded hover:bg-surface-container transition-colors"
                      >
                        <span>Inspect</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
