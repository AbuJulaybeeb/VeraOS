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
  onViewOracleProof,
  onViewExplorer,
}) => {
  const currentAttempt = record.attempts[record.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];
  const claims = currentAttempt?.workerClaims || [];

  const passedCount = invariants.filter((i) => i.status === "PASSED").length;
  const totalCount = invariants.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg mb-space-lg items-start">

      {/* LEFT — WORKER CLAIM */}
      <div className="xl:col-span-5 rounded-xl bg-surface-container-lowest p-space-md lg:p-space-lg shadow-sm border border-white/5 flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">smart_toy</span>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Worker Claim
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-code-sm text-code-sm">
            Unverified
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          What the agent reported. VeraOS does not trust this — it is checked against independent evidence below.
        </p>

        {/* Worker claims */}
        <div className="flex flex-col gap-2">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="p-3 rounded-lg bg-surface-container border border-white/5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface text-[13px]">
                    {claim.title}
                  </span>
                  <span
                    className={cn(
                      "font-code-sm text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
                      claim.status === "CORROBORATED"
                        ? "text-[#4ade80] bg-[#4ade80]/10"
                        : claim.status === "CONFLICT"
                        ? "text-error bg-error/10"
                        : "text-outline bg-surface-container-high"
                    )}
                  >
                    {claim.status}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {claim.statement}
                </p>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-lg bg-surface-container text-on-surface-variant font-body-sm text-body-sm border border-white/5">
              No explicit claims recorded in worker output.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — VERAOS INDEPENDENT VERIFICATION */}
      <div className="xl:col-span-7 rounded-xl bg-surface-container-high p-space-md lg:p-space-lg shadow-xl relative overflow-hidden border border-white/10">
        <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold">
              Independent Verification
            </span>
          </div>
          <span className="font-code-sm text-code-sm text-secondary font-mono">
            {passedCount}/{totalCount} passed
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          Each requirement checked against Stellar Horizon and independent oracles — not the worker's word.
        </p>

        {/* Invariant checklist — driven entirely by real data */}
        <div className="flex flex-col gap-space-sm">
          {invariants.length > 0 ? (
            invariants.map((inv) => (
              <div
                key={inv.id}
                className="p-space-sm rounded-lg bg-surface-container border border-white/5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={cn(
                        "material-symbols-outlined text-[18px] mt-0.5 shrink-0",
                        inv.status === "PASSED"
                          ? "text-[#4ade80]"
                          : inv.status === "FAILED"
                          ? "text-error"
                          : "text-outline"
                      )}
                    >
                      {inv.status === "PASSED"
                        ? "check_circle"
                        : inv.status === "FAILED"
                        ? "cancel"
                        : "help"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-headline-sm text-headline-sm font-semibold text-on-surface text-[13px] leading-snug">
                        {inv.name}
                      </p>
                      {inv.description && (
                        <p className="font-body-sm text-body-sm text-outline mt-0.5 text-[11px]">
                          {inv.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold uppercase shrink-0 text-[10px]",
                      inv.status === "PASSED"
                        ? "bg-[#22c55e]/20 text-[#4ade80]"
                        : inv.status === "FAILED"
                        ? "bg-error/20 text-error"
                        : "bg-surface-container text-outline"
                    )}
                  >
                    {inv.status}
                  </span>
                </div>

                {/* Expected vs Actual */}
                {(inv.expected || inv.actual) && (
                  <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest p-2 rounded border border-white/5 font-code-sm text-code-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline text-[10px] uppercase">Expected</span>
                      <span className="text-on-surface truncate">{inv.expected ?? "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-outline text-[10px] uppercase">Observed</span>
                      <span
                        className={cn(
                          "truncate font-semibold",
                          inv.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                        )}
                      >
                        {inv.actual ?? "—"}
                      </span>
                    </div>
                    {inv.delta && (
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <span className="text-outline text-[10px] uppercase">Delta</span>
                        <span className="text-error font-semibold">{inv.delta}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Oracle proof / Stellar explorer links */}
                {inv.oracleProof && (
                  <button
                    onClick={onViewOracleProof}
                    className="self-start px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-code-sm text-code-sm flex items-center gap-1 transition-colors border border-white/5"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    <span>View Oracle Proof</span>
                  </button>
                )}

                {inv.category === "payment" && (
                  <button
                    onClick={onViewExplorer}
                    className="self-start px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[#E08A3E] font-code-sm text-code-sm flex items-center gap-1 transition-colors border border-[#4A2B1D]"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    <span>View on Stellar Explorer</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-space-md rounded-lg bg-surface-container text-on-surface-variant font-body-sm text-body-sm border border-white/5">
              No verification requirements extracted from this task.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
