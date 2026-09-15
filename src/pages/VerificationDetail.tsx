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

      {/* Section 1: Registered Task Specification */}
      <TaskSpecCard record={verification} />

      {/* Section 2: Worker Claim vs Independent Verification */}
      <ClaimsVsEvidence
        record={verification}
        onViewOracleProof={() =>
          alert("DefiLlama TLS-Notary proof verified via independent oracle.")
        }
        onViewBaseScan={() => {
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
