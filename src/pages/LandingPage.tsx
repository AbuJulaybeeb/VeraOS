import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VerificationPipelineVisual } from "../components/landing/VerificationPipelineVisual";

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#160C08] text-[#FFF8F0] min-h-screen selection:bg-[#C96A2B] selection:text-[#FFF8F0] overflow-x-hidden font-sans">
      {/* ---------------------------------------------------- */}
      {/* 1. PUBLIC NAVIGATION                                 */}
      {/* ---------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#160C08]/90 backdrop-blur-md border-b border-[#4A2B1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#C96A2B] flex items-center justify-center shadow-[0_0_16px_rgba(201,106,43,0.35)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[18px]">
                verified
              </span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-[#FFF8F0]">
              Vera<span className="text-[#E08A3E]">OS</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#B9A99B]">
            <a
              href="#how-it-works"
              className="hover:text-[#FFF8F0] transition-colors"
            >
              How it works
            </a>
            <a
              href="#why-veraos"
              className="hover:text-[#FFF8F0] transition-colors"
            >
              Why VeraOS
            </a>
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-semibold text-white bg-[#C96A2B] hover:bg-[#E08A3E] shadow-[0_0_18px_rgba(201,106,43,0.3)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-[#21110B] border border-[#4A2B1D] text-[#B9A99B] hover:text-[#FFF8F0] cursor-pointer"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#4A2B1D] bg-[#21110B] px-4 py-4 flex flex-col gap-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2C1710] transition-colors"
            >
              How it works
            </a>
            <a
              href="#why-veraos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2C1710] transition-colors"
            >
              Why VeraOS
            </a>
            <Link
              to="/welcome"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center px-4 py-2.5 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-sm transition-colors block shadow-md"
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. SECTION 1 — HERO                                  */}
      {/* ---------------------------------------------------- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C1710] border border-[#4A2B1D] text-[#E08A3E] text-xs font-heading font-semibold tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse" />
          <span>VERIFICATION LAYER FOR AI AGENTS</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFF8F0] leading-[1.08] max-w-4xl mb-6">
          Verify before{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E08A3E] to-[#C96A2B]">
            you trust.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="font-sans text-base sm:text-lg lg:text-xl text-[#B9A99B] max-w-2xl leading-relaxed mb-8">
          VeraOS independently checks whether AI agents actually completed the tasks they claim to have completed.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-sm sm:text-base transition-all shadow-[0_0_24px_rgba(201,106,43,0.35)] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-[#FFF8F0] font-heading font-medium text-sm sm:text-base transition-all"
          >
            <span>How it works</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </a>
        </div>

        {/* Hero Visual: Distinctive VeraOS verification visual */}
        <VerificationPipelineVisual />
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. SECTION 2 — THE PROBLEM                           */}
      {/* ---------------------------------------------------- */}
      <section id="why-veraos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#4A2B1D]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E08A3E] mb-2">
            THE RELIABILITY GAP
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-5 leading-tight">
            AI agents can say they completed something.
            <br />
            <span className="text-[#B9A99B]">That does not mean they actually did.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#B9A99B] leading-relaxed">
            Language models generate convincing summaries regardless of whether underlying APIs executed, payments were dispatched, or database records were written. Relying on an agent&apos;s self-reported status leads to silent failure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] mb-4">
                <span className="material-symbols-outlined text-[20px]">report</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#FFF8F0] mb-2">
                Hallucinated Success
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                Agents frequently output reassuring &quot;task completed&quot; messages even when the underlying tool invocation encountered an error or timeout.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] mb-4">
                <span className="material-symbols-outlined text-[20px]">toll</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#FFF8F0] mb-2">
                Settlement Deficits
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                Financial and treasury operations suffer from mismatched amounts, incorrect destinations, or unconfirmed network transactions.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] mb-4">
                <span className="material-symbols-outlined text-[20px]">sync_problem</span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#FFF8F0] mb-2">
                Cascading Agent Errors
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                In multi-agent swarms, a single faulty upstream claim corrupts all downstream agents if work is not independently proven first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. SECTION 3 — HOW VERAOS WORKS                     */}
      {/* ---------------------------------------------------- */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#4A2B1D]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E08A3E] mb-2">
            THREE STEPS
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-4">
            How VeraOS works
          </h2>
          <p className="text-sm sm:text-base text-[#B9A99B] leading-relaxed">
            Independent verification creates certainty between what was asked, what was claimed, and what actually occurred.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 01 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-bold text-[#E08A3E] block mb-4">01</span>
              <h3 className="font-heading font-semibold text-xl text-[#FFF8F0] mb-3">
                Submit the task
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                Tell VeraOS what the agent was supposed to accomplish. Declare explicit requirements, invariants, and expected outcomes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#4A2B1D] text-xs font-mono text-[#B9A99B]">
              Input: Task Mandate
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-bold text-[#E08A3E] block mb-4">02</span>
              <h3 className="font-heading font-semibold text-xl text-[#FFF8F0] mb-3">
                Check the evidence
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                VeraOS separates the agent&apos;s claims from independently verifiable evidence. It inspects ledgers, APIs, and raw witnesses.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#4A2B1D] text-xs font-mono text-[#B9A99B]">
              Process: Independent Audit
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-7 sm:p-8 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col justify-between">
            <div>
              <span className="font-mono text-3xl font-bold text-[#E08A3E] block mb-4">03</span>
              <h3 className="font-heading font-semibold text-xl text-[#FFF8F0] mb-3">
                Return a verdict
              </h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed">
                VeraOS returns a deterministic verdict: <strong className="text-[#4ade80]">PASS</strong>, <strong className="text-[#f87171]">FAIL</strong>, or <strong className="text-[#E6A15A]">UNVERIFIABLE</strong>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#4A2B1D] text-xs font-mono text-[#B9A99B]">
              Output: PASS / FAIL / UNVERIFIABLE
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. SECTION 4 — CLAIM VS EVIDENCE (HIGH CONTRAST)     */}
      {/* ---------------------------------------------------- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#4A2B1D]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E08A3E] mb-2">
            CORE PRINCIPLE
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-4">
            Claim ≠ Evidence ≠ Verdict
          </h2>
          <p className="text-sm sm:text-base text-[#B9A99B] leading-relaxed">
            The foundation of VeraOS: never confuse what an agent asserts with what can independently be proven.
          </p>
        </div>

        {/* Visual Comparison Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Worker Claim (Neutral treatment) */}
          <div className="rounded-3xl bg-[#21110B] border border-[#4A2B1D] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#4A2B1D]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B9A99B]" />
                  <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#B9A99B]">
                    WORKER CLAIM
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#160C08] text-[#B9A99B] border border-[#4A2B1D]">
                  Untrusted Statement
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#160C08] border border-[#4A2B1D] font-mono text-sm text-[#FFF8F0] mb-6">
                &quot;I sent 5 USDC.&quot;
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#B9A99B]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#B9A99B]">○</span>
                  <span>Agent marked task as 100% complete</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#B9A99B]">○</span>
                  <span>Asserted transfer amount: 5.00 USDC</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#B9A99B]">○</span>
                  <span>No external verification required by worker</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#4A2B1D] text-xs text-[#B9A99B] font-mono">
              Status: Self-reported only
            </div>
          </div>

          {/* Independent Evidence (Stronger treatment) */}
          <div className="rounded-3xl bg-[#2C1710] border-2 border-[#E08A3E]/60 p-6 sm:p-8 flex flex-col justify-between shadow-[0_15px_50px_rgba(201,106,43,0.15)]">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#4A2B1D]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E08A3E]" />
                  <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#E08A3E]">
                    INDEPENDENT EVIDENCE
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#21110B] text-[#E08A3E] border border-[#E08A3E]/30 font-semibold">
                  Authoritative Witness
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#21110B] border border-[#E08A3E]/40 font-mono text-sm text-[#FFF8F0] mb-6">
                Transaction shows 0.5 USDC.
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#B9A99B]">
                <div className="flex items-center gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span className="text-red-200 font-medium">Observed amount 0.50 USDC ≠ Required 5.00 USDC</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#4ade80] font-bold">✓</span>
                  <span>Recipient address matched</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-red-400 font-bold">✕</span>
                  <span className="text-red-200 font-medium">Critical deficit of 4.50 USDC detected</span>
                </div>
              </div>
            </div>

            {/* Prominent FAILED Verdict Footer */}
            <div className="mt-8 p-4 rounded-xl bg-[#2a1210] border border-[#5c1e19] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#f87171]" />
                <span className="font-mono font-bold text-sm text-[#f87171]">
                  VERDICT: FAILED
                </span>
              </div>
              <span className="text-xs font-mono text-red-300">
                Action Blocked
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. SECTION 5 — CORRECTION LOOP                       */}
      {/* ---------------------------------------------------- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#4A2B1D]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E08A3E] mb-2">
            CLOSED-LOOP REMEDIATION
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-4">
            If a task fails: the correction loop.
          </h2>
          <p className="text-sm sm:text-base text-[#B9A99B] leading-relaxed">
            VeraOS does not just flag failures. It emits machine-readable correction directives so the agent can fix the problem and re-verify.
          </p>
        </div>

        {/* Correction Flow Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {/* Step 1: FAIL */}
          <div className="p-5 rounded-2xl bg-[#2a1210] border border-[#5c1e19] text-center flex flex-col items-center justify-center">
            <span className="font-mono text-xs text-red-400 font-bold mb-1">01</span>
            <span className="font-heading font-bold text-base text-[#f87171]">FAIL</span>
            <span className="text-[11px] text-red-300/80 mt-1">Deficit detected</span>
          </div>

          {/* Step 2: CORRECT */}
          <div className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] text-center flex flex-col items-center justify-center">
            <span className="font-mono text-xs text-[#E08A3E] font-bold mb-1">02</span>
            <span className="font-heading font-bold text-base text-[#FFF8F0]">CORRECT</span>
            <span className="text-[11px] text-[#B9A99B] mt-1">Issue directive</span>
          </div>

          {/* Step 3: RESUBMIT */}
          <div className="p-5 rounded-2xl bg-[#21110B] border border-[#4A2B1D] text-center flex flex-col items-center justify-center">
            <span className="font-mono text-xs text-[#E08A3E] font-bold mb-1">03</span>
            <span className="font-heading font-bold text-base text-[#FFF8F0]">RESUBMIT</span>
            <span className="text-[11px] text-[#B9A99B] mt-1">Agent retries</span>
          </div>

          {/* Step 4: VERIFY */}
          <div className="p-5 rounded-2xl bg-[#2C1710] border border-[#4A2B1D] text-center flex flex-col items-center justify-center">
            <span className="font-mono text-xs text-[#E08A3E] font-bold mb-1">04</span>
            <span className="font-heading font-bold text-base text-[#FFF8F0]">VERIFY</span>
            <span className="text-[11px] text-[#B9A99B] mt-1">Re-evaluate</span>
          </div>

          {/* Step 5: PASS */}
          <div className="p-5 rounded-2xl bg-[#142818] border border-[#1b4324] text-center flex flex-col items-center justify-center">
            <span className="font-mono text-xs text-[#4ade80] font-bold mb-1">05</span>
            <span className="font-heading font-bold text-base text-[#4ade80]">PASS</span>
            <span className="text-[11px] text-emerald-300/80 mt-1">Settlement released</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. SECTION 6 — FINAL CTA                             */}
      {/* ---------------------------------------------------- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#4A2B1D] text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#21110B] border border-[#4A2B1D] shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col items-center">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-4">
            Ready to verify agent work?
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#B9A99B] max-w-xl mb-8 leading-relaxed">
            Ensure your autonomous agents actually complete what they claim to complete.
          </p>

          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-base transition-all shadow-[0_0_24px_rgba(201,106,43,0.35)] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. FOOTER                                            */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-[#4A2B1D] py-10 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9A99B]">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-[#FFF8F0]">
            Vera<span className="text-[#E08A3E]">OS</span>
          </span>
          <span>•</span>
          <span>Verification layer for AI agents</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-[#FFF8F0] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-[#FFF8F0] transition-colors">
            Terms of Service
          </Link>
          <span className="text-[#4A2B1D]">|</span>
          <span>© {new Date().getFullYear()} VeraOS</span>
        </div>
      </footer>
    </div>
  );
};
