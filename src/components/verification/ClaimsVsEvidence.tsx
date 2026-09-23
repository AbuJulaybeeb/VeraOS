import React from "react";
import { VerificationRecord } from "../../types/verification";
import { cn } from "../../lib/utils";

interface ClaimsVsEvidenceProps {
  record: VerificationRecord;
  onViewOracleProof?: () => void;
  onViewExplorer?: () => void;
}

export const ClaimsVsEvidence: React.FC<ClaimsVsEvidenceProps> = ({
  record,
  _onViewExplorer,
}: ClaimsVsEvidenceProps & { _onViewExplorer?: () => void }) => {
  const currentAttempt = record.attempts?.[record.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];
  const claims = currentAttempt?.workerClaims || [];

  const passedCount = invariants.filter((i) => i.status === "PASSED").length;
  const totalCount = invariants.length;
  const stellarTx = currentAttempt?.stellarTxHash || record.stellarTxHash;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg mb-space-lg items-start">
      {/* LEFT COLUMN: WORKER AGENT SUBMISSION (CLAIM) */}
      <div className="xl:col-span-5 rounded-xl bg-surface-container-lowest p-space-md lg:p-space-lg shadow-sm border border-white/5 flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">
              smart_toy
            </span>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Worker Agent Output (Claims)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-code-sm text-code-sm">
            Self-Reported
          </span>
        </div>

        <div className="rounded-lg bg-surface-container-low p-space-sm text-outline font-body-sm text-body-sm border border-white/5">
          Asserted by <span className="font-code-sm text-code-sm text-on-surface font-semibold">{record.workerName || record.workerId}</span> on {record.network || "Stellar Testnet"}.
        </div>

        {/* Claims List */}
        <div className="flex flex-col gap-space-sm">
          <span className="font-label-caps text-label-caps uppercase text-outline">
            Extracted Worker Statements
          </span>

          {claims.length > 0 ? (
            claims.map((c) => (
              <div key={c.id} className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-body-sm font-semibold text-on-surface">
                    {c.title || "Execution Statement"}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-semibold font-code-sm",
                      c.status === "CORROBORATED" && "bg-emerald-950/60 text-[#4ade80] border border-emerald-800/40",
                      c.status === "CONFLICT" && "bg-red-950/60 text-error border border-red-800/40",
                      c.status === "UNVERIFIED" && "bg-surface-variant text-secondary"
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="font-code-sm text-code-sm text-on-surface-variant leading-relaxed">
                  {c.statement}
                </p>
                {c.details && Object.keys(c.details).length > 0 && (
                  <div className="mt-1 pt-1 border-t border-white/5 flex flex-wrap gap-2 text-[11px] font-mono text-outline">
                    {Object.entries(c.details).map(([k, v]) => (
                      <span key={k}>
                        <span className="text-secondary">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-lg bg-surface-container text-xs text-on-surface-variant font-mono border border-white/5 leading-relaxed">
              {currentAttempt?.summary || "No individual sub-claims declared."}
            </div>
          )}
        </div>

        {/* Worker Info Footer */}
        <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between mt-auto border border-white/5 text-xs text-outline font-mono">
          <span>Worker: {record.workerId}</span>
          <span>Attempt #{record.currentAttempt}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: VERAOS INDEPENDENT GROUNDING */}
      <div className="xl:col-span-7 rounded-xl bg-surface-container-high p-space-md lg:p-space-lg shadow-xl relative overflow-hidden border border-white/10">
        <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold">
              VeraOS Independent Verification (GROUNDED)
            </span>
          </div>
          <span className="font-code-sm text-code-sm text-secondary font-mono">
            Consensus: {passedCount}/{totalCount || 1} invariants
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          Evaluated against {record.network || "Stellar Testnet"} ledger ground truth & deterministic verification kernel.
        </p>

        {/* Invariants Checklist */}
        <div className="flex flex-col gap-space-sm">
          {invariants.length > 0 ? (
            invariants.map((inv) => {
              const isPassed = inv.status === "PASSED";
              return (
                <div
                  key={inv.id}
                  className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-2 border border-white/5"
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-start gap-space-sm">
                      <span
                        className={cn(
                          "material-symbols-outlined text-[20px] mt-0.5",
                          isPassed ? "text-[#4ade80]" : "text-error"
                        )}
                      >
                        {isPassed ? "check_circle" : "cancel"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                            {inv.name}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded font-label-caps text-label-caps font-bold",
                              isPassed
                                ? "bg-[#22c55e]/20 text-[#4ade80]"
                                : "bg-error-container text-on-error-container"
                            )}
                          >
                            {inv.status}
                          </span>
                        </div>
                        {inv.description && (
                          <p className="font-body-sm text-body-sm text-outline mt-0.5">
                            {inv.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {inv.latencyMs && (
                      <span className="font-code-sm text-code-sm text-outline shrink-0">
                        {inv.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {/* Expected vs Observed Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-container-low p-2 rounded border border-white/5 text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-outline uppercase text-[10px]">Expected</span>
                      <span className="text-on-surface truncate font-semibold">{inv.expected || "Declared rule"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-outline uppercase text-[10px]">Observed</span>
                      <span className={cn("truncate font-semibold", isPassed ? "text-[#4ade80]" : "text-error")}>
                        {inv.actual || (isPassed ? "Corroborated" : "Deficit detected")}
                      </span>
                    </div>
                    {inv.delta && (
                      <div className="flex flex-col">
                        <span className="text-outline uppercase text-[10px]">Variance Delta</span>
                        <span className="text-secondary truncate">{inv.delta}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-lg bg-surface-container border border-white/5 text-xs text-on-surface-variant">
              {currentAttempt?.detailedReason || "Verification executed against deterministic rule engine."}
            </div>
          )}

          {/* Onchain Link if Tx exists */}
          {stellarTx && (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-outline font-mono truncate mr-2">
                Stellar Tx: {stellarTx}
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${stellarTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs font-semibold text-[#E08A3E] flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>View on Stellar Expert</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
