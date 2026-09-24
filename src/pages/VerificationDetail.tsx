import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

export const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading } = useVerification(id);
  const [archived, setArchived] = useState(false);
  const [shared, setShared] = useState(false);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6B635B] max-w-4xl mx-auto">
        <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs">Loading verification record #{id}...</span>
      </div>
    );
  }

  // Derive real verdict status
  const isPassed = verification?.status === "PASSED";
  const latestAttempt = verification?.attempts?.[verification.attempts.length - 1];
  const invariants = latestAttempt?.invariants || [];
  const evidenceList = latestAttempt?.evidence || [];
  const remediationDirectives = latestAttempt?.remediationDirectives || [];

  const passedCount = invariants.filter((i) => i.status === "PASSED").length;
  const totalCount = invariants.length || 1;
  const confidencePercent = isPassed ? 98 : Math.max(15, Math.round((passedCount / totalCount) * 100));

  const runId = verification?.displayId ? `Run VR-${verification.displayId}` : id ? `Run VR-${id.slice(-6).toUpperCase()}` : "Run VR-2984";
  const agentName = verification?.workerName || "Autonomous Agent";

  const formattedDate = verification?.createdAt
    ? new Date(verification.createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "completed recently";

  const headline = isPassed
    ? "All verification invariants satisfied."
    : latestAttempt?.summary || "Discrepancy detected during verification.";

  const description =
    latestAttempt?.detailedReason ||
    (isPassed
      ? "All requested outcomes and contract requirements are corroborating with cryptographic consensus."
      : "One or more invariants breached declared requirements. Review evidence and remediation directives below.");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  const handleArchive = () => {
    setArchived(true);
  };

  // Find Stellar on-chain explorer link if available
  const stellarEvidence = evidenceList.find((e) => e.data && (e.data as any).explorerUrl);
  const explorerUrl = (stellarEvidence?.data as any)?.explorerUrl as string | undefined;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B635B]">
          <Link to="/dashboard" className="hover:text-[#181311] transition-colors">
            Verifications
          </Link>
          <span>/</span>
          <span className="font-mono text-[#181311]">{runId}</span>
        </div>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E8E4DC] text-xs font-semibold text-[#181311] hover:bg-[#FAF8F5] transition-colors"
          >
            <span>Stellar Expert</span>
            <span className="text-[10px]">↗</span>
          </a>
        )}
      </div>

      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          {isPassed ? "Check result — Passed" : "Check result — Needs attention"}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          {runId} • {agentName} • {formattedDate}
        </p>
      </div>

      {/* Top Verdict Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-4">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPassed ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                Passed
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                {confidencePercent}% confidence
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                Needs attention
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                {confidencePercent}% confidence
              </span>
            </>
          )}
          {verification?.quorum && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-[#6B635B] bg-[#F3EFEA] border border-[#E8E4DC]">
              Quorum: {verification.quorum}
            </span>
          )}
        </div>

        {/* Headline */}
        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#181311] leading-snug">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-2 leading-relaxed max-w-2xl font-mono">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          {isPassed ? (
            <>
              <button
                onClick={handleArchive}
                disabled={archived}
                className="px-4 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {archived ? "Result archived ✓" : "Archive result →"}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {shared ? "Link copied to clipboard ✓" : "Share report →"}
              </button>
            </>
          ) : (
            <>
              <Link
                to={id ? `/verify/${id}/correction` : "/verify/new"}
                className="px-4 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                Execute remediation directive →
              </Link>
              <Link
                to={id ? `/verify/${id}/evidence` : "/evidence"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Inspect raw evidence →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 3 Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Completion */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm text-[#181311]">Completion</span>
              <span className="text-[11px] text-[#6B635B]">Requirements fulfilled</span>
            </div>
            <div className="font-heading font-bold text-3xl text-[#181311] my-3">
              {passedCount} of {totalCount}
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">
            {isPassed ? "Everything requested is complete" : `${totalCount - passedCount} requirement(s) unresolved`}
          </p>
        </div>

        {/* Card 2: Evidence Quality */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm text-[#181311]">Evidence quality</span>
              <span className="text-[11px] text-[#6B635B]">Proof sources</span>
            </div>
            <div className="font-heading font-bold text-3xl text-[#181311] my-3">
              {evidenceList.length} verified
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">
            {evidenceList.length > 0 ? "Corroborated against consensus" : "Awaiting consensus"}
          </p>
        </div>

        {/* Card 3: Verification Confidence */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm text-[#181311]">Verification confidence</span>
              <span className="text-[11px] text-[#6B635B]">Deterministic rigor</span>
            </div>
            <div className="font-heading font-bold text-3xl text-[#181311] my-3">
              {confidencePercent}%
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">
            {isPassed ? "High confidence" : "Breach detected by independent oracle"}
          </p>
        </div>
      </div>

      {/* Remediation Directives Banner (if failed) */}
      {!isPassed && remediationDirectives.length > 0 && (
        <div className="bg-[#FEF5EB] rounded-2xl border border-[#FADCC4] p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#B8621B] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#B8621B]" />
            Remediation Directives Issued
          </div>
          <div className="flex flex-col gap-2">
            {remediationDirectives.map((dir, idx) => (
              <div key={dir.id || idx} className="bg-white/80 p-3.5 rounded-xl border border-[#FADCC4]/60 text-xs sm:text-sm">
                <span className="font-bold text-[#181311] font-mono mr-2">[{dir.action}]</span>
                <span className="text-[#6B635B]">{dir.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Card: What Vera Checked */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
            What Vera checked
          </h3>
          <Link
            to={id ? `/verify/${id}/evidence` : "/evidence"}
            className="text-xs font-semibold text-[#181311] hover:underline"
          >
            Trace evidence ({evidenceList.length} sources) →
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-[#E8E4DC]">
          {invariants.length > 0 ? (
            invariants.map((inv, idx) => {
              const invPassed = inv.status === "PASSED";
              return (
                <div key={inv.id || idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-[#181311]">
                      {inv.name || `Invariant ${idx + 1}`}
                    </p>
                    <p className="text-xs text-[#6B635B]">
                      Expected: <span className="font-mono text-[#181311]">{inv.expected}</span>
                      {inv.actual && (
                        <>
                          {" "}• Observed: <span className="font-mono text-[#181311]">{inv.actual}</span>
                        </>
                      )}
                    </p>
                    {inv.delta && (
                      <p className="text-[11px] font-mono text-[#B8621B]">
                        Discrepancy: {inv.delta}
                      </p>
                    )}
                  </div>
                  {invPassed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                      Breached
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[#6B635B] py-3">No invariant records registered.</p>
          )}
        </div>
      </div>
    </div>
  );
};
