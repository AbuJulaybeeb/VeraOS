import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

export const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading } = useVerification(id);
  
  // State toggle for viewing both Figma variations (Passed vs Needs attention)
  const [overrideState, setOverrideState] = useState<"auto" | "passed" | "needs_attention">("auto");
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

  // Determine current display state
  const isActuallyPassed = verification?.status === "PASSED";
  const isPassed = overrideState === "auto" ? isActuallyPassed : overrideState === "passed";

  const runId = verification?.displayId ? `Run VR-${verification.displayId}` : "Run VR-2984";
  const agentName = verification?.workerName || "Customer Resolution Agent";
  const completedDate = "completed Sep 23 at 12:44 PM";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  const handleArchive = () => {
    setArchived(true);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-space-lg pb-24 md:pb-0">

      {/* Breadcrumb + header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[13px] text-outline">
            <Link to="/dashboard" className="hover:text-on-surface transition-colors">Verifications</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary font-medium">{verification.displayId}</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[11px]">
              {verification.network}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {verification.displayId}
            </h1>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all"
              title="Copy ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId ? "check" : "content_copy"}
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Top Breadcrumb & State switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B635B]">
          <Link to="/verifications" className="hover:text-[#181311] transition-colors">
            Verifications
          </Link>
          <span>/</span>
          <span className="font-mono text-[#181311]">{runId}</span>
        </div>

        {/* State Preview Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-xl border border-[#E8E4DC] text-xs">
          <span className="text-[#8C8479] px-2 font-mono text-[11px]">Preview:</span>
          <button
            onClick={() => setOverrideState("passed")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isPassed
                ? "bg-[#EAF5EE] text-[#1D7A46] font-semibold"
                : "text-[#6B635B] hover:text-[#181311]"
            }`}
          >
            Passed
          </button>
          <button
            onClick={() => setOverrideState("needs_attention")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              !isPassed
                ? "bg-[#FEF5EB] text-[#B8621B] font-semibold"
                : "text-[#6B635B] hover:text-[#181311]"
            }`}
          >
            Needs attention
          </button>
        </div>
      </div>

      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          {isPassed ? "Check result — Passed" : "Check result — Needs attention"}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          {runId} • {agentName} • {completedDate}
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
                96% confidence
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
                82% confidence
              </span>
            </>
          )}
        </div>

        {/* Headline */}
        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#181311] leading-snug">
            {isPassed
              ? "The refund was completed correctly."
              : "The refund was issued, but the required reason is not confirmed."}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-2 leading-relaxed max-w-2xl">
            {isPassed
              ? "The refund amount matches the order, the customer was notified, and the required reason was recorded. All requested outcomes are supported by strong evidence."
              : "The refund amount and customer email are supported. The order record does not clearly show \"duplicate shipment\" as the reason, so one requirement remains unresolved."}
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
                Fix missing detail →
              </Link>
              <Link
                to={id ? `/verify/${id}/correction?action=request_agent` : "/verify/new"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Request agent correction →
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
              {isPassed ? "3 of 3" : "2 of 3"}
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">
            {isPassed ? "Everything requested is complete" : "One requirement unresolved"}
          </p>
        </div>

        {/* Card 2: Evidence Quality */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm text-[#181311]">Evidence quality</span>
              <span className="text-[11px] text-[#6B635B]">Sources</span>
            </div>
            <div className="font-heading font-bold text-3xl text-[#181311] my-3">
              {isPassed ? "3 strong" : "2 strong • 1 unclear"}
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">No conflicting evidence found</p>
        </div>

        {/* Card 3: Verification Confidence */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm text-[#181311]">Verification confidence</span>
              <span className="text-[11px] text-[#6B635B]">Independent confidence</span>
            </div>
            <div className="font-heading font-bold text-3xl text-[#181311] my-3">
              {isPassed ? "96%" : "82%"}
            </div>
          </div>
          <p className="text-xs text-[#6B635B]">
            {isPassed ? "High confidence" : "High, with one evidence gap"}
          </p>
        </div>
      </div>

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
            Trace evidence →
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-[#E8E4DC]">
          {/* Check Item 1 */}
          <div className="flex items-center justify-between py-3.5 first:pt-0">
            <div>
              <p className="text-sm font-medium text-[#181311]">
                Issue a full refund of $148.20
              </p>
              <p className="text-xs text-[#6B635B] mt-0.5">
                Matched to refund record RF-88124
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
              Confirmed
            </span>
          </div>

          {/* Check Item 2 */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-medium text-[#181311]">
                Notify the customer
              </p>
              <p className="text-xs text-[#6B635B] mt-0.5">
                Matched to email sent Sep 23, 12:31 PM
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
              Confirmed
            </span>
          </div>

          {/* Check Item 3 */}
          <div className="flex items-center justify-between py-3.5 last:pb-0">
            <div>
              <p className="text-sm font-medium text-[#181311]">
                Record reason: duplicate shipment
              </p>
              <p className="text-xs text-[#6B635B] mt-0.5">
                {isPassed
                  ? "Matched to order note #N-4821"
                  : "Order note is present, but reason is not explicit"}
              </p>
            </div>
            {isPassed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
                Needs evidence
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Remediation */}
      {verification.status !== "PASSED" && (
        <RemediationPanel
          record={verification}
          onResubmit={async (patch) => { await resubmit(patch); }}
          isResubmitting={isResubmitting}
        />
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-xl border-t border-white/10 z-30 flex items-center gap-2 shadow-2xl">
        <Link to={`/verify/${verification.id}/evidence`} className="flex-1">
          <Button variant="secondary" size="md" className="w-full justify-center min-h-[44px]" icon={<span className="material-symbols-outlined text-[18px]">fingerprint</span>}>
            Evidence
          </Button>
        </Link>
        {verification.status !== "PASSED" ? (
          <Button variant="primary" size="md" onClick={scrollToRemediation} className="flex-1 justify-center min-h-[44px]" icon={<span className="material-symbols-outlined text-[18px]">build_circle</span>}>
            Fix & Resubmit
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="md"
            className="flex-1 justify-center min-h-[44px]"
            onClick={() => {
              const tx = latestAttempt?.stellarTxHash ?? "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";
              window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
            }}
            icon={<span className="material-symbols-outlined text-[18px]">verified</span>}
          >
            On Stellar
          </Button>
        )}
      </div>
    </div>
  );
};
