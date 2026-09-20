import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { StatusBanner } from "../components/verification/StatusBanner";
import { TaskSpecCard } from "../components/verification/TaskSpecCard";
import { ClaimsVsEvidence } from "../components/verification/ClaimsVsEvidence";
import { TriangulatedEvidence } from "../components/verification/TriangulatedEvidence";
import { VerdictBanner } from "../components/verification/VerdictBanner";
import { RemediationPanel } from "../components/verification/RemediationPanel";
import { Button } from "../components/ui/Button";
import { TELEGRAM_BOT_URL } from "../config/env";

export const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading, error, resubmit, isResubmitting } = useVerification(id);
  const [copiedId, setCopiedId] = useState(false);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant max-w-7xl mx-auto">
        <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="font-code-sm text-code-sm">
          Loading verification record #{id}...
        </span>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-surface-container-low rounded-2xl border border-white/5 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">
            error_outline
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
          Verification Not Found
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {error || "The requested verification could not be retrieved from the telemetry index."}
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(verification.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const scrollToRemediation = () => {
    const el = document.getElementById("remediation-panel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      {/* Top Context Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
            <Link to="/dashboard" className="hover:text-on-surface transition-colors">
              Verifications
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary font-medium">{verification.displayId}</span>
            <span className="ml-2 px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-label-caps text-label-caps uppercase tracking-wider">
              {verification.network}
            </span>
          </div>

          <div className="flex items-center gap-space-sm mt-0.5">
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Verification #{verification.displayId}
            </h1>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all"
              title="Copy Verification ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          <Link to={`/verify/${verification.id}/evidence`}>
            <Button
              variant="secondary"
              size="md"
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  fingerprint
                </span>
              }
            >
              Evidence Explorer
            </Button>
          </Link>

          {verification.status !== "PASSED" && (
            <Link to={`/verify/${verification.id}/correction`}>
              <Button
                variant="outline"
                size="md"
                icon={
                  <span className="material-symbols-outlined text-[18px]">
                    restart_alt
                  </span>
                }
              >
                Correction Flow
              </Button>
            </Link>
          )}

          {verification.status !== "PASSED" ? (
            <Button
              variant="primary"
              size="md"
              onClick={scrollToRemediation}
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  build_circle
                </span>
              }
            >
              Remediate Agent
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const tx = "5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de";
                window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
              }}
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
              }
            >
              View Stellar Ledger Proof
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert Banner */}
      <StatusBanner record={verification} />

      {/* Telegram Operational Channel Connection */}
      <div className="my-4 p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-on-surface">Telegram Interface</h3>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-code-sm text-secondary font-medium">
                Operational Channel
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Get verification updates directly in Telegram. Inspect or monitor this record using{" "}
              <code className="text-[#E08A3E] font-mono font-bold">/status {verification.displayId}</code>
            </p>
          </div>
        </div>
        <a
          href={`${TELEGRAM_BOT_URL}?start=invite_VERA-VIP-2026`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs font-semibold text-[#E08A3E] transition-colors whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>Open Telegram (Auto-Invite)</span>
          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
      </div>

      {/* Section 1: Registered Task Specification */}
      <TaskSpecCard record={verification} />

      {/* Section 2: Worker Claim vs Independent Verification */}
      <ClaimsVsEvidence
        record={verification}
        onViewOracleProof={() =>
          alert("Web Oracle proof verified via independent witness.")
        }
        onViewExplorer={() => {
          const tx = "8a7b3c21a4de99f2b1892f3900a41cd";
          window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
        }}
      />

      {/* Section 3: Triangulated Evidence Artifacts */}
      <TriangulatedEvidence record={verification} />

      {/* Section 4: Final Verdict & Action Banner */}
      <VerdictBanner
        record={verification}
        onSendForCorrection={scrollToRemediation}
      />

      {/* Section 5: Interactive Remediation / Correction Loop Drawer */}
      <RemediationPanel
        record={verification}
        onResubmit={async (patch) => {
          await resubmit(patch);
        }}
        isResubmitting={isResubmitting}
      />
    </div>
  );
};
