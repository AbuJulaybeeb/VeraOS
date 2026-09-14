import React from "react";
import { VerificationRecord } from "../../types/verification";

interface TaskSpecCardProps {
  record: VerificationRecord;
}

export const TaskSpecCard: React.FC<TaskSpecCardProps> = ({ record }) => {
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
          Schema: vera.task.v2.1
        </span>
      </div>

      {/* Verbatim Prompt Box */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md font-code-md text-code-md text-primary-fixed-dim shadow-inner mb-space-md leading-relaxed border border-white/5">
        <span className="text-outline select-none mr-2 font-code-sm">PROMPT &gt;</span>
        "{record.taskPrompt}"
      </div>

      {/* Declared Invariants Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
          <span className="font-label-caps text-label-caps text-outline uppercase">
            Invariant A: Target Count
          </span>
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            3 Protocols
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Exact cardinal set
          </span>
        </div>

        <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
          <span className="font-label-caps text-label-caps text-outline uppercase">
            Invariant B: Ecosystem
          </span>
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Base L2 (8453)
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            Canonical deployment
          </span>
        </div>

        <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
          <span className="font-label-caps text-label-caps text-outline uppercase">
            Invariant C: TVL Min
          </span>
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            ≥ $10,000,000
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            USD equivalent at block
          </span>
        </div>

        <div className="p-space-sm rounded-lg bg-surface-container flex flex-col gap-0.5 border border-white/5">
          <span className="font-label-caps text-label-caps text-outline uppercase">
            Invariant D: Self-Payment
          </span>
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            5.00 USDC
          </span>
          <span className="font-code-sm text-code-sm text-outline">
            ERC-20 transfer strictly
          </span>
        </div>
      </div>
    </div>
  );
};
