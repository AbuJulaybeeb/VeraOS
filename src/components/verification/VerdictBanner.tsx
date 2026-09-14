import React, { useState } from "react";
import { VerificationRecord } from "../../types/verification";
import { cn } from "../../lib/utils";

interface VerdictBannerProps {
  record: VerificationRecord;
  onSendForCorrection: () => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  record,
  onSendForCorrection,
}) => {
  const [copied, setCopied] = useState(false);
  const isPassed = record.status === "PASSED";

  const handleExport = () => {
    const packet = {
      verification_id: record.id,
      display_id: record.displayId,
      status: record.status,
      timestamp: new Date().toISOString(),
      network: record.network,
      chainId: record.chainId,
      attempt: record.currentAttempt,
      eas_uid: record.attempts[record.attempts.length - 1]?.easUid || null,
      invariants: record.attempts[record.attempts.length - 1]?.invariants || [],
      evidence: record.attempts[record.attempts.length - 1]?.evidence || [],
    };
    navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-space-md lg:p-space-lg rounded-xl bg-surface-container-high shadow-xl mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-white/10">
      <div className="flex items-start gap-space-sm">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-md",
            isPassed ? "bg-[#1b432e] text-[#4ade80]" : "bg-error-container text-error"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPassed ? "verified" : "warning"}
          </span>
        </div>

        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            {isPassed
              ? "Verdict: All Invariants Confirmed — Attestation Finalized on Base"
              : "Verdict: 2 Invariant Conflicts Require Autonomous Correction"}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
            {isPassed
              ? `Cryptographic proof committed to Base EAS registry at block #${record.attempts[record.attempts.length - 1]?.blockNumber || 21849201}. Smart contracts and downstream agents can query attestation.`
              : "Seamless Protocol fails TVL requirement ($8.24M vs $10.0M threshold). In addition, compensation transaction contains a 90% deficit (transferred 0.5 USDC vs 5.0 USDC requested)."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-space-sm shrink-0 w-full md:w-auto">
        {!isPassed && (
          <button
            onClick={onSendForCorrection}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary font-headline-sm text-headline-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,87,8,0.35)]"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Send Back for Correction</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 font-code-sm text-code-sm text-white">
              Attempt {record.currentAttempt}/{record.maxAttempts}
            </span>
          </button>
        )}

        <button
          onClick={handleExport}
          className="px-3 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-body-sm text-body-sm font-medium transition-colors border border-white/5 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? "check" : "content_copy"}
          </span>
          <span>{copied ? "Attestation Copied!" : "Export Attestation"}</span>
        </button>
      </div>
    </div>
  );
};
