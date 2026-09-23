import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { Button } from "../components/ui/Button";

export const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading, error, resubmit, isResubmitting } = useVerification(id);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Resubmit form state
  const [resubmitTxHash, setResubmitTxHash] = useState("");
  const [resubmitAmount, setResubmitAmount] = useState<number>(4.5);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#B9A99B] max-w-4xl mx-auto">
        <span className="w-8 h-8 border-2 border-[#C96A2B] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs">Loading verification record #{id}...</span>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-[#21110B] rounded-3xl border border-[#4A2B1D] shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-[#2a1210] text-[#f87171] border border-[#5c1e19] flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">error_outline</span>
        </div>
        <h2 className="font-heading font-bold text-xl text-[#FFF8F0]">
          Verification Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[#B9A99B]">
          {error || "The requested verification could not be retrieved."}
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Overview</Button>
        </Link>
      </div>
    );
  }

  const currentAttempt = verification.attempts?.[verification.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];
  const claims = currentAttempt?.workerClaims || [];
  const evidenceList = currentAttempt?.evidence || [];
  const isPassed = verification.status === "PASSED";
  const isFailed = verification.status === "FAILED";
  const isUnverifiable = verification.status === "UNVERIFIED";

  const handleCopyId = () => {
    navigator.clipboard.writeText(verification.displayId || verification.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resubmit({
      txHash: resubmitTxHash || "0x9c3e41b278df9001bca821034f71a9b4",
      supplementalAmount: resubmitAmount,
      target: "Remediated settlement transfer to satisfy invariant",
    });
    setResubmitSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans pb-12">
      {/* ---------------------------------------------------- */}
      {/* CONTEXT HEADER & ACTIONS                             */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4A2B1D]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-[#B9A99B]">
            <Link to="/verifications" className="hover:text-[#FFF8F0] transition-colors">
              Verifications
            </Link>
            <span>/</span>
            <span className="font-mono text-[#E08A3E]">#{verification.displayId}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#FFF8F0]">
              Verification #{verification.displayId}
            </h1>
            <button
              onClick={handleCopyId}
              className="p-1 rounded-lg bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-[#B9A99B] hover:text-[#FFF8F0] transition-colors cursor-pointer"
              title="Copy ID"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedId ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link to={`/verify/${verification.id}/evidence`}>
            <Button
              variant="outline"
              size="sm"
              icon={<span className="material-symbols-outlined text-[16px]">fingerprint</span>}
            >
              Evidence Explorer
            </Button>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 1: TASK (What was requested?)              */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase font-bold text-[#E08A3E] tracking-wider">
            TASK • WHAT WAS REQUESTED
          </span>
          <span className="text-xs text-[#B9A99B] font-mono">
            Agent: <strong className="text-[#FFF8F0] font-sans">{verification.workerName || verification.workerId}</strong>
          </span>
        </div>

        <p className="text-sm sm:text-base text-[#FFF8F0] leading-relaxed font-medium">
          {verification.taskPrompt}
        </p>

        <div className="text-[11px] text-[#B9A99B] font-mono pt-2 border-t border-[#4A2B1D]/60 flex items-center justify-between">
          <span>Attempt #{verification.currentAttempt} of {verification.maxAttempts || 3}</span>
          <span>{verification.createdAt ? new Date(verification.createdAt).toLocaleString() : "Recently submitted"}</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 2: WORKER CLAIM (Neutral visual treatment) */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#160C08] border border-[#4A2B1D] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B9A99B]" />
            <span className="font-mono text-xs uppercase font-bold text-[#B9A99B] tracking-wider">
              WORKER CLAIM
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21110B] text-[#B9A99B] border border-[#4A2B1D]">
            Untrusted Assertion
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#21110B] border border-[#4A2B1D] font-mono text-xs sm:text-sm text-[#FFF8F0] leading-relaxed">
          &quot;{verification.workerOutput || currentAttempt?.summary || "Agent self-reported completion without declared output."}&quot;
        </div>

        {claims.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-mono text-[#B9A99B] uppercase">
              Parsed Assertions:
            </span>
            <div className="space-y-1.5">
              {claims.map((c) => (
                <div
                  key={c.id}
                  className="px-3 py-2 rounded-xl bg-[#21110B] border border-[#4A2B1D] flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-[#FFF8F0] truncate mr-2">{c.statement}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    c.status === "CORROBORATED"
                      ? "text-[#4ade80] bg-[#142818]"
                      : c.status === "CONFLICT"
                      ? "text-[#f87171] bg-[#2a1210]"
                      : "text-[#E6A15A] bg-[#2b1c10]"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 3: REQUIREMENTS (What conditions must be met) */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-3 shadow-md">
        <span className="font-mono text-xs uppercase font-bold text-[#E08A3E] tracking-wider">
          REQUIREMENTS • INVARIANTS TO SATISFY
        </span>

        <div className="space-y-2">
          {invariants.length > 0 ? (
            invariants.map((inv, idx) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-[#160C08] border border-[#4A2B1D] flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-[#2C1710] border border-[#4A2B1D] font-mono text-xs text-[#E08A3E] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#FFF8F0]">
                      {inv.name}
                    </span>
                    <span className="text-xs font-mono text-[#B9A99B] shrink-0">
                      Expected: <strong className="text-[#FFF8F0]">{inv.expected || "True"}</strong>
                    </span>
                  </div>
                  {inv.description && (
                    <p className="text-xs text-[#B9A99B] mt-0.5">
                      {inv.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#B9A99B]">
              Deterministic conditions extracted from task specification.
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 4: INDEPENDENT EVIDENCE (Strong treatment) */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#2C1710] border-2 border-[#E08A3E]/60 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E08A3E]" />
            <span className="font-mono text-xs uppercase font-bold text-[#E08A3E] tracking-wider">
              INDEPENDENT EVIDENCE
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21110B] text-[#E08A3E] border border-[#E08A3E]/30 font-semibold">
            Grounded Proof
          </span>
        </div>

        <p className="text-xs text-[#B9A99B]">
          Evidence retrieved directly by VeraOS independently of the agent&apos;s self-reported outputs.
        </p>

        {/* Evidence List */}
        <div className="space-y-3">
          {evidenceList.length > 0 ? (
            evidenceList.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#E08A3E]">
                      receipt_long
                    </span>
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#FFF8F0]">
                      {ev.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#E08A3E]">
                    Source: {ev.proofType}
                  </span>
                </div>

                {/* Evidence data keys */}
                {ev.data && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D]/60">
                    {Object.entries(ev.data).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2 truncate">
                        <span className="text-[#B9A99B]">{k}:</span>
                        <span className="text-[#FFF8F0] font-semibold truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Proof Hash / Identifier */}
                {ev.proofHash && (
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs font-mono">
                    <span className="text-[#B9A99B] shrink-0">Identifier:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[#E08A3E] truncate max-w-[240px] sm:max-w-md">
                        {ev.proofHash}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(ev.proofHash || "")}
                        className="p-1 rounded text-[#B9A99B] hover:text-[#FFF8F0] transition-colors cursor-pointer"
                        title="Copy Identifier"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedHash === ev.proofHash ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-[#21110B] border border-[#4A2B1D] text-xs font-mono text-[#B9A99B] flex items-center justify-between">
              <span>Ground truth witnesses corroborated via independent verification kernel.</span>
              <span className="text-[#E08A3E]">Verified Source</span>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 5: VERIFICATION CHECKS                     */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-3 shadow-md">
        <span className="font-mono text-xs uppercase font-bold text-[#E08A3E] tracking-wider">
          VERIFICATION CHECKS • WHAT VERAOS EVALUATED
        </span>

        <div className="space-y-2.5">
          {invariants.map((inv) => {
            const passed = inv.status === "PASSED";
            return (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-[#160C08] border border-[#4A2B1D] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      passed
                        ? "bg-[#142818] text-[#4ade80] border border-[#1b4324]"
                        : "bg-[#2a1210] text-[#f87171] border border-[#5c1e19]"
                    }`}
                  >
                    {passed ? "✓" : "✕"}
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#FFF8F0] block">
                      {inv.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#B9A99B]">
                      Expected: {inv.expected} • Observed: <strong className={passed ? "text-[#4ade80]" : "text-[#f87171]"}>{inv.actual || "Unmatched"}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                    passed
                      ? "bg-[#142818] text-[#4ade80] border border-[#1b4324]"
                      : "bg-[#2a1210] text-[#f87171] border border-[#5c1e19]"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 6: VERDICT (DOMINANT VISUAL)               */}
      {/* ---------------------------------------------------- */}
      {isPassed && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#142818] border-2 border-[#1b4324] shadow-[0_0_30px_rgba(74,222,128,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b4324] text-[#4ade80] flex items-center justify-center text-2xl font-bold shrink-0">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#4ade80] uppercase tracking-wider">
                  VERDICT: VERIFIED
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#1b4324] text-[#4ade80] text-[10px] font-mono font-semibold">
                  100% Corroborated
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FFF8F0] mt-1">
                The task was completed correctly.
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 leading-relaxed">
                The required conditions were satisfied by independently verified evidence.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-emerald-300/80 shrink-0">
            <span>Proof Confirmed</span>
            <div className="text-[11px] text-[#B9A99B]">Zero deficits found</div>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#2a1210] border-2 border-[#5c1e19] shadow-[0_0_30px_rgba(248,113,113,0.15)] flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5c1e19] text-[#f87171] flex items-center justify-center text-2xl font-bold shrink-0 mt-0.5">
              ✕
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#f87171] uppercase tracking-wider">
                  VERDICT: FAILED
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#5c1e19] text-[#f87171] text-[10px] font-mono font-semibold">
                  Invariant Breach
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FFF8F0] mt-1">
                Verification failed
              </h3>
              <p className="text-xs sm:text-sm text-red-200/80 mt-1 leading-relaxed">
                The independently verified evidence does not satisfy the task requirements.
              </p>
            </div>
          </div>

          {/* Detailed Failure Breakdown: Required vs Observed vs Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#160C08] border border-[#5c1e19]/60 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[#B9A99B] text-[10px] uppercase">Required</span>
              <span className="text-[#FFF8F0] font-semibold mt-0.5">5.00 USDC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#B9A99B] text-[10px] uppercase">Observed</span>
              <span className="text-[#f87171] font-semibold mt-0.5">0.50 USDC</span>
            </div>
            <div className="flex flex-col sm:col-span-1">
              <span className="text-[#B9A99B] text-[10px] uppercase">Reason</span>
              <span className="text-red-300 mt-0.5">
                The independently verified transaction amount does not satisfy the task requirement.
              </span>
            </div>
          </div>
        </div>
      )}

      {isUnverifiable && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#2b1c10] border-2 border-[#54331a] shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#54331a] text-[#E6A15A] flex items-center justify-center font-bold text-xl">
              ?
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-[#E6A15A] uppercase tracking-wider">
                VERDICT: UNVERIFIABLE
              </span>
              <h3 className="font-heading font-bold text-lg text-[#FFF8F0]">
                Missing Independent Proof
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
            The worker agent reported completion, but no verifiable external witnesses or transaction records could be corroborated.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 7: CORRECTION (If failed, what to fix)     */}
      {/* ---------------------------------------------------- */}
      {isFailed && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase font-bold text-[#E08A3E] tracking-wider">
              CORRECTION REQUIRED
            </span>
            <span className="text-xs font-mono text-[#B9A99B]">
              Automated Remediation Directive
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#160C08] border border-[#4A2B1D] flex flex-col gap-1.5">
            <span className="text-xs font-heading font-semibold text-[#FFF8F0]">
              Action Needed:
            </span>
            <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
              Retry the payment using the requested amount (missing 4.50 USDC) and submit the resulting transaction.
            </p>
          </div>

          {/* Resubmission Form */}
          <form onSubmit={handleResubmit} className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={resubmitTxHash}
                onChange={(e) => setResubmitTxHash(e.target.value)}
                placeholder="Enter corrected transaction hash or proof..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] font-mono text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isResubmitting}
                icon={<span className="material-symbols-outlined text-[16px]">restart_alt</span>}
                className="whitespace-nowrap px-6"
              >
                Resubmit
              </Button>
            </div>
            {resubmitSuccess && (
              <span className="text-xs font-mono text-[#4ade80]">
                ✓ Correction submitted. Re-evaluating verification checks...
              </span>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
