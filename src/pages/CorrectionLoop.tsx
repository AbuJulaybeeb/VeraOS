import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export const CorrectionLoop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { verification, loading, error, resubmit, isResubmitting } = useVerification(id);

  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number>(0);
  const [selectedProtocol, setSelectedProtocol] = useState("Aerodrome");
  const [supplementalAmount, setSupplementalAmount] = useState("4.5");
  const [customTxHash, setCustomTxHash] = useState("0x91cc4421b8fa012984fe9823901bca019");
  const [resubmittingStep, setResubmittingStep] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant max-w-7xl mx-auto">
        <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="font-code-sm text-code-sm">
          Loading correction loop state machine...
        </span>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-surface-container-low rounded-2xl border border-white/5">
        <h2 className="font-headline-md font-bold text-on-surface">
          Verification Not Found
        </h2>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const activeAttempt =
    verification.attempts[selectedAttemptIdx] ||
    verification.attempts[verification.attempts.length - 1];

  const handleResubmit = async () => {
    setResubmittingStep("Resubmitting remediation patch to agent...");
    await new Promise((r) => setTimeout(r, 600));

    setResubmittingStep("Re-running independent verification checks on Base...");
    await new Promise((r) => setTimeout(r, 700));

    await resubmit({
      target: selectedProtocol,
      supplementalAmount: parseFloat(supplementalAmount) || 4.5,
      txHash: customTxHash,
    });

    setResubmittingStep(null);
    setSelectedAttemptIdx(verification.attempts.length); // switch to newly created attempt
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
            <Link to="/dashboard" className="hover:text-on-surface transition-colors">
              Verifications
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link
              to={`/verify/${verification.id}`}
              className="text-secondary font-medium hover:underline"
            >
              {verification.displayId}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Autonomous Correction Loop</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Autonomous Remediation Loop
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            When verification fails, VeraOS synthesizes machine-readable remediation directives so the agent can self-correct and resubmit.
          </p>
        </div>

        <Link to={`/verify/${verification.id}`}>
          <Button variant="secondary">Back to Verification</Button>
        </Link>
      </div>

      {/* Attempt History Timeline Tabs */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-caps text-label-caps text-outline uppercase font-semibold mr-2">
            Attempts:
          </span>
          {verification.attempts.map((att, idx) => (
            <button
              key={att.attemptNumber}
              onClick={() => setSelectedAttemptIdx(idx)}
              className={`px-3 py-1.5 rounded-lg font-code-sm text-code-sm font-semibold flex items-center gap-2 border transition-all ${
                selectedAttemptIdx === idx
                  ? "bg-surface-container-high border-primary-container text-primary shadow-md"
                  : "bg-surface-container border-white/5 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Attempt {att.attemptNumber}</span>
              {att.status === "PASSED" ? (
                <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-error" />
              )}
            </button>
          ))}
        </div>

        <div className="font-code-sm text-code-sm text-outline">
          Max Retries: {verification.maxAttempts} Allowed
        </div>
      </div>

      {/* 4-Stage Architectural Flow Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-error/30 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-error uppercase font-bold">
            STAGE 1
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Deterministic Fail
          </h3>
          <p className="font-body-sm text-body-sm text-outline">
            VeraOS flags threshold deficits & missing transaction evidence.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-secondary/30 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
            STAGE 2
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            What Went Wrong
          </h3>
          <p className="font-body-sm text-body-sm text-outline">
            Exact delta calculation: -$1.75M TVL & -4.50 USDC deficit.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary-container/30 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
            STAGE 3
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            How To Fix It
          </h3>
          <p className="font-body-sm text-body-sm text-outline">
            Machine directives: Replace target + broadcast supplemental tx.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-[#22c55e]/30 flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-[#4ade80] uppercase font-bold">
            STAGE 4
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Resubmit & Pass
          </h3>
          <p className="font-body-sm text-body-sm text-outline">
            Stellar onchain ledger proof committed once invariants pass.
          </p>
        </div>
      </div>

      {/* Active Attempt Inspection Card */}
      <div className="rounded-2xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-2xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-space-sm border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Evaluation Record for Attempt #{activeAttempt.attemptNumber}
            </span>
            {activeAttempt.status === "PASSED" ? (
              <Badge variant="passed" dot>
                PASSED
              </Badge>
            ) : (
              <Badge variant="failed" dot>
                FAILED
              </Badge>
            )}
          </div>
          <span className="font-code-sm text-code-sm text-outline">
            Timestamp: {new Date(activeAttempt.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 flex flex-col gap-2">
          <span className="font-label-caps text-label-caps text-outline uppercase">
            Summary Reason
          </span>
          <p className="font-body-md text-body-md text-on-surface">
            {activeAttempt.detailedReason}
          </p>
          {activeAttempt.easUid && (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-code-sm">
              <span className="text-secondary font-medium">
                Stellar Transaction Proof:
              </span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${activeAttempt.easUid}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>{activeAttempt.easUid.slice(0, 16)}...</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        {/* Resubmission Configuration Playground */}
        {verification.status !== "PASSED" && (
          <div className="p-space-md rounded-xl bg-surface-container-low border border-primary-container/20 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">
                  tune
                </span>
                Agent Self-Correction Patch Directives
              </span>
              <span className="font-code-sm text-code-sm text-secondary">
                Auto-Remediation Form
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface font-medium">
                  Substitute Lending Protocol:
                </label>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
                >
                  <option value="Aerodrome">Aerodrome Finance ($214M TVL - Verified)</option>
                  <option value="Aave">Aave v3 Base ($64M TVL - Verified)</option>
                  <option value="Moonwell">Moonwell Scale ($45M TVL - Verified)</option>
                </select>
                <span className="text-[11px] text-outline">
                  Replaces Seamless Protocol ($8.2M) which fell short of the $10M threshold.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-body-sm text-on-surface font-medium">
                  Supplemental USDC Payout:
                </label>
                <input
                  type="text"
                  value={supplementalAmount}
                  onChange={(e) => setSupplementalAmount(e.target.value)}
                  placeholder="4.5"
                  className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
                />
                <span className="text-[11px] text-outline">
                  Initial transfer was 0.50 USDC. 4.50 USDC reconciles the exact 5.00 USDC invariant.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Supplemental Transaction Receipt Hash:
              </label>
              <input
                type="text"
                value={customTxHash}
                onChange={(e) => setCustomTxHash(e.target.value)}
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            {/* Resubmit CTA */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-white/5">
              <span className="font-code-sm text-code-sm text-outline">
                Will trigger Attempt #{verification.currentAttempt + 1}
              </span>

              <Button
                variant="primary"
                size="lg"
                loading={isResubmitting || resubmittingStep !== null}
                onClick={handleResubmit}
                icon={
                  <span className="material-symbols-outlined text-[20px]">
                    restart_alt
                  </span>
                }
              >
                {resubmittingStep || `Resubmit as Attempt ${verification.currentAttempt + 1}`}
              </Button>
            </div>
          </div>
        )}

        {/* If Passed */}
        {verification.status === "PASSED" && (
          <div className="p-6 rounded-xl bg-[#14291e]/60 border border-[#22c55e]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#4ade80] text-[32px]">
                task_alt
              </span>
              <div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-[#4ade80]">
                  Verification Cycle Resolved
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Remediation directives successfully satisfied all invariants on Attempt #{verification.currentAttempt}.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(`/verify/${verification.id}`)}
            >
              View Final Verification
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
