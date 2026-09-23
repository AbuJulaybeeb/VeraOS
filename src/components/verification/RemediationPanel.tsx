import React, { useState } from "react";
import { VerificationRecord } from "../../types/verification";
import { cn } from "../../lib/utils";

interface RemediationPanelProps {
  record: VerificationRecord;
  onResubmit: (patch?: { target?: string; supplementalAmount?: number; txHash?: string }) => Promise<void>;
  isResubmitting: boolean;
}

export const RemediationPanel: React.FC<RemediationPanelProps> = ({
  record,
  onResubmit,
  isResubmitting,
}) => {
  const currentAttempt = record.attempts?.[record.attempts.length - 1];
  const directives = currentAttempt?.remediationDirectives || [];
  const isPassed = record.status === "PASSED";

  const [targetCorrection, setTargetCorrection] = useState("");
  const [supplementalTx, setSupplementalTx] = useState("");
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const handleTriggerDispatch = async () => {
    setDispatchError(null);
    try {
      await onResubmit({
        target: targetCorrection.trim() || undefined,
        txHash: supplementalTx.trim() || undefined,
      });
    } catch (err: any) {
      setDispatchError(err?.message || "Failed to dispatch remediation");
    }
  };

  return (
    <div
      id="remediation-panel"
      className="rounded-xl bg-surface-container p-space-md lg:p-space-lg shadow-2xl relative overflow-hidden border border-white/10"
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md border-b border-white/5">
        <div className="flex items-start gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0 border border-primary-container/30">
            <span className="material-symbols-outlined text-primary text-[24px]">
              restart_alt
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Autonomous Remediation Loop
              </h2>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-semibold",
                  isPassed
                    ? "bg-[#22c55e]/20 text-[#4ade80]"
                    : "bg-secondary-container/20 text-secondary"
                )}
              >
                {isPassed ? "Cycle Resolved" : "Action Required"}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Machine-readable invariant feedback for{" "}
              <span className="text-on-surface font-medium">{record.workerName || record.workerId}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg font-code-sm text-code-sm text-outline border border-white/5 self-start lg:self-auto">
          <span>Attempt:</span>
          <span className="text-secondary font-mono">
            {record.currentAttempt} / {record.maxAttempts}
          </span>
        </div>
      </div>

      {/* Remediation Directives List */}
      <div className="flex flex-col gap-space-md my-space-md">
        <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
          Remediation Directives
        </span>

        {directives.length > 0 ? (
          directives.map((dir, idx) => (
            <div
              key={dir.id || idx}
              className="p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-white/5"
            >
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px] mt-0.5">
                  {dir.action === "REPLACE_TARGET" ? "swap_horiz" : "payments"}
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {dir.action}
                    </span>
                    <span className="font-code-sm text-code-sm text-primary-fixed-dim bg-surface-container px-1.5 py-0.2 rounded border border-white/5">
                      {dir.invariantId}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {dir.reason}
                  </p>

                  {dir.suggestedAlternatives && dir.suggestedAlternatives.length > 0 && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-label-caps text-label-caps text-outline uppercase">
                        Suggestions:
                      </span>
                      {dir.suggestedAlternatives.map((alt) => (
                        <button
                          type="button"
                          key={alt}
                          onClick={() => setTargetCorrection(alt)}
                          className={cn(
                            "px-1.5 py-0.5 rounded font-code-sm text-code-sm transition-colors border",
                            targetCorrection === alt
                              ? "bg-primary-container text-on-primary border-primary-container"
                              : "bg-surface-container text-secondary border-white/5 hover:border-white/20"
                          )}
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <span className="px-2 py-1 rounded bg-surface-container-high text-primary-fixed font-code-sm text-code-sm shrink-0 self-start md:self-auto border border-white/5">
                {dir.mandatory ? "Mandatory Invariant" : "Optional"}
              </span>
            </div>
          ))
        ) : (
          <div className="p-space-md rounded-lg bg-surface-container-low text-body-sm text-on-surface-variant border border-white/5">
            {isPassed
              ? "All invariant checks passed. No pending corrective actions."
              : (currentAttempt?.detailedReason || "Deficits detected during verification check.")}
          </div>
        )}
      </div>

      {/* Interactive Remediation Form */}
      {!isPassed && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-3 my-space-md">
          <span className="font-label-caps text-label-caps uppercase text-outline font-semibold">
            Supply Remediation Values
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-outline mb-1 block">Correction Target / Data</label>
              <input
                type="text"
                value={targetCorrection}
                onChange={(e) => setTargetCorrection(e.target.value)}
                placeholder="e.g. Corrected protocol or output value"
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-outline mb-1 block">Supplemental Stellar Tx Hash (Optional)</label>
              <input
                type="text"
                value={supplementalTx}
                onChange={(e) => setSupplementalTx(e.target.value)}
                placeholder="64-character hex transaction hash"
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {dispatchError && (
        <div className="p-3 mb-3 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300">
          {dispatchError}
        </div>
      )}

      {/* Dispatch Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-white/5">
        <div className="flex items-center gap-space-sm text-outline font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[18px]">
            verified_user
          </span>
          <span>
            {isPassed
              ? "Verification state is final and corroborated."
              : "Submitting remediation will trigger immediate re-evaluation of invariants."}
          </span>
        </div>

        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          {!isPassed ? (
            <button
              type="button"
              onClick={handleTriggerDispatch}
              disabled={isResubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-space-lg py-3 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary font-headline-sm text-headline-sm font-bold transition-all shadow-[0_0_24px_rgba(255,87,8,0.4)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isResubmitting ? "autorenew" : "send_time_extension"}
              </span>
              <span>
                {isResubmitting ? "Resubmitting..." : "Resubmit & Re-verify"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[#4ade80] font-headline-sm font-semibold">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Remediation Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
