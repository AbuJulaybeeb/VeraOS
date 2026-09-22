import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const filterTabs = [
    { label: "All", value: "ALL" },
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Overview
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Verify an agent's work before you trust the result.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
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
            size="md"
            onClick={() => navigate("/verify/new")}
            icon={<span className="material-symbols-outlined text-[18px]">add_circle</span>}
          >
            New Verification
          </Button>
        </div>
      </div>

      {/* Summary Cards — real counts only, no fake numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Total
          </span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {totalCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline">
            Verifications submitted
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Passed
          </span>
          <span className="font-headline-md text-headline-md font-bold text-[#4ade80]">
            {passedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline">
            Independently verified
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Failed
          </span>
          <span className="font-headline-md text-headline-md font-bold text-error">
            {failedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline">
            Requirements not met
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            Unverified
          </span>
          <span className="font-headline-md text-headline-md font-bold text-secondary">
            {unverifiedCount}
          </span>
          <span className="font-body-sm text-body-sm text-outline">
            Missing evidence
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto">
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

        <div className="relative flex-1 sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, agent, task..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container border border-white/5 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>

      {/* Verifications List */}
      <div className="rounded-xl bg-surface-container-lowest border border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
            <span className="font-body-sm text-body-sm">Loading verifications...</span>
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                No verifications yet
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
                {searchQuery || statusFilter !== "ALL"
                  ? "No records match your filter. Try adjusting or clearing it."
                  : "Create your first verification to see independent evidence and verdicts here."}
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
              Create verification
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="bg-surface-container-low/80 border-b border-white/5">
                  <tr className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">ID</th>
                    <th className="py-3.5 px-4 font-semibold">Agent</th>
                    <th className="py-3.5 px-4 font-semibold">Task</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Time</th>
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
                      <td className="py-3.5 px-4 max-w-xs lg:max-w-sm text-on-surface-variant">
                        <span className="truncate block" title={item.taskPrompt}>
                          {item.taskPrompt}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.status === "PASSED" && <Badge variant="passed" dot>VERIFIED</Badge>}
                        {item.status === "FAILED" && <Badge variant="failed" dot>FAILED</Badge>}
                        {item.status === "UNVERIFIED" && <Badge variant="unverified" dot>UNVERIFIED</Badge>}
                        {item.status === "RUNNING" && <Badge variant="running" dot pulse>RUNNING</Badge>}
                      </td>
                      <td className="py-3.5 px-4 font-code-sm text-code-sm text-outline whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
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
            <div className="md:hidden divide-y divide-white/5">
              {verifications.map((item) => (
                <Link
                  key={item.id}
                  to={`/verify/${item.id}`}
                  className="flex flex-col gap-2 p-4 hover:bg-surface-container/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-code-sm text-code-sm font-semibold text-primary font-mono">
                      {item.displayId}
                    </span>
                    {item.status === "PASSED" && <Badge variant="passed" dot>VERIFIED</Badge>}
                    {item.status === "FAILED" && <Badge variant="failed" dot>FAILED</Badge>}
                    {item.status === "UNVERIFIED" && <Badge variant="unverified" dot>UNVERIFIED</Badge>}
                    {item.status === "RUNNING" && <Badge variant="running" dot pulse>RUNNING</Badge>}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface line-clamp-2">
                    {item.taskPrompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-outline">
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                      <span className="font-body-sm text-body-sm">{item.workerName}</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
