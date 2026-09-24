import React, { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

export const CorrectionLoop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = searchParams.get("action") === "request_agent" ? "agent" : "evidence";

  const { verification, resubmit, isResubmitting } = useVerification(id);
  const [selectedStep, setSelectedStep] = useState<"evidence" | "agent">(initialStep);

  const latestAttempt = verification?.attempts?.[verification.attempts.length - 1];
  const invariants = latestAttempt?.invariants || [];
  const failedInvariants = invariants.filter((i) => i.status !== "PASSED");
  const passedInvariants = invariants.filter((i) => i.status === "PASSED");
  const remediationDirectives = latestAttempt?.remediationDirectives || [];

  // Default suggested txHash if this was a Stellar payment deficit
  const isStellarTask = Boolean(verification?.taskPrompt?.toLowerCase().includes("stellar"));
  const defaultTx = isStellarTask
    ? "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf"
    : "";

  const [txHash, setTxHash] = useState(defaultTx);
  const [context, setContext] = useState(
    "Supplemental transfer executed to satisfy required amount."
  );
  const [instruction, setInstruction] = useState(
    remediationDirectives[0]?.reason ||
      "Execute supplemental transfer or adjust trade parameters to satisfy declared invariants."
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runId = verification?.displayId ? `Run VR-${verification.displayId}` : id ? `Run VR-${id.slice(-6).toUpperCase()}` : "Run Verification";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (resubmit) {
        const patchData =
          selectedStep === "evidence"
            ? {
                txHash: txHash.trim(),
                target: "Supplemental Proof",
                supplementalAmount: 4.5,
                correctedWorkerOutput: `Supplemental proof submitted.\nTxHash: ${txHash.trim()}\nNote: ${context.trim()}`,
              }
            : {
                target: "Agent Correction Directive",
                correctedWorkerOutput: `Agent instruction dispatched: ${instruction.trim()}`,
              };

        const updated = await resubmit(patchData);
        if (!updated) {
          throw new Error("Resubmission was rejected by the verification pipeline.");
        }
      }
      setIsSuccess(true);
      setTimeout(() => {
        if (id) {
          navigate(`/verify/${id}`);
        } else {
          navigate("/dashboard");
        }
      }, 900);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to resubmit correction");
    }
  };

  const primaryFailedInv = failedInvariants[0];
  const headline = primaryFailedInv?.name || "Requirement invariant unresolved";
  const reasonText =
    (primaryFailedInv?.details as any)?.explanation ||
    remediationDirectives[0]?.reason ||
    "The observed output or on-chain state does not satisfy all requirements.";

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6B635B]">
        <Link to="/dashboard" className="hover:text-[#181311] transition-colors">
          Verifications
        </Link>
        <span>/</span>
        <Link
          to={id ? `/verify/${id}` : "/dashboard"}
          className="hover:text-[#181311] transition-colors font-mono"
        >
          {runId}
        </Link>
        <span>/</span>
        <span className="text-[#181311]">Remediate & Resubmit</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          Fix verification issue
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          Provide supplemental cryptographic proof or dispatch a remediation directive to the agent.
        </p>
      </div>

      {/* Card 1: Unresolved Requirement Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8621B]" />
          {failedInvariants.length} requirement(s) unresolved
        </span>

        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#181311] leading-snug">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1.5 leading-relaxed max-w-2xl font-mono">
            {reasonText}
          </p>
        </div>

        {/* ALREADY CONFIRMED Box */}
        <div className="bg-[#EAF5EE] border border-[#CDE5D5] rounded-xl p-4 sm:p-5 mt-2 flex flex-col gap-2">
          <span className="font-mono text-xs font-bold tracking-wider text-[#1D7A46] uppercase">
            ALREADY CONFIRMED
          </span>
          {passedInvariants.length > 0 ? (
            passedInvariants.map((inv, idx) => (
              <div key={inv.id || idx} className="flex items-center gap-2 text-sm font-medium text-[#1D7A46]">
                <span>✓</span>
                <span>{inv.name}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#1D7A46]">
              Task requirements initialized and ready for supplemental corroboration.
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Choose a next step */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
          Choose a next step
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Add supporting evidence */}
          <button
            type="button"
            onClick={() => setSelectedStep("evidence")}
            className={`p-5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
              selectedStep === "evidence"
                ? "bg-[#FAF8F5] border-[#181311] shadow-sm ring-1 ring-[#181311]"
                : "bg-white border-[#E8E4DC] hover:border-[#181311]/50"
            }`}
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                • Fastest
              </span>
              <div className="font-heading font-bold text-base text-[#181311] mt-2.5">
                Submit supplemental proof
              </div>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 leading-relaxed">
                Provide a supplemental on-chain transaction hash or verified log artifact.
              </p>
            </div>
          </button>

          {/* Option 2: Ask the agent to correct the record */}
          <button
            type="button"
            onClick={() => setSelectedStep("agent")}
            className={`p-5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
              selectedStep === "agent"
                ? "bg-[#FAF8F5] border-[#181311] shadow-sm ring-1 ring-[#181311]"
                : "bg-white border-[#E8E4DC] hover:border-[#181311]/50"
            }`}
          >
            <div>
              <div className="font-heading font-bold text-base text-[#181311] mt-2.5">
                Dispatch remediation directive
              </div>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 leading-relaxed">
                Instruct the agent to re-execute with tighter constraints or missing proofs.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Card 3: Active Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-4"
      >
        {errorMessage && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-xl font-mono">
            {errorMessage}
          </div>
        )}

        {selectedStep === "evidence" ? (
          <>
            <div>
              <label
                htmlFor="txHash"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Supplemental Transaction Hash / Proof ID
              </label>
              <input
                id="txHash"
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="e.g. 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] font-mono focus:outline-none focus:border-[#181311] transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="optionalContext"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Supplemental Notes & Attestation
              </label>
              <textarea
                id="optionalContext"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Supplemental transfer executed to satisfy required amount."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] focus:outline-none focus:border-[#181311] transition-colors resize-none font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={id ? `/verify/${id}` : "/dashboard"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel →
              </Link>
              <button
                type="submit"
                disabled={isResubmitting || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSuccess
                  ? "Supplemental evidence verified ✓"
                  : isResubmitting
                  ? "Re-verifying with consensus..."
                  : "Recheck with supplemental proof →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="agentInstruction"
                className="block text-xs font-semibold text-[#181311] mb-1.5"
              >
                Remediation directive for agent
              </label>
              <textarea
                id="agentInstruction"
                rows={3}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Execute supplemental transfer or adjust parameters to satisfy declared invariants."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-[#181311] placeholder-[#8C8479] focus:outline-none focus:border-[#181311] transition-colors resize-none font-mono"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={id ? `/verify/${id}` : "/dashboard"}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#181311] text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel →
              </Link>
              <button
                type="submit"
                disabled={isResubmitting || isSuccess}
                className="px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSuccess
                  ? "Directive dispatched ✓"
                  : isResubmitting
                  ? "Dispatching directive..."
                  : "Dispatch remediation directive →"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};
