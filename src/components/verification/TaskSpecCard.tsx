import React from "react";
import { VerificationRecord } from "../../types/verification";

interface TaskSpecCardProps {
  record: VerificationRecord;
}

export const TaskSpecCard: React.FC<TaskSpecCardProps> = ({ record }) => {
  const currentAttempt = record.attempts?.[record.attempts.length - 1];
  const invariants = currentAttempt?.invariants || [];

  return (
    <div className="rounded-xl bg-surface-container-low p-space-md lg:p-space-lg mb-space-lg shadow-md border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            assignment_turned_in
          </span>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-semibold">
            Registered Task Specification
          </span>
        </div>
        <span className="font-code-sm text-code-sm text-outline">
          Worker: {record.workerName || record.workerId}
        </span>
      </div>

      {/* Verbatim Prompt Box */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md font-code-md text-code-md text-primary-fixed-dim shadow-inner mb-space-md leading-relaxed border border-white/5">
        <span className="text-outline select-none mr-2 font-code-sm">PROMPT &gt;</span>
        &quot;{record.taskPrompt}&quot;
      </div>

      {/* Declared Invariants Grid */}
      {invariants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm">
          {invariants.map((inv, idx) => (
            <div key={inv.id || idx} className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
              <span className="font-label-caps text-label-caps text-outline uppercase truncate" title={inv.name}>
                {inv.name || `Invariant ${idx + 1}`}
              </span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate" title={inv.expected}>
                {inv.expected || "Rule Required"}
              </span>
              <span className="font-code-sm text-code-sm text-outline truncate" title={inv.description}>
                {inv.description || inv.category || "Deterministic check"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm text-xs">
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
            <span className="font-label-caps text-label-caps text-outline uppercase">Network</span>
            <span className="font-semibold text-on-surface">{record.network || "Stellar Testnet"}</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
            <span className="font-label-caps text-label-caps text-outline uppercase">Worker</span>
            <span className="font-semibold text-on-surface truncate">{record.workerName || record.workerId}</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
            <span className="font-label-caps text-label-caps text-outline uppercase">Max Attempts</span>
            <span className="font-semibold text-on-surface">{record.maxAttempts}</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
            <span className="font-label-caps text-label-caps text-outline uppercase">Status</span>
            <span className="font-semibold text-on-surface">{record.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};
