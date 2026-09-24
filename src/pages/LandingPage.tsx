import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TELEGRAM_BOT_URL, GITHUB_REPO_URL } from "../config/env";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState<number>(0);

  useEffect(() => {
    if ((location.state as any)?.openAuth) {
      openAuthModal("signin");
    }
  }, [location.state, openAuthModal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/verifications?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stages = [
    {
      step: "01",
      title: "Requirements & Invariants",
      tag: "SPECIFICATION",
      description:
        "Defines expected contract invariants, SLA boundaries, financial caps, and execution criteria before an agent takes action.",
      badge: "Pre-execution Schema",
    },
    {
      step: "02",
      title: "Worker Claim Extraction",
      tag: "ASSERTION PARSING",
      description:
        "Extracts atomic statements, parameter arguments, and claimed outputs directly from agent logs, execution payloads, and receipts.",
      badge: "Autonomous Ingestion",
    },
    {
      step: "03",
      title: "Independent Grounding & Proof",
      tag: "MULTI-ORACLE CONSENSUS",
      description:
        "Gathers third-party cryptographic proofs, RPC state queries, and independent oracle responses to evaluate each claim against ground truth.",
      badge: "Zero-Knowledge Attested",
    },
  ];

  const codeSnippets = [
    `{
  "$schema": "https://veraos.network/schemas/spec.v1.json",
  "verification_id": "vr-2048-live",
  "agent_id": "ResearchAgent_VR2048",
  "protocol": "Liquid Staking Protocol",
  "invariants": {
    "max_slippage_bps": 50,
    "max_gas_eth": "0.015",
    "authorized_vault": "0x56Ce26F3d01F9b31DeA678e722",
    "oracle_sources_min": 3
  },
  "execution_mode": "FAIL_SAFE_REVERT"
}`,
    `{
  "claims_extracted": [
    {
      "claim_id": "c_01",
      "type": "BALANCE_DELTA",
      "target": "Uniswap_V3_Pool",
      "reported_value": "+142.85 ETH"
    },
    {
      "claim_id": "c_02",
      "type": "FEE_EXPENDITURE",
      "reported_gas": "0.0118 ETH"
    },
    {
      "claim_id": "c_03",
      "type": "SETTLEMENT_RECIPIENT",
      "recipient": "0x56Ce26F3d01F9b31DeA678e722"
    }
  ]
}`,
    `{
  "attestation": {
    "engine": "VeraOS Arbiter v1.4",
    "proof_type": "Groth16_ZK_SNARK",
    "zk_hash": "0x17fa60c098ab32e18d9f1",
    "independent_oracles_queried": 11,
    "verification_verdict": "PASS",
    "confidence_score": 1.0,
    "state_commitment": "0x9812bf...e722"
  }
}`,
  ];


  return (
    <div className="bg-[#F7F5F0] text-[#191513] min-h-screen selection:bg-[#181311] selection:text-[#F7F5F0] overflow-x-hidden font-sans">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP NAVBAR (FIGMA IMAGE 1)                        */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Status Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#181311]" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-[#191513]">
                Vera<span className="text-[#D97736]">OS</span>
              </span>
            </Link>

            {/* Telegram Active Pill */}
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF5EE] hover:bg-[#DCF0E2] border border-[#CDE5D5] text-[#1D7A46] text-xs font-medium transition-colors"
              title="Open @VeraOS_Layer_bot on Telegram"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46] animate-pulse" />
              <span>@VeraOS_Layer_bot</span>
            </a>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6B635B]">
            <a href="#how-it-works" className="hover:text-[#191513] transition-colors">
              How it works
            </a>
            <a href="#matrix" className="hover:text-[#191513] transition-colors">
              Explore
            </a>
            <a href="#audit-engine" className="hover:text-[#191513] transition-colors">
              Build
            </a>
            <Link to="/docs" className="hover:text-[#191513] transition-colors">
              Docs
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center relative flex-1 max-w-xs"
          >
            <span className="material-symbols-outlined absolute left-3 text-[#9E948B] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Verify (Tx ID, Msg, IPFS Hash)..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E8E4DC] rounded-xl text-xs text-[#191513] placeholder-[#9E948B] focus:outline-none focus:border-[#181311] transition-colors"
            />
          </form>

          {/* Right: Connect Agent CTA & User Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/connect-agent"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-xs sm:text-sm shadow-sm transition-all"
            >
              <span>Connect an Agent</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-full bg-[#EAE5DE] border border-[#D5CEC5] text-[#191513] flex items-center justify-center font-heading font-semibold text-xs hover:border-[#181311] transition-colors"
              title="Dashboard"
            >
              VO
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-lg bg-white border border-[#E8E4DC] text-[#6B635B]"
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E4DC] bg-[#F7F5F0] px-4 py-4 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative w-full mb-2">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[#9E948B] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Verify (Tx ID, Msg, IPFS Hash)..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E4DC] rounded-xl text-xs text-[#191513]"
              />
            </form>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[#6B635B] hover:text-[#191513] hover:bg-white"
            >
              How it works
            </a>
            <a
              href="#matrix"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[#6B635B] hover:text-[#191513] hover:bg-white"
            >
              Explore
            </a>
            <a
              href="#audit-engine"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[#6B635B] hover:text-[#191513] hover:bg-white"
            >
              Build
            </a>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[#6B635B] hover:text-[#191513] hover:bg-white"
            >
              Docs
            </Link>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-[#1D7A46] font-medium hover:bg-white flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
              <span>Telegram Bot (@VeraOS_Layer_bot)</span>
            </a>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. HERO SECTION                                      */}
      {/* ---------------------------------------------------- */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Category Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E4DC] text-[#6B635B] text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97736]" />
          <span>Verification Infrastructure for AI Agents</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[#191513] tracking-tight leading-[1.08] mb-6">
          Make your AI agent
          <br />
          <span className="text-[#191513]">prove its work.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#6B635B] leading-relaxed mb-8">
          Vera checks whether an AI agent actually completed a task correctly instead of simply trusting its claims. Cryptographically attested, independently verified.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
          <Link
            to="/connect-agent"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>Connect an Agent</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            to="/verify/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D5CEC5] text-[#191513] font-heading font-semibold text-sm transition-all"
          >
            <span>Try the Demo</span>
          </Link>
        </div>

        {/* ---------------------------------------------------- */}
        {/* HERO PRODUCT REVIEW CARD (FIGMA VERIFICATION CARD)   */}
        {/* ---------------------------------------------------- */}
        <div className="relative rounded-[28px] sm:rounded-3xl bg-[#160C08] border border-[#2A2320] p-3 sm:p-5 lg:p-6 shadow-2xl text-left max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            {/* Left Column: Bronze Robot Portrait */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden bg-[#181311] min-h-[300px] md:min-h-[440px] flex items-center justify-center border border-white/5 relative">
              <img
                src="/assets/hero-robot-art.png"
                alt="VeraOS Verification Core Robot"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-3 left-3 bg-[#181311]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-[#FAF8F5] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46] animate-pulse" />
                <span>ACTIVE VERIFIER: {latestVerification?.displayId || "V-8915"}</span>
              </div>
            </div>

            {/* Right Column: Clean White Product Review Card */}
            <div className="md:col-span-7 rounded-2xl bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-left border border-[#E8E4DC] shadow-sm">
              <div>
                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4 ${
                    isPassed
                      ? "bg-[#EAF5EE] text-[#1D7A46]"
                      : "bg-[#FDF2F2] text-[#991B1B]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPassed ? "bg-[#1D7A46]" : "bg-[#991B1B]"
                    }`}
                  />
                  <span>
                    {latestVerification
                      ? latestVerification.status === "PASSED"
                        ? "Verified On-Chain"
                        : latestVerification.status === "FAILED"
                        ? "Verification Failed"
                        : latestVerification.status
                      : "Verified On-Chain"}
                  </span>
                </div>

                {/* Primary Verdict Headline */}
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[30px] text-[#191513] tracking-tight leading-[1.2] mb-3 line-clamp-2">
                  {latestVerification
                    ? latestVerification.taskPrompt
                    : "Transfer 5 USDC on Stellar Testnet confirmed on ledger."}
                </h2>

                {/* Explanation Subtitle */}
                <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed mb-6">
                  {latestVerification
                    ? latestVerification.attempts?.[0]?.summary ||
                      `Attested across ${latestVerification.network || "Stellar"} with independent ledger corroboration.`
                    : "Vera matched the agent claim to the Stellar Horizon ledger receipt, destination account, and USDC asset balance."}
                </p>

                {/* Verification Confidence Bar */}
                <div className="mb-6">
                  <div className="text-[11px] font-semibold text-[#6B635B] tracking-wide mb-1.5 flex justify-between">
                    <span>Verification confidence</span>
                    <span className="font-mono text-[10px] text-[#6B635B]">
                      {latestVerification?.quorum || "Stellar Horizon + Deterministic Kernel"}
                    </span>
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-bold mb-2.5 ${
                      isPassed ? "text-[#1D7A46]" : "text-[#991B1B]"
                    }`}
                  >
                    {isPassed ? "100% deterministic confidence" : "0% invariant violation"}
                  </div>
                  <div className="w-full h-1.5 bg-[#E8E4DC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed ? "bg-[#1D7A46] w-full" : "bg-[#991B1B] w-[35%]"
                      }`}
                    />
                  </div>
                </div>

                {/* Evidence Reviewed Container */}
                <div className="p-4 sm:p-5 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5]/60 mb-6">
                  <div className="font-bold text-xs sm:text-sm text-[#191513] mb-1 flex items-center justify-between">
                    <span>Evidence reviewed</span>
                    <span className="text-[11px] font-mono text-[#D97736]">
                      {latestVerification?.workerName || "Autonomous Worker"}
                    </span>
                  </div>
                  <div className="text-xs text-[#6B635B] leading-relaxed">
                    {latestVerification
                      ? `${latestVerification.attempts?.[0]?.evidence?.length || 3} independent sources · ${
                          latestVerification.status === "PASSED" ? "0 conflicts" : "violations detected"
                        } · ${latestVerification.network || "Stellar Testnet"}`
                      : "3 strong sources · 0 conflicts · all requirements addressed"}
                  </div>
                </div>
              </div>

              {/* Bottom Action CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={latestVerification ? `/verify/${latestVerification.id}` : "/verifications"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer w-fit shadow-sm hover:shadow"
                >
                  <span>Open verification report</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  to="/verifications"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DE] text-[#191513] border border-[#E8E4DC] text-xs sm:text-sm font-medium transition-all"
                >
                  <span>View All ({verifications.length})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. AUDIT ENGINE DECONSTRUCTED (FIGMA IMAGE 1)         */}
      {/* ---------------------------------------------------- */}
      <section id="audit-engine" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E4DC] text-[#D97736] text-xs font-semibold tracking-wider uppercase mb-3">
            <span>Audit Engine Deconstructed</span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-[#191513] tracking-tight mb-4">
            AI agents can act. Vera makes them prove it.
          </h2>
          <p className="text-base text-[#6B635B] leading-relaxed">
            Three independent stages evaluate claims against ground-truth evidence before generating an immutable cryptographic attestation.
          </p>
        </div>

        {/* 2-Column: Stage Cards on Left, Terminal Code on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Stage Cards */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {stages.map((st, i) => (
              <div
                key={st.step}
                onClick={() => setActiveStage(i)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer text-left ${
                  activeStage === i
                    ? "bg-white border-[#181311] shadow-md ring-1 ring-[#181311]"
                    : "bg-white/70 hover:bg-white border-[#E8E4DC] hover:border-[#D5CEC5]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#D97736]">
                    STAGE {st.step} • {st.tag}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F3EFEA] text-[#6B635B]">
                    {st.badge}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-[#191513] mb-2">
                  {st.title}
                </h3>
                <p className="text-sm text-[#6B635B] leading-relaxed">
                  {st.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: MacOS Style Terminal */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#181311] border border-[#2A2320] shadow-2xl overflow-hidden text-left">
              {/* Terminal Title Bar */}
              <div className="px-4 py-3 bg-[#130E0C] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="ml-2 font-mono text-xs text-white/50">
                    schema://requirements.spec.v1.json
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#D97736]">
                  Stage 0{activeStage + 1}
                </span>
              </div>

              {/* Terminal Code Body */}
              <div className="p-5 font-mono text-xs text-[#F3E8DC] overflow-x-auto leading-relaxed max-h-96">
                <pre>{codeSnippets[activeStage]}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. FORENSIC VERIFICATION DEMO MATRIX (IMAGE 1)       */}
      {/* ---------------------------------------------------- */}
      <section id="matrix" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E4DC]">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] text-xs font-medium mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                <span>LIVE AUDIT RECORD</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#191513]">
                Forensic Verification Matrix
              </h2>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
                Real-time attestation for autonomous DeFi worker execution.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/verify/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-xs shadow-sm transition-all"
              >
                <span>Launch Verification Console</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Agent Spec Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F7F5F0] border border-[#E8E4DC] mb-8">
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Agent ID</p>
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5 truncate">
                {latestVerification ? latestVerification.workerName || latestVerification.workerId : "ResearchAgent VR-2048"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Claims Tested</p>
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5">
                {latestVerification ? `${latestVerification.attempts?.[0]?.workerClaims?.length || 2} Claims` : "7 Claims"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Independent Sources</p>
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5">
                {latestVerification ? `${latestVerification.attempts?.[0]?.evidence?.length || 3} Sources` : "11 Sources"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Verdict</p>
              <p
                className={`font-heading font-bold text-sm mt-0.5 flex items-center gap-1 ${
                  isPassed ? "text-[#1D7A46]" : "text-[#991B1B]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPassed ? "check_circle" : "cancel"}
                </span>
                <span>{isPassed ? "100% PASS" : "FAILED"}</span>
              </p>
            </div>
          </div>

          {/* Matrix Checks List */}
          <div className="space-y-3 font-sans">
            {latestVerification && latestVerification.attempts?.[0]?.invariants?.length
              ? latestVerification.attempts[0].invariants.map((inv, idx) => (
                  <div
                    key={inv.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E8E4DC] hover:border-[#D5CEC5] bg-white transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          inv.status === "PASSED"
                            ? "bg-[#EAF5EE] text-[#1D7A46]"
                            : "bg-[#FDF2F2] text-[#991B1B]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {inv.status === "PASSED" ? "check" : "close"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#191513]">
                          {inv.name || inv.description}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B635B] mt-0.5">
                          Observed: {inv.actual} • Expected: {inv.expected}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                      <span className="font-mono text-xs text-[#6B635B]">
                        Latency: {inv.latencyMs ? `${inv.latencyMs}ms` : "< 50ms"}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                          inv.status === "PASSED"
                            ? "bg-[#EAF5EE] text-[#1D7A46] border-[#CDE5D5]"
                            : "bg-[#FDF2F2] text-[#991B1B] border-[#FECACA]"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              : [
                  {
                    id: "CHK-01",
                    label: "Liquidity pool balance delta matched Uniswap v3 sub-graph",
                    source: "Uniswap V3 RPC & Etherscan",
                    status: "PASS",
                    confidence: "100%",
                  },
                  {
                    id: "CHK-02",
                    label: "Gas expenditure strictly within SLA bounds (< 0.015 ETH)",
                    source: "Base L2 Execution Node",
                    status: "PASS",
                    confidence: "100%",
                  },
                  {
                    id: "CHK-03",
                    label: "Output token recipient matched multisig vault address",
                    source: "Safe Protocol Registry",
                    status: "PASS",
                    confidence: "100%",
                  },
                  {
                    id: "CHK-04",
                    label: "Slippage tolerance strictly maintained under 0.5% threshold",
                    source: "Chainlink Price Feed Oracle",
                    status: "PASS",
                    confidence: "100%",
                  },
                ].map((check) => (
                  <div
                    key={check.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E8E4DC] hover:border-[#D5CEC5] bg-white transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#EAF5EE] text-[#1D7A46] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#191513]">
                          {check.label}
                        </p>
                        <p className="font-mono text-[11px] text-[#6B635B] mt-0.5">
                          Ground truth source: {check.source}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                      <span className="font-mono text-xs text-[#6B635B]">
                        Conf: {check.confidence}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
                        {check.status}
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          {/* Matrix Footer Checksum */}
          <div className="mt-6 pt-4 border-t border-[#E8E4DC] flex flex-wrap items-center justify-between text-xs text-[#6B635B] font-mono gap-2">
            <span>
              Root State Commitment:{" "}
              {latestVerification?.stellarTxHash ||
                latestVerification?.attempts?.[0]?.stellarTxHash ||
                "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf"}
            </span>
            <span>
              Network: {latestVerification?.network || "Stellar Testnet"}
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. DARK CTA BANNER (IMAGE 1)                         */}
      {/* ---------------------------------------------------- */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#181311] border border-[#2A2320] p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
              Deploy trustless AI agents with absolute certainty.
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8">
              Integrate the VeraOS verification layer in less than 5 minutes with our lightweight Python & TypeScript SDKs or simple webhook triggers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/connect-agent"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F3E8DC] hover:bg-[#EAE0D3] text-[#181311] font-heading font-semibold text-sm transition-all"
              >
                <span>Connect an Agent</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                to="/docs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent hover:bg-white/5 border border-white/20 text-white font-heading font-semibold text-sm transition-all"
              >
                <span>Read the Docs</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. RFC-0442 FOOTER (IMAGE 1)                         */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-[#E8E4DC] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#181311]" />
            </div>
            <span className="font-heading font-bold text-base text-[#191513]">
              VeraOS
            </span>
            <span className="text-xs text-[#6B635B] font-mono">
              v1.4.spec • RFC-0442 Attestation
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EE] text-[#1D7A46] text-xs font-medium border border-[#CDE5D5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
            <span>All verification engines operational</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#6B635B]">
            <Link to="/docs" className="hover:text-[#191513] transition-colors">
              Docs
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#191513] transition-colors"
            >
              GitHub
            </a>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#191513] transition-colors"
            >
              Telegram (@VeraOS_Layer_bot)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
