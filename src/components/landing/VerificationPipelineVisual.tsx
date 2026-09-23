import React, { useState, useEffect } from "react";

export const VerificationPipelineVisual: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"fail" | "pass">("fail");
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [activeMode]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#21110B] border border-[#4A2B1D] shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-5 sm:p-8 relative overflow-hidden text-left">
      {/* Visual Window Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-[#4A2B1D]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A2B1D]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A2B1D]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A2B1D]" />
          </div>
          <span className="font-mono text-xs text-[#B9A99B] ml-2 font-medium">
            vera_verification_engine.telemetry
          </span>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#160C08] border border-[#4A2B1D] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMode("fail");
              setCurrentStep(3);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-heading font-medium transition-all cursor-pointer ${
              activeMode === "fail"
                ? "bg-[#2a1210] text-[#f87171] border border-[#5c1e19] shadow-sm font-semibold"
                : "text-[#B9A99B] hover:text-[#FFF8F0]"
            }`}
          >
            Deficit Scenario (Fail)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("pass");
              setCurrentStep(3);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-heading font-medium transition-all cursor-pointer ${
              activeMode === "pass"
                ? "bg-[#142818] text-[#4ade80] border border-[#1b4324] shadow-sm font-semibold"
                : "text-[#B9A99B] hover:text-[#FFF8F0]"
            }`}
          >
            Correct Execution (Pass)
          </button>
        </div>
      </div>

      {/* Verification Pipeline Flow: Agent -> Claim -> VeraOS -> Independent Evidence -> PASS/FAIL */}
      <div className="flex flex-col gap-4 relative">
        {/* Step 1: AI Agent */}
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            currentStep >= 0
              ? "bg-[#2C1710] border-[#E08A3E]/40"
              : "bg-[#160C08] border-[#4A2B1D] opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#3A2015] text-[#E08A3E] font-semibold">
                01 • AI AGENT
              </span>
              <span className="font-heading font-semibold text-xs sm:text-sm text-[#FFF8F0]">
                Autonomous Settlement Agent
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#B9A99B]">task: pay 5.00 USDC</span>
          </div>
          <p className="text-xs text-[#B9A99B]">
            Agent assigned mandate: &quot;Find 3 lending protocols and disburse 5.00 USDC settlement.&quot;
          </p>
        </div>

        {/* Down Connector */}
        <div className="flex justify-center -my-2 z-10">
          <div className="w-6 h-6 rounded-full bg-[#160C08] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
          </div>
        </div>

        {/* Step 2: Worker Claim (Neutral visual treatment) */}
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            currentStep >= 1
              ? "bg-[#160C08] border-[#4A2B1D]"
              : "bg-[#160C08]/50 border-[#4A2B1D]/40 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#2C1710] text-[#B9A99B] font-semibold border border-[#4A2B1D]">
                02 • WORKER CLAIM
              </span>
              <span className="text-xs text-[#B9A99B] italic">Untrusted assertion</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21110B] text-[#B9A99B] border border-[#4A2B1D]">
              Self-Reported
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#21110B] border border-[#4A2B1D] font-mono text-xs text-[#FFF8F0]">
            &quot;I completed the task. Disbursed 5.00 USDC to settlement address. Tx complete.&quot;
          </div>
        </div>

        {/* Down Connector */}
        <div className="flex justify-center -my-2 z-10">
          <div className="w-6 h-6 rounded-full bg-[#160C08] border border-[#E08A3E]/40 flex items-center justify-center text-[#E08A3E] shadow-[0_0_10px_rgba(224,138,62,0.3)]">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
          </div>
        </div>

        {/* Step 3: VeraOS Verification Checks */}
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 ${
            currentStep >= 2
              ? "bg-[#2C1710] border-[#E08A3E]/50 shadow-md"
              : "bg-[#160C08] border-[#4A2B1D] opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#C96A2B] text-white font-bold">
                03 • VERAOS INDEPENDENT CHECKS
              </span>
              <span className="font-heading font-semibold text-xs sm:text-sm text-[#FFF8F0]">
                Corroborating Evidence
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#E08A3E]">
              {currentStep >= 2 ? "Evaluating invariants..." : "Waiting"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] flex items-center justify-between">
              <span className="text-[#B9A99B]">Requirement Target</span>
              <span className="text-[#FFF8F0] font-semibold">5.00 USDC</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] flex items-center justify-between">
              <span className="text-[#B9A99B]">Independent Witness</span>
              <span className={activeMode === "fail" ? "text-[#f87171] font-semibold" : "text-[#4ade80] font-semibold"}>
                {activeMode === "fail" ? "Observed 0.50 USDC" : "Observed 5.00 USDC"}
              </span>
            </div>
          </div>
        </div>

        {/* Down Connector */}
        <div className="flex justify-center -my-2 z-10">
          <div className="w-6 h-6 rounded-full bg-[#160C08] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
          </div>
        </div>

        {/* Step 4: Final Verdict (Dominant visual) */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            activeMode === "fail"
              ? "bg-[#2a1210] border-[#5c1e19] shadow-[0_0_24px_rgba(248,113,113,0.15)]"
              : "bg-[#142818] border-[#1b4324] shadow-[0_0_24px_rgba(74,222,128,0.15)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                  activeMode === "fail"
                    ? "bg-[#5c1e19] text-[#f87171]"
                    : "bg-[#1b4324] text-[#4ade80]"
                }`}
              >
                {activeMode === "fail" ? "✕" : "✓"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B9A99B]">
                    04 • FINAL VERDICT
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      activeMode === "fail"
                        ? "bg-[#f87171]/20 text-[#f87171]"
                        : "bg-[#4ade80]/20 text-[#4ade80]"
                    }`}
                  >
                    {activeMode === "fail" ? "FAILED" : "VERIFIED"}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-[#FFF8F0] mt-0.5">
                  {activeMode === "fail"
                    ? "Execution Deficit Detected — Invariant Breached"
                    : "All Task Invariants Corroborated with Ground Truth"}
                </h4>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-[#B9A99B] border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
              <span>{activeMode === "fail" ? "Escrow Blocked" : "Escrow Authorized"}</span>
              <div className="text-[11px] text-[#B9A99B]/70">Deterministic Telemetry</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
