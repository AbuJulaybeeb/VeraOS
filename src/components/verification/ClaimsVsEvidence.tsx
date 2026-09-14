import React from "react";
import { VerificationRecord } from "../../types/verification";
import { cn } from "../../lib/utils";

interface ClaimsVsEvidenceProps {
  record: VerificationRecord;
  onViewOracleProof?: () => void;
  onViewBaseScan?: () => void;
}

export const ClaimsVsEvidence: React.FC<ClaimsVsEvidenceProps> = ({
  record,
  onViewOracleProof,
  onViewBaseScan,
}) => {
  const currentAttempt = record.attempts[record.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];
  const claims = currentAttempt?.workerClaims || [];

  const passedCount = invariants.filter((i) => i.status === "PASSED").length;
  const totalCount = invariants.length;

  const inv4 = invariants.find((i) => i.id === "inv_lending_tvl") || invariants[3];
  const inv5 = invariants.find((i) => i.id === "inv_usdc_payment") || invariants[4];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg mb-space-lg items-start">
      {/* LEFT COLUMN: WORKER AGENT SUBMISSION (CLAIM) */}
      <div className="xl:col-span-5 rounded-xl bg-surface-container-lowest p-space-md lg:p-space-lg shadow-sm border border-white/5 flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[18px]">
              warning
            </span>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-semibold">
              Worker Agent Submission (Claim)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-code-sm text-code-sm">
            Self-Reported
          </span>
        </div>

        <div className="rounded-lg bg-surface-container-low p-space-sm text-outline font-body-sm text-body-sm border border-white/5">
          Asserted by agent payload{" "}
          <span className="font-code-sm text-code-sm text-on-surface">
            payload_run_0x44fa
          </span>{" "}
          without zero-knowledge boundary enforcement.
        </div>

        {/* Claimed Protocols Breakdown */}
        <div className="flex flex-col gap-space-sm">
          <span className="font-label-caps text-label-caps uppercase text-outline">
            Submitted Targets
          </span>

          <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-outline" />
              <div>
                <p className="font-body-md text-body-md font-medium text-on-surface">
                  {record.currentAttempt >= 2 ? "Aerodrome Finance" : "Seamless Protocol"}
                </p>
                <p className="font-code-sm text-code-sm text-outline">
                  Reported TVL: {record.currentAttempt >= 2 ? "$214.0M" : "$12.0M"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "font-code-sm text-code-sm font-semibold",
                record.currentAttempt >= 2 ? "text-[#4ade80]" : "text-error"
              )}
            >
              {record.currentAttempt >= 2 ? "Corroborated" : "Conflict Detected"}
            </span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-outline" />
              <div>
                <p className="font-body-md text-body-md font-medium text-on-surface">
                  Moonwell
                </p>
                <p className="font-code-sm text-code-sm text-outline">
                  Reported TVL: $45.0M
                </p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-[#4ade80] font-semibold">
              Corroborated
            </span>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-outline" />
              <div>
                <p className="font-body-md text-body-md font-medium text-on-surface">
                  Overnight Finance
                </p>
                <p className="font-code-sm text-code-sm text-outline">
                  Reported TVL: $12.0M
                </p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-[#4ade80] font-semibold">
              Corroborated
            </span>
          </div>
        </div>

        {/* Claimed Payment Transaction */}
        <div className="flex flex-col gap-space-xs mt-2">
          <span className="font-label-caps text-label-caps uppercase text-outline">
            Submitted Compensation Proof
          </span>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-1 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface font-medium">
                Claimed Amount: 5.0 USDC
              </span>
              <span
                className={cn(
                  "font-code-sm text-code-sm font-medium",
                  record.currentAttempt >= 2 ? "text-[#4ade80]" : "text-error"
                )}
              >
                {record.currentAttempt >= 2 ? "Reconciled" : "Decimal Mismatch"}
              </span>
            </div>
            <div className="flex items-center gap-1 font-code-sm text-code-sm text-outline truncate">
              <span>Tx:</span>
              <span className="text-on-surface-variant truncate font-mono">
                0x8a7b3c21a4de99f2b1892f3900a41cd
              </span>
            </div>
          </div>
        </div>

        {/* Additional Claims (if any) */}
        {claims.length > 2 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            {claims.slice(2).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded bg-surface-container-low text-code-sm border border-white/5"
              >
                <span className="text-secondary font-medium">{c.title}: </span>
                <span className="text-on-surface-variant">{c.statement}</span>
              </div>
            ))}
          </div>
        )}

        {/* Agent Latency / Token Consumption Meter */}
        <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between mt-auto border border-white/5">
          <span className="font-code-sm text-code-sm text-outline">
            Execution: 1,420 tokens (4.2s)
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Model: gpt-4o-mini
          </span>
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
            Consensus: {passedCount}/{totalCount} invariants
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          Evaluated against Base blockchain JSON-RPC node & DefiLlama
          cryptographically notarized TLS oracle feed.
        </p>

        {/* Checklist Items */}
        <div className="flex flex-col gap-space-sm">
          {/* Invariant 1 */}
          <div className="p-space-sm rounded-lg bg-surface-container flex items-start justify-between gap-space-sm hover:bg-surface-container-highest transition-colors border border-white/5">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[#4ade80] text-[20px] mt-0.5">
                check_circle
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-medium text-on-surface">
                    Invariant 1: Cardinality (3 Protocols)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-variant text-[#4ade80] font-label-caps text-label-caps">
                    PASSED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Evidence: Parsed 3 valid protocol objects:{" "}
                  {record.currentAttempt >= 2 ? "Aerodrome" : "Seamless"}, Moonwell, Overnight.
                </p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-outline shrink-0">
              12ms
            </span>
          </div>

          {/* Invariant 2 */}
          <div className="p-space-sm rounded-lg bg-surface-container flex items-start justify-between gap-space-sm hover:bg-surface-container-highest transition-colors border border-white/5">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[#4ade80] text-[20px] mt-0.5">
                check_circle
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-medium text-on-surface">
                    Invariant 2: Ecosystem L2 Conformance
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-variant text-[#4ade80] font-label-caps text-label-caps">
                    PASSED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Evidence: Verified canonical contract bytecode registered on Base chain ID 8453.
                </p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-outline shrink-0">
              28ms
            </span>
          </div>

          {/* Invariant 3 */}
          <div className="p-space-sm rounded-lg bg-surface-container flex items-start justify-between gap-space-sm hover:bg-surface-container-highest transition-colors border border-white/5">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[#4ade80] text-[20px] mt-0.5">
                check_circle
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-medium text-on-surface">
                    Invariant 3: Lending Category Classification
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-variant text-[#4ade80] font-label-caps text-label-caps">
                    PASSED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                  Evidence: Oracle ontology registers all 3 protocols under taxonomy{" "}
                  <code className="text-primary-fixed">defi.lending_market</code>.
                </p>
              </div>
            </div>
            <span className="font-code-sm text-code-sm text-outline shrink-0">
              44ms
            </span>
          </div>

          {/* Invariant 4: TVL Threshold (Failed or Passed) */}
          <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-md flex flex-col gap-space-sm border border-white/5">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px] mt-0.5",
                    inv4?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv4?.status === "PASSED" ? "check_circle" : "cancel"}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "font-headline-sm text-headline-sm font-semibold",
                        inv4?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                      )}
                    >
                      Invariant 4: TVL Threshold Minimum (≥ $10,000,000)
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded font-label-caps text-label-caps font-bold",
                        inv4?.status === "PASSED"
                          ? "bg-[#22c55e]/20 text-[#4ade80]"
                          : "bg-error-container text-on-error-container"
                      )}
                    >
                      {inv4?.status === "PASSED" ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {inv4?.description ||
                      "Independent Oracle verification of protocol liquidity values."}
                  </p>
                </div>
              </div>

              <button
                onClick={onViewOracleProof}
                className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary-fixed font-code-sm text-code-sm flex items-center gap-1 transition-colors shrink-0"
              >
                <span>View Oracle Proof</span>
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </button>
            </div>

            {/* TVL Diff Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-2 rounded border border-white/5">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Claimed
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                  {record.currentAttempt >= 2 ? "$214,000,000" : "$12,000,000"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  DefiLlama Oracle
                </span>
                <span
                  className={cn(
                    "font-code-sm text-code-sm font-bold",
                    inv4?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv4?.actual || (record.currentAttempt >= 2 ? "$214,200,000" : "$8,241,900")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Required Invariant
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                  &gt; $10,000,000
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-label-caps text-label-caps uppercase",
                    inv4?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  Variance Delta
                </span>
                <span
                  className={cn(
                    "font-code-sm text-code-sm font-bold",
                    inv4?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv4?.delta || (record.currentAttempt >= 2 ? "+$204,200,000" : "- $1,758,100")}
                </span>
              </div>
            </div>
          </div>

          {/* Invariant 5: Accurate Compensation Transfer */}
          <div className="p-space-sm rounded-lg bg-surface-container-lowest shadow-md flex flex-col gap-space-sm border border-white/5">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-sm">
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px] mt-0.5",
                    inv5?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv5?.status === "PASSED" ? "check_circle" : "cancel"}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "font-headline-sm text-headline-sm font-semibold",
                        inv5?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                      )}
                    >
                      Invariant 5: Accurate Compensation Transfer (5.00 USDC)
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded font-label-caps text-label-caps font-bold",
                        inv5?.status === "PASSED"
                          ? "bg-[#22c55e]/20 text-[#4ade80]"
                          : "bg-error-container text-on-error-container"
                      )}
                    >
                      {inv5?.status === "PASSED" ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {inv5?.description ||
                      "Decimal conversion check: verified against ERC-20 transfer event logs."}
                  </p>
                </div>
              </div>

              <button
                onClick={onViewBaseScan}
                className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary-fixed font-code-sm text-code-sm flex items-center gap-1 transition-colors shrink-0"
              >
                <span>View on BaseScan</span>
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
              </button>
            </div>

            {/* Payment Diff Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-2 rounded border border-white/5">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Agent Asserted
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                  5.000000 USDC
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Onchain Log Value
                </span>
                <span
                  className={cn(
                    "font-code-sm text-code-sm font-bold",
                    inv5?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv5?.actual || (record.currentAttempt >= 2 ? "5.000000 USDC" : "0.500000 USDC")}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  Required Amount
                </span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                  5.000000 USDC
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-label-caps text-label-caps uppercase",
                    inv5?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  Capital Deficit
                </span>
                <span
                  className={cn(
                    "font-code-sm text-code-sm font-bold",
                    inv5?.status === "PASSED" ? "text-[#4ade80]" : "text-error"
                  )}
                >
                  {inv5?.delta || (record.currentAttempt >= 2 ? "0.00 USDC (Reconciled)" : "- 4.500000 USDC")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
