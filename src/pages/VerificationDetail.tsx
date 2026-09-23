import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

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
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6B635B] max-w-4xl mx-auto">
        <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs">Loading verification record #{id}...</span>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E4DC] shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">error_outline</span>
        </div>
        <h2 className="font-heading font-bold text-xl text-[#191513]">
          Verification Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[#6B635B]">
          {error || "The requested verification could not be retrieved."}
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-[#181311] text-white text-xs font-semibold"
        >
          Return to Overview
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-[#6B635B]">
            <Link to="/verifications" className="hover:text-[#191513] transition-colors">
              Verifications
            </Link>
            <span>/</span>
            <span className="font-mono text-[#D97736]">#{verification.displayId}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
              Verification #{verification.displayId}
            </h1>
            <button
              onClick={handleCopyId}
              className="p-1 rounded-lg bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#6B635B] hover:text-[#191513] transition-colors cursor-pointer"
              title="Copy ID"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedId ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to={`/verify/${verification.id}/evidence`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#181311] text-xs font-semibold text-[#191513] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#6B635B]">fingerprint</span>
            <span>Evidence Explorer</span>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 1: TASK (What was requested?)              */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase font-bold text-[#D97736] tracking-wider">
            TASK â€¢ WHAT WAS REQUESTED
          </span>
          <span className="text-xs text-[#6B635B] font-mono">
            Agent: <strong className="text-[#191513] font-sans">{verification.workerName || verification.workerId}</strong>
          </span>
        </div>

        <p className="text-sm sm:text-base text-[#191513] leading-relaxed font-medium">
          {verification.taskPrompt}
        </p>

        <div className="text-[11px] text-[#6B635B] font-mono pt-2 border-t border-[#E8E4DC] flex items-center justify-between">
          <span>Attempt #{verification.currentAttempt} of {verification.maxAttempts || 3}</span>
          <span>{verification.createdAt ? new Date(verification.createdAt).toLocaleString() : "Recently submitted"}</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 2: WORKER CLAIM                            */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6B635B]" />
            <span className="font-mono text-xs uppercase font-bold text-[#6B635B] tracking-wider">
              WORKER CLAIM
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] text-[#6B635B] border border-[#E8E4DC]">
            Untrusted Assertion
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] font-mono text-xs sm:text-sm text-[#191513] leading-relaxed">
          &quot;{verification.workerOutput || currentAttempt?.summary || "Agent self-reported completion without declared output."}&quot;
        </div>

        {claims.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[11px] font-mono text-[#6B635B] uppercase">
              Parsed Assertions:
            </span>
            <div className="space-y-1.5">
              {claims.map((c) => (
                <div
                  key={c.id}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-[#191513] truncate mr-2">{c.statement}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      c.status === "CORROBORATED"
                        ? "text-[#1D7A46] bg-[#EAF5EE] border border-[#CDE5D5]"
                        : c.status === "CONFLICT"
                        ? "text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA]"
                        : "text-[#B8621B] bg-[#FEF5EB] border border-[#FADCC4]"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 3: REQUIREMENTS                            */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col gap-3 shadow-sm">
        <span className="font-mono text-xs uppercase font-bold text-[#D97736] tracking-wider">
          REQUIREMENTS â€¢ INVARIANTS TO SATISFY
        </span>

        <div className="space-y-2">
          {invariants.length > 0 ? (
            invariants.map((inv, idx) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-white border border-[#E8E4DC] font-mono text-xs text-[#D97736] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#191513]">
                      {inv.name}
                    </span>
                    <span className="text-xs font-mono text-[#6B635B] shrink-0">
                      Expected: <strong className="text-[#191513]">{inv.expected || "True"}</strong>
                    </span>
                  </div>
                  {inv.description && (
                    <p className="text-xs text-[#6B635B] mt-0.5">
                      {inv.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-[#6B635B]">
              Deterministic conditions extracted from task specification.
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 4: INDEPENDENT EVIDENCE                    */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#D97736] flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
            <span className="font-mono text-xs uppercase font-bold text-[#D97736] tracking-wider">
              INDEPENDENT EVIDENCE
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] font-semibold">
            Grounded Proof
          </span>
        </div>

        <p className="text-xs text-[#6B635B]">
          Evidence retrieved directly by VeraOS independently of the agent&apos;s self-reported outputs.
        </p>

        {/* Evidence List */}
        <div className="space-y-3">
          {evidenceList.length > 0 ? (
            evidenceList.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex flex-col gap-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#D97736]">
                      receipt_long
                    </span>
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#191513]">
                      {ev.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#D97736]">
                    Source: {ev.proofType}
                  </span>
                </div>

                {ev.data && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-xl bg-white border border-[#E8E4DC]">
                    {Object.entries(ev.data).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-2 truncate">
                        <span className="text-[#6B635B]">{k}:</span>
                        <span className="text-[#191513] font-semibold truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {ev.proofHash && (
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs font-mono">
                    <span className="text-[#6B635B] shrink-0">Identifier:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[#D97736] truncate max-w-[240px] sm:max-w-md">
                        {ev.proofHash}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyHash(ev.proofHash || "")}
                        className="p-1 rounded text-[#6B635B] hover:text-[#191513] transition-colors cursor-pointer"
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
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs font-mono text-[#6B635B] flex items-center justify-between">
              <span>Ground truth witnesses corroborated via independent verification kernel.</span>
              <span className="text-[#D97736]">Verified Source</span>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HIERARCHY 5: VERIFICATION CHECKS                     */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col gap-3 shadow-sm">
        <span className="font-mono text-xs uppercase font-bold text-[#D97736] tracking-wider">
          VERIFICATION CHECKS â€¢ WHAT VERAOS EVALUATED
        </span>

        <div className="space-y-2.5">
          {invariants.map((inv) => {
            const passed = inv.status === "PASSED";
            return (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      passed
                        ? "bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]"
                        : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                    }`}
                  >
                    {passed ? "âœ“" : "âœ•"}
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#191513] block">
                      {inv.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B635B]">
                      Expected: {inv.expected} â€¢ Observed: <strong className={passed ? "text-[#1D7A46]" : "text-[#DC2626]"}>{inv.actual || "Unmatched"}</strong>
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full self-start sm:self-auto ${
                    passed
                      ? "bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]"
                      : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
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
      {/* HIERARCHY 6: VERDICT                                 */}
      {/* ---------------------------------------------------- */}
      {isPassed && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#EAF5EE] border-2 border-[#CDE5D5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1D7A46] text-white flex items-center justify-center text-2xl font-bold shrink-0">
              âœ“
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1D7A46] uppercase tracking-wider">
                  VERDICT: VERIFIED
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-[#1D7A46] text-[10px] font-mono font-semibold border border-[#CDE5D5]">
                  100% Corroborated
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#191513] mt-1">
                The task was completed correctly.
              </h3>
              <p className="text-xs sm:text-sm text-[#1D7A46]/90 mt-1 leading-relaxed">
                The required conditions were satisfied by independently verified evidence.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-[#1D7A46] shrink-0">
            <span>Proof Confirmed</span>
            <div className="text-[11px] text-[#6B635B]">Zero deficits found</div>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FEF2F2] border-2 border-[#FECACA] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center text-2xl font-bold shrink-0">
              âœ•
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                  VERDICT: FAILED
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#191513] mt-1">
                Discrepancy detected in task execution.
              </h3>
              <p className="text-xs sm:text-sm text-[#DC2626]/90 mt-1 leading-relaxed">
                One or more requirements failed independent verification.
              </p>
            </div>
          </div>

          <Link
            to={`/verify/${verification.id}/correction`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-heading font-semibold text-xs shadow-sm transition-all shrink-0"
          >
            <span>Resolve & Remediate</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {isUnverifiable && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FEF5EB] border-2 border-[#FADCC4] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#B8621B] text-white flex items-center justify-center text-2xl font-bold shrink-0">
              ?
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-[#B8621B] uppercase tracking-wider">
                VERDICT: UNVERIFIABLE
              </span>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-[#191513] mt-1">
                Insufficient evidence to determine verdict.
              </h3>
              <p className="text-xs sm:text-sm text-[#B8621B]/90 mt-1 leading-relaxed">
                Required external sources or audit logs could not be reached.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
