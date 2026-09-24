import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

export const VerificationProcessing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { verification } = useVerification(id);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [progress, setProgress] = useState(25);

  const isResolved =
    Boolean(verification && verification.status && verification.status !== "PENDING" && verification.status !== "RUNNING");

  // Timer for elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Smooth progress increment and auto-redirect
  useEffect(() => {
    if (isResolved) {
      setProgress(100);
      const redirectTimer = setTimeout(() => {
        if (id) navigate(`/verify/${id}`);
      }, 700);
      return () => clearTimeout(redirectTimer);
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 5;
        return prev;
      });
    }, 300);

    return () => clearInterval(progressTimer);
  }, [isResolved, id, navigate]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")} elapsed`;
  };

  const runId = verification?.displayId ? `Run VR-${verification.displayId}` : id ? `Run VR-${id.slice(-6).toUpperCase()}` : "Run Verification";
  const agentName = verification?.workerName || "Autonomous Agent";
  const headline = verification?.taskPrompt || "Reviewing agent execution against invariants";

  // Derive stage completion based on real attempt data
  const latestAttempt = verification?.attempts?.[verification.attempts.length - 1];
  const invariants = latestAttempt?.invariants || [];
  const hasEvidence = Boolean(latestAttempt?.evidence && latestAttempt.evidence.length > 0);
  const hasRequirements = Boolean(invariants.length > 0);

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 font-sans pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6B635B] mb-2">
          <Link to="/dashboard" className="hover:text-[#181311] transition-colors">
            Overview
          </Link>
          <span>/</span>
          <span className="text-[#6B635B]">Active check</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          Verification in progress
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          Vera is reviewing the completed work deterministically. You can safely leave this page.
        </p>
      </div>

      {/* Card 1: Top Hero Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse" />
            {isResolved ? "Verdict finalized" : "Reviewing evidence"}
          </span>
          <span className="font-mono text-xs text-[#6B635B]">
            {formatElapsed(secondsElapsed)}
          </span>
        </div>

        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#181311] leading-snug">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1.5">
            {agentName} • {runId}
          </p>
        </div>

        <div>
          <div className="w-full bg-[#E8E4DC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#181311] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-xs text-[#6B635B]">{progress}% complete</span>
            <button
              onClick={() => {
                if (id) navigate(`/verify/${id}`);
              }}
              className="text-xs font-semibold text-[#181311] hover:underline cursor-pointer"
            >
              Skip to results →
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: What Vera has found so far */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
          What Vera has found so far
        </h3>

        <div className="flex flex-col gap-3">
          {invariants.length > 0 ? (
            invariants.slice(0, 3).map((inv, idx) => (
              <div key={inv.id || idx} className="flex items-center gap-3">
                {inv.status === "PASSED" ? (
                  <div className="w-5 h-5 rounded-full bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4] flex items-center justify-center text-xs font-bold shrink-0">
                    !
                  </div>
                )}
                <span className="text-sm font-medium text-[#181311]">
                  {inv.name || `Invariant: ${inv.description}`}
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <span className="text-sm font-medium text-[#181311]">
                  Deconstructed task into deterministic invariants
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                <span className="text-sm font-medium text-[#181311]">
                  Extracted agent execution signatures & output claims
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FEF5EB] border border-[#FADCC4] flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 border-2 border-[#B8621B] border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-sm font-medium text-[#6B635B]">
                  Corroborating ledger evidence & independent price feeds
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card 3: Four Stages list */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col divide-y divide-[#E8E4DC]">
        {/* Stage 1 */}
        <div className="flex items-center justify-between py-3.5 first:pt-0">
          <span className="text-sm font-semibold text-[#181311]">Request understood</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
            Complete
          </span>
        </div>

        {/* Stage 2 */}
        <div className="flex items-center justify-between py-3.5">
          <span className="text-sm font-semibold text-[#181311]">Work matched</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
            {hasRequirements ? "Complete" : "In progress"}
          </span>
        </div>

        {/* Stage 3 */}
        <div className="flex items-center justify-between py-3.5">
          <span className="text-sm font-semibold text-[#181311]">Evidence traced</span>
          {hasEvidence || isResolved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse" />
              In progress
            </span>
          )}
        </div>

        {/* Stage 4 */}
        <div className="flex items-center justify-between py-3.5 last:pb-0">
          <span className={`text-sm font-semibold ${isResolved ? "text-[#181311]" : "text-[#8C8479]"}`}>
            Verdict prepared
          </span>
          {isResolved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C8479]" />
              Waiting
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
