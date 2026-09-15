import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    label: "Receiving worker output trace",
    detail: "Ingesting raw agent payload into sandboxed parsing sandbox...",
  },
  {
    id: 2,
    label: "Extracting formal requirements & invariants",
    detail: "Deconstructing prompt into numerical bounds, cardinality, and transfer rules...",
  },
  {
    id: 3,
    label: "Parsing worker assertions & claimed artifacts",
    detail: "Isolating claimed transaction hashes, recipient addresses, and TVL metrics...",
  },
  {
    id: 4,
    label: "Running independent verification checks",
    detail: "Querying Stellar Horizon testnet ledger & Soroban RPC cluster...",
  },
  {
    id: 5,
    label: "Synthesizing deterministic verdict & ledger receipt",
    detail: "Comparing claims vs independent evidence and assembling audit record...",
  },
];

export const VerificationProcessing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { verification } = useVerification(id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progress through steps smoothly
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (id) navigate(`/verify/${id}`);
          }, 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [id, navigate]);

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center py-12">
      <div className="w-full rounded-2xl bg-surface-container-high/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-space-lg flex flex-col gap-space-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-primary-container animate-ping" />
            <div>
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                VERIFICATION PIPELINE ACTIVE
              </span>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Evaluating {verification?.displayId || "Verification"}
              </h2>
            </div>
          </div>
          <span className="font-code-sm text-code-sm text-outline">
            Step {Math.min(currentStepIndex + 1, STEPS.length)} of {STEPS.length}
          </span>
        </div>

        {/* Task prompt reminder */}
        {verification && (
          <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 font-code-sm text-code-sm text-primary-fixed-dim truncate">
            <span className="text-outline">TASK &gt; </span>
            {verification.taskPrompt}
          </div>
        )}

        {/* Stepper List */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isCurrent
                    ? "bg-surface-container border-primary-container/40 shadow-md"
                    : isCompleted
                    ? "bg-surface-container-low/60 border-white/5 opacity-80"
                    : "bg-surface-container-lowest/40 border-white/5 opacity-40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[#4ade80] text-[20px]">
                        check_circle
                      </span>
                    ) : isCurrent ? (
                      <span className="w-5 h-5 rounded-full border-2 border-primary-container border-t-transparent animate-spin inline-block" />
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-outline flex items-center justify-center font-code-sm text-[10px] text-outline">
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-headline-sm text-headline-sm font-semibold ${
                        isCurrent
                          ? "text-primary"
                          : isCompleted
                          ? "text-on-surface"
                          : "text-outline"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                      {isCurrent ? step.detail : isCompleted ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 font-code-sm text-[11px] text-outline">
                  {isCompleted && (
                    <span className="text-[#4ade80] font-mono">✓ Done</span>
                  )}
                  {isCurrent && (
                    <span className="text-secondary font-mono">Running...</span>
                  )}
                  {isPending && <span className="font-mono">○ Waiting</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-lowest rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container via-secondary to-[#4ade80] transition-all duration-500 rounded-full"
            style={{
              width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
