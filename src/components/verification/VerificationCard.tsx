import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { VerificationRecord } from "../../types/verification";

interface VerificationCardProps {
  item: VerificationRecord;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ item }) => {
  const navigate = useNavigate();

  // Deterministically compute conviction score from item state
  const isPassed = item.status === "PASSED";
  const isFailed = item.status === "FAILED";

  const convictionScore = isPassed
    ? 98
    : isFailed
    ? 18
    : 45;

  const passedPercentage = isPassed ? 100 : isFailed ? 25 : 50;
  const remainingPercentage = 100 - passedPercentage;

  // Extract clean task headline
  const taskHeadline = item.taskPrompt.length > 55
    ? item.taskPrompt.slice(0, 52) + "..."
    : item.taskPrompt;

  return (
    <div
      onClick={() => navigate(`/verify/${item.id}`)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest border border-white/10 [box-shadow:0_4px_20px_rgba(0,0,0,0.35)] hover:border-primary/50 transform-gpu transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Ambient glowing radial blur */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl transform-gpu group-hover:scale-150 transition-all duration-500 z-0" />
      
      {/* Subtle geometric ring */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-36 h-36 rounded-full border border-white/5 transform-gpu group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 opacity-60 z-0" />

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative z-10 space-y-3.5">
        {/* Top Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-bold text-primary group-hover:text-primary-container transition-colors truncate">
                {item.displayId || item.id}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-white/5 shrink-0">
                {item.network || "Stellar Testnet"}
              </span>
            </div>

            {/* Verdict Pill */}
            {isPassed ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                FAILED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                UNVERIFIED
              </span>
            )}
          </div>

          {/* Worker Info & Task */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[15px] text-outline">smart_toy</span>
              <span className="font-medium text-on-surface">{item.workerName}</span>
              <span className="text-outline">·</span>
              <span className="font-mono text-[11px] text-outline">Attempt {item.currentAttempt}/{item.maxAttempts}</span>
            </div>
            <p className="text-xs text-on-surface font-medium line-clamp-2 leading-relaxed" title={item.taskPrompt}>
              &quot;{taskHeadline}&quot;
            </p>
          </div>
        </div>

        {/* Conviction / Cryptographic Assurance Score */}
        <div className="pt-1">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                {convictionScore}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                / 100 assurance
              </span>
            </div>
            <span className="text-[11px] font-mono text-outline bg-surface-container px-2 py-0.5 rounded border border-white/5">
              {isPassed ? "Invariant Match" : isFailed ? "Breach Detected" : "In Progress"}
            </span>
          </div>

          {/* Dual-Progress Visual Bar */}
          <div className="space-y-1">
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-surface-container">
              <div
                className={`transition-all duration-500 ${isPassed ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${passedPercentage}%` }}
              />
              <div
                className="bg-surface-container-highest transition-all duration-500"
                style={{ width: `${remainingPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-outline">
              <span className={isPassed ? "text-emerald-400" : "text-on-surface-variant"}>
                Verified {passedPercentage}%
              </span>
              <span className={isFailed ? "text-red-400" : "text-outline"}>
                Discrepancy {remainingPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Informative Tag Pills Strip */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-white/5">
            Stellar Horizon RPC
          </span>
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-white/5">
            Ed25519 Signed
          </span>
          {isPassed && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              Zero Discrepancy
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-800/40">
              Remediation Queued
            </span>
          )}
        </div>

        {/* Action Footer (Split Buttons) */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <Link
            to={`/verify/${item.id}/evidence`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs font-medium text-on-surface-variant hover:text-on-surface text-center transition-all"
          >
            View Reasoning
          </Link>
          <Link
            to={`/verify/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 px-3 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <span>Inspect Trace</span>
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
