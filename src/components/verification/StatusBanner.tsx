import React from "react";
import { VerificationRecord } from "../../types/verification";
import { cn } from "../../lib/utils";

interface StatusBannerProps {
  record: VerificationRecord;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ record }) => {
  const currentAttempt = record.attempts[record.attempts.length - 1];
  const isPassed = record.status === "PASSED";
  const isFailed = record.status === "FAILED";
  const isUnverified = record.status === "UNVERIFIED";

  const failedInvariants =
    currentAttempt?.invariants.filter((i) => i.status === "FAILED") || [];
  const passedInvariants =
    currentAttempt?.invariants.filter((i) => i.status === "PASSED") || [];
  const totalInvariants = currentAttempt?.invariants.length || 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-space-md lg:p-space-lg mb-space-lg shadow-xl border",
        isFailed && "bg-error-container/20 border-error/30",
        isPassed && "bg-[#14291e]/60 border-[#22c55e]/30",
        isUnverified && "bg-surface-container-high border-secondary/30"
      )}
    >
      {/* Background radial glow */}
      <div
        className={cn(
          "absolute -right-10 -top-10 w-56 h-56 rounded-full blur-3xl pointer-events-none",
          isFailed && "bg-error/15",
          isPassed && "bg-[#22c55e]/15",
          isUnverified && "bg-secondary/10"
        )}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
        <div className="flex items-start gap-space-md">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
              isFailed && "bg-error-container shadow-[0_0_16px_rgba(147,0,10,0.5)]",
              isPassed && "bg-[#1b432e] text-[#4ade80] shadow-[0_0_16px_rgba(34,197,94,0.3)]",
              isUnverified && "bg-surface-container-highest text-secondary shadow-[0_0_16px_rgba(238,152,0,0.3)]"
            )}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPassed ? "verified" : isFailed ? "gpp_bad" : "help_outline"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span
                className={cn(
                  "font-headline-sm text-headline-sm font-bold tracking-tight",
                  isFailed && "text-error",
                  isPassed && "text-[#4ade80]",
                  isUnverified && "text-secondary"
                )}
              >
                {currentAttempt?.summary || "VERIFICATION EVALUATION"}
              </span>

              {isFailed && (
                <span className="px-2 py-0.5 rounded-full bg-error/20 text-error font-label-caps text-label-caps tracking-wider uppercase font-semibold">
                  {failedInvariants.length} Critical Breach
                  {failedInvariants.length === 1 ? "" : "es"}
                </span>
              )}

              {isPassed && (
                <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] font-label-caps text-label-caps tracking-wider uppercase font-semibold">
                  100% Invariants Grounded
                </span>
              )}

              {isUnverified && (
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-caps text-label-caps tracking-wider uppercase font-semibold">
                  Evidence Inconclusive
                </span>
              )}
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              {currentAttempt?.detailedReason ||
                `${passedInvariants.length} of ${totalInvariants} invariants verified.`}
            </p>
          </div>
        </div>

        {/* Telemetry Pill Group */}
        <div className="flex items-center gap-2 flex-wrap bg-surface-container-lowest/80 p-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              ID
            </span>
            <span className="font-code-sm text-code-sm text-on-surface font-mono">
              {record.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Worker
            </span>
            <span className="font-code-sm text-code-sm text-secondary">
              {record.workerName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Attempt
            </span>
            <span className="font-code-sm text-code-sm text-primary-fixed">
              {record.currentAttempt} / {record.maxAttempts}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-code-sm text-code-sm text-on-surface">
              {record.network}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
