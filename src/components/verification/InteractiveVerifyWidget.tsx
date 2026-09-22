import React, { useState } from "react";
import { Link } from "react-router-dom";
import { verificationApi } from "../../services/verificationApi";
import { VerificationRecord } from "../../types/verification";
import { TELEGRAM_BOT_URL } from "../../config/env";

interface PresetOption {
  label: string;
  badge: string;
  task: string;
  output: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    label: "Deceptive Payment (0.50 USDC actual)",
    badge: "Expected Deficit",
    task: "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    output: "Payment completed. Sent 5 USDC via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759",
  },
  {
    label: "Valid Payment (5.00 USDC actual)",
    badge: "Expected Pass",
    task: "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    output: "Payment completed. Sent 5 USDC via tx 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
  },
  {
    label: "Missing Transaction Hash",
    badge: "Unverifiable Claim",
    task: "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    output: "Payment completed. I transferred the 5 USDC to the recipient address as requested.",
  },
  {
    label: "Protocol Cardinality (3 items)",
    badge: "Rule Matching",
    task: "Find 3 Stellar lending protocols with TVL above $10M",
    output: "1. Blend Protocol — $14.2M TVL\n2. YieldBlox — $11.0M TVL\n3. Aqua Network — $18.5M TVL",
  },
];

export const InteractiveVerifyWidget: React.FC = () => {
  const [taskPrompt, setTaskPrompt] = useState(PRESET_OPTIONS[0].task);
  const [workerOutput, setWorkerOutput] = useState(PRESET_OPTIONS[0].output);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: PresetOption) => {
    setTaskPrompt(preset.task);
    setWorkerOutput(preset.output);
    setRecord(null);
    setError(null);
  };

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskPrompt.trim() || !workerOutput.trim()) {
      setError("Please provide both a task specification and worker output.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verificationApi.create({
        taskPrompt,
        workerOutput,
        workerId: "web-operator",
        workerName: "Web Operator Client",
        network: "Stellar Testnet",
      });
      setRecord(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed to execute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl bg-[#21110B]/90 backdrop-blur-xl border border-[#4A2B1D] shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#4A2B1D]/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E08A3E] animate-pulse" />
            <span>Interactive Verification Console</span>
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-[#FFF8F0]">
            Verify a task directly from your browser
          </h3>
        </div>
        <div className="text-xs text-[#B9A99B] flex items-center gap-2">
          <span>Connected Engine:</span>
          <span className="px-2 py-0.5 rounded bg-[#160C08] text-emerald-400 font-mono font-medium border border-emerald-900/40">
            Stellar RPC Live
          </span>
        </div>
      </div>

      {/* Preset Quick-Buttons */}
      <div className="mb-6">
        <div className="text-xs text-[#B9A99B] mb-2 font-medium">
          Quick benchmark presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleApplyPreset(opt)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ' + (
                taskPrompt === opt.task && workerOutput === opt.output
                  ? 'bg-[#C96A2B] text-white border-[#E08A3E] shadow-[0_0_12px_rgba(201,106,43,0.35)]'
                  : 'bg-[#160C08] text-[#B9A99B] border-[#4A2B1D] hover:text-[#FFF8F0] hover:border-[#C96A2B]/50'
              )}
            >
              <span>{opt.label}</span>
              <span className="ml-1.5 text-[10px] opacity-75">({opt.badge})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRunVerification} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#FFF8F0] uppercase tracking-wider mb-1.5">
            What should VeraOS verify?
          </label>
          <input
            type="text"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            placeholder="e.g. Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L"
            className="w-full px-4 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-sm text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#C96A2B] font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#FFF8F0] uppercase tracking-wider mb-1.5">
            Evidence / transaction:
          </label>
          <textarea
            rows={2}
            value={workerOutput}
            onChange={(e) => setWorkerOutput(e.target.value)}
            placeholder="e.g. Sent 5 USDC via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759"
            className="w-full px-4 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-sm text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#C96A2B] font-mono resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#B9A99B]">
            Runs zero-trust verification through the unified VeraOS verification engine.
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C96A2B] hover:bg-[#E08A3E] text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(201,106,43,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking Stellar Evidence...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Start Verification</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {record && (
        <div className="mt-8 p-5 sm:p-6 rounded-xl bg-[#160C08] border border-[#4A2B1D] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#4A2B1D]/60">
            <div className="flex items-center gap-3">
              <span
                className={'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ' + (
                  record.status === 'PASSED'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-red-950/80 text-red-400 border border-red-800/60'
                )}
              >
                <span
                  className={'w-2 h-2 rounded-full ' + (
                    record.status === 'PASSED' ? 'bg-emerald-400' : 'bg-red-400'
                  )}
                />
                <span>{record.status === 'PASSED' ? 'VERIFIED' : 'VERIFICATION FAILED'}</span>
              </span>
              <span className="font-mono text-xs text-[#B9A99B]">
                ID: <strong className="text-[#FFF8F0]">{record.displayId}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Link
                to={'/verify/' + record.id}
                className="px-3 py-1.5 rounded-lg bg-[#2C1710] hover:bg-[#3A2015] text-[#FFF8F0] border border-[#4A2B1D] font-medium transition-colors flex items-center gap-1"
              >
                <span>Inspect on Dashboard</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <a
                href={`${TELEGRAM_BOT_URL}?start=invite_VERA-VIP-2026`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#21110B] hover:bg-[#2C1710] text-[#E08A3E] border border-[#4A2B1D] font-medium transition-colors flex items-center gap-1"
                title="Inspect in Telegram with auto-invite"
              >
                <span>Check in Telegram (Auto-Invite)</span>
                <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
              </a>
            </div>
          </div>

          {/* Verdict Summary */}
          {(() => {
            const latestAttempt = record.attempts?.[record.attempts.length - 1];
            const invariants = latestAttempt?.invariants || [];
            const directives = latestAttempt?.remediationDirectives || [];

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
                  <div className="p-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D]">
                    <span className="text-[#B9A99B] block mb-1 uppercase font-sans font-bold text-[10px]">
                      Task Requirement
                    </span>
                    <p className="text-[#FFF8F0] leading-relaxed">
                      {record.taskPrompt}
                    </p>
                    {latestAttempt?.summary && (
                      <div className="mt-2 text-[11px] text-[#B9A99B]">
                        Summary: {latestAttempt.summary}
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D]">
                    <span className="text-[#B9A99B] block mb-1 uppercase font-sans font-bold text-[10px]">
                      Evaluated Checks
                    </span>
                    <div className="space-y-1.5">
                      {invariants.length > 0 ? (
                        invariants.map((c) => (
                          <div key={c.id} className="flex items-center justify-between">
                            <span className="text-[#B9A99B] truncate mr-2">{c.name}:</span>
                            <span
                              className={`font-bold shrink-0 ${
                                c.status === "PASSED" ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {c.status === "PASSED" ? "✓ Pass" : "✗ Fail"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[#B9A99B]">All criteria evaluated</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remediation Note if failed */}
                {directives.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300 font-mono">
                    <strong className="text-red-400">Remediation Directive:</strong>{" "}
                    {directives[0].reason || directives[0].action}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
