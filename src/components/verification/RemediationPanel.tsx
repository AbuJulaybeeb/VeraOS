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
  const [dispatchStatus, setDispatchStatus] = useState<"idle" | "dispatching" | "dispatched">("idle");
  const [selectedTarget, setSelectedTarget] = useState("Aerodrome ($214M TVL)");

  const currentAttempt = record.attempts[record.attempts.length - 1];
  const directives = currentAttempt?.remediationDirectives || [];
  const isPassed = record.status === "PASSED";

  const handleTriggerDispatch = async () => {
    setDispatchStatus("dispatching");
    setTimeout(async () => {
      setDispatchStatus("dispatched");
      // Trigger real resubmission update
      await onResubmit({
        target: selectedTarget.split(" ")[0],
        supplementalAmount: 4.5,
        txHash: "0x91cc4421b8fa012984fe9823901bca019",
      });
    }, 1200);
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
                {isPassed ? "Cycle Resolved" : "Active Cycle"}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              VeraOS formulates machine-readable invariant remediation directives for{" "}
              <span className="text-on-surface font-medium">{record.workerName}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg font-code-sm text-code-sm text-outline border border-white/5 self-start lg:self-auto">
          <span>Protocol:</span>
          <span className="text-secondary font-mono">vera-remediate-v1</span>
        </div>
      </div>

      {/* Stepper Pipeline State */}
      <div className="my-space-md p-space-md rounded-xl bg-surface-container-lowest border border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm relative">
          {/* Step 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-code-sm text-code-sm font-bold">
                1
              </span>
              <span className="font-headline-sm text-headline-sm font-medium text-primary">
                Directive Ready
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-secondary">
              Packet Compiled
            </span>
          </div>

          {/* Step 2 */}
          <div
            className={cn(
              "flex flex-col gap-1 transition-opacity",
              dispatchStatus === "idle" && !isPassed ? "opacity-50" : "opacity-100"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold",
                  dispatchStatus !== "idle" || isPassed
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container text-outline"
                )}
              >
                2
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Agent Ingestion
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">
              Self-Correction
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={cn(
              "flex flex-col gap-1 transition-opacity",
              record.currentAttempt >= 2 ? "opacity-100" : "opacity-40"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold",
                  record.currentAttempt >= 2
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container text-outline"
                )}
              >
                3
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Resubmission
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">
              Attempt {record.currentAttempt}/{record.maxAttempts}
            </span>
          </div>

          {/* Step 4 */}
          <div
            className={cn(
              "flex flex-col gap-1 transition-opacity",
              isPassed ? "opacity-100" : "opacity-40"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold",
                  isPassed ? "bg-[#22c55e] text-black" : "bg-surface-container text-outline"
                )}
              >
                4
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Re-Verification
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-outline">
              {isPassed ? "Deterministic Pass" : "Pending"}
            </span>
          </div>

          {/* Step 5 */}
          <div
            className={cn(
              "flex flex-col gap-1 transition-opacity",
              isPassed ? "opacity-100" : "opacity-40"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-code-sm text-code-sm font-bold",
                  isPassed ? "bg-[#22c55e] text-black" : "bg-surface-container text-outline"
                )}
              >
                5
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Final Verdict
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-[#4ade80]">
              {isPassed ? "Confirmed on Stellar" : "Awaiting Pass"}
            </span>
          </div>
        </div>
      </div>

      {/* Remediation Directives List */}
      <div className="flex flex-col gap-space-md mb-space-lg">
        <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider font-semibold">
          Remediation Directives (Auto-Generated)
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

                  {dir.suggestedAlternatives && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-label-caps text-label-caps text-outline uppercase">
                        Suggested Valid Substitutes:
                      </span>
                      {dir.suggestedAlternatives.map((alt) => (
                        <button
                          key={alt}
                          onClick={() => setSelectedTarget(alt)}
                          className={cn(
                            "px-1.5 py-0.5 rounded font-code-sm text-code-sm transition-colors border",
                            selectedTarget === alt
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
            All invariant directives successfully reconciled. No pending corrective actions.
          </div>
        )}
      </div>

      {/* Dispatch & Feedback Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-white/5">
        <div className="flex items-center gap-space-sm text-outline font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[18px]">
            verified_user
          </span>
          <span>
            Automatic worker webhook{" "}
            <code className="text-on-surface">https://agent.acme.ai/remediate</code> will
            receive cryptographic retry envelope.
          </span>
        </div>

        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          {!isPassed ? (
            <button
              onClick={handleTriggerDispatch}
              disabled={dispatchStatus === "dispatching" || isResubmitting}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-space-lg py-3 rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary font-headline-sm text-headline-sm font-bold transition-all shadow-[0_0_24px_rgba(255,87,8,0.4)] disabled:opacity-50"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {dispatchStatus === "dispatching" ? "autorenew" : "send_time_extension"}
              </span>
              <span>
                {dispatchStatus === "dispatching"
                  ? "Dispatching Packet..."
                  : "Dispatch Correction Packet"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[#4ade80] font-headline-sm">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Remediation Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Simulation Banner */}
      {dispatchStatus === "dispatched" && (
        <div className="mt-space-md p-space-md rounded-lg bg-secondary-container/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-secondary/30">
          <div className="flex items-center gap-space-sm">
            <div className="w-3 h-3 rounded-full bg-secondary animate-ping shrink-0" />
            <span className="font-body-md text-body-md text-on-surface font-medium">
              Correction envelope sent to {record.workerName}. Agent substituted target with{" "}
              {selectedTarget} & executed supplemental payout. Re-verification passed!
            </span>
          </div>
          <span className="font-code-sm text-code-sm text-secondary shrink-0">
            HTTP 202 ACCEPTED
          </span>
        </div>
      )}
    </div>
  );
};
