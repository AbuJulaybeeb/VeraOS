import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAgentContext } from "../context/AgentContext";
import { AgentHeaderWidget } from "../components/agent/AgentHeaderWidget";
import { InteractiveVerifyWidget } from "../components/verification/InteractiveVerifyWidget";
import { HeroFlowingWave } from "../components/landing/HeroFlowingWave";
import { TELEGRAM_PERMANENT_INVITE_URL, GITHUB_REPO_URL } from "../config/env";
import { InviteLinkModal } from "../components/invite/InviteLinkModal";
﻿import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"claim" | "evidence">("claim");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState<number>(0);

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
      q: "Can I use VeraOS without writing code?",
      a: "Yes! You can interact directly with our verified Telegram bot (@VeraOS_Layer_bot) on mobile or desktop to verify tasks, audit evidence, and approve remediation loops using natural language. You can also use the Web Dashboard to monitor all connected agents.",
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

  const pipelineSteps = [
    { num: "01", name: "Origin", active: false },
    { num: "02", name: "Payload", active: false },
    { num: "03", name: "Transport", active: false },
    { num: "04", name: "Arbiter: VeraOS Core", active: true },
    { num: "05", name: "Spec", active: false },
    { num: "06", name: "Assertions", active: false },
    { num: "07", name: "Proof", active: false },
    { num: "08", name: "Verdict: PASS", active: false },
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
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46] animate-pulse" />
              <span>Telegram Active</span>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Telegram Bot Link */}
            <a
              href={TELEGRAM_PERMANENT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#20110A] border border-[#4A2B1D]/80 text-[#B9A99B] hover:text-[#FFF8F0] text-xs font-medium transition-colors cursor-pointer"
              title="Open Telegram Bot with Permanent Invite"
            >
              <svg className="w-3.5 h-3.5 fill-[#E08A3E]" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>Open Telegram</span>
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

            {/* Wallet-Style Agent Connector — hidden on small mobile to prevent squishing */}
            <div className="hidden sm:block">
              <AgentHeaderWidget />
            </div>

            {/* User Auth or Sign In */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-[#B9A99B] font-mono">
                  {user?.name || user?.email?.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-[#B9A99B] hover:text-white transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="hidden md:inline-flex text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] px-2 py-1 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Primary CTA */}
            <Link
              to="/verify/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#C96A2B] via-[#D87431] to-[#E08A3E] hover:from-[#D87431] hover:to-[#E59247] shadow-[0_0_18px_rgba(201,106,43,0.4)] active:scale-[0.98] transition-all whitespace-nowrap min-h-[36px]"
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
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center bg-[#20110A] border border-[#4A2B1D] text-[#B9A99B] hover:text-[#FFF8F0] min-w-[36px] min-h-[36px] cursor-pointer"
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
          <div className="lg:hidden max-w-6xl mx-auto mt-2 p-4 rounded-2xl bg-[#160C08]/95 backdrop-blur-2xl border border-[#4A2B1D] shadow-2xl flex flex-col gap-2.5 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-xs font-medium text-[#B9A99B] hover:text-white rounded-lg hover:bg-white/5 transition-colors">Product</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-xs font-medium text-[#B9A99B] hover:text-white rounded-lg hover:bg-white/5 transition-colors">How it works</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-xs font-medium text-[#B9A99B] hover:text-white rounded-lg hover:bg-white/5 transition-colors">Use cases</a>
            <a href="#developers" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-xs font-medium text-[#B9A99B] hover:text-white rounded-lg hover:bg-white/5 transition-colors">Developers</a>
            <Link to="/docs" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-xs font-medium text-[#B9A99B] hover:text-white rounded-lg hover:bg-white/5 transition-colors">Docs</Link>

            <div className="pt-2 border-t border-[#4A2B1D]/50 flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#20110A] text-xs">
                <span className="text-[#B9A99B]">Agent:</span>
                <AgentHeaderWidget />
              </div>
              <a
                href={TELEGRAM_PERMANENT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#20110A] text-xs text-[#E08A3E] font-medium text-left cursor-pointer"
              >
                <span>Open Telegram (Permanent Invite)</span>
                <span className="material-symbols-outlined text-[14px]">send</span>
              </a>
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#20110A] text-xs">
                  <span className="text-[#B9A99B] font-mono truncate">{user?.name || user?.email}</span>
                  <button onClick={logout} className="text-[#E08A3E] hover:text-white font-semibold cursor-pointer">Sign Out</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); openAuthModal("signin"); }}
                  className="w-full text-center px-4 py-2 rounded-xl bg-[#20110A] border border-[#4A2B1D] text-[#FFF8F0] font-medium text-xs block cursor-pointer"
                >
                  Sign In
                </button>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-[#C96A2B] text-white font-semibold text-xs block"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. HERO SECTION                                      */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[92vh] flex flex-col items-center justify-center text-center">
        {/* Ambient Flowing Silk Wave Background */}
        <HeroFlowingWave />

        {/* Hero Card Container (Subtle Translucent Rectangular Surface) */}
        <div className="relative z-10 max-w-5xl mx-auto w-full rounded-3xl bg-[#21110B]/30 backdrop-blur-md border border-[#4A2B1D]/60 p-6 sm:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.7)] flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E08A3E]/15 border border-[#E08A3E]/35 text-[#E08A3E] text-[11px] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse" />
            <span>ZERO-TRUST AGENT EXECUTION</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-headline-lg text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFF8F0] leading-[1.08] max-w-3xl mb-6">
            Know when your AI agent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A3D] via-[#E08A3E] to-[#FF5708]">
              actually finished the job.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#B9A99B] max-w-2xl leading-relaxed mb-8 font-normal">
            The deterministic verification layer for autonomous agents. Validate task completion,
            inspect real onchain evidence, and prevent payout on unperformed work.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 mb-8 w-full sm:w-auto">
            <Link
              to="/verify/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white text-sm font-semibold transition-all shadow-[0_0_24px_rgba(201,106,43,0.45)] active:scale-[0.98] min-h-[44px]"
            >
              <span>Verify a task</span>
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </Link>

            <a
              href={TELEGRAM_PERMANENT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1A0E08]/80 hover:bg-[#2C1710] border border-[#4A2B1D] text-[#FFF8F0] text-sm font-medium transition-all shadow-sm group cursor-pointer min-h-[44px]"
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

            <button
              type="button"
              onClick={() => openConnectModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#20110A] hover:bg-[#2C1710] border border-dashed border-[#E08A3E]/40 text-[#E08A3E] text-sm font-medium transition-all min-h-[44px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Connect Agent</span>
            </button>
          </div>

          {/* Trust Highlights Row */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#B9A99B] pt-4 border-t border-white/5 w-full">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Deterministic Verification
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Real Stellar RPC Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Zero-Custody Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span> Sub-Second Telemetry
            </span>
          </div>

          {/* -------------------------------------------------- */}
          {/* HERO PRODUCT PREVIEW (SPLIT INSPECTOR WINDOW)      */}
          {/* -------------------------------------------------- */}
          <div className="w-full mt-10 rounded-2xl bg-[#140A06] border border-[#4A2B1D] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden text-left">
            {/* Window Chrome Header */}
            <div className="px-4 py-2.5 bg-[#1C0E09] border-b border-[#4A2B1D]/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-[#B9A99B] truncate max-w-[170px] sm:max-w-none">
                  task_verification_console.ts
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Stellar Testnet Horizon</span>
                <span className="sm:hidden">Stellar RPC</span>
              </div>
            </div>

            {/* Mobile Tab Switcher for Inspector Window */}
            <div className="flex lg:hidden border-b border-[#4A2B1D]/70 bg-[#1A0E08]">
              <button
                type="button"
                onClick={() => setInspectorTab("claim")}
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors cursor-pointer ${
                  inspectorTab === "claim"
                    ? "text-[#E08A3E] border-b-2 border-[#E08A3E] bg-[#21110B]/50"
                    : "text-[#B9A99B] hover:text-white"
                }`}
              >
                1. Task & Claim
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab("evidence")}
                className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors cursor-pointer ${
                  inspectorTab === "evidence"
                    ? "text-[#E08A3E] border-b-2 border-[#E08A3E] bg-[#21110B]/50"
                    : "text-[#B9A99B] hover:text-white"
                }`}
              >
                2. Onchain Verdict
              </button>
            </div>

            {/* Split Screen Body */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#4A2B1D]/60 p-4 sm:p-6 gap-6 bg-[#160C08]/95">
              {/* Left Pane: Task & Claimed Output */}
              <div className={`flex flex-col gap-4 ${inspectorTab === "claim" ? "flex" : "hidden lg:flex"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E08A3E]">
                    TASK & CLAIMED DELIVERABLE
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#2C1710] text-[#B9A99B] font-mono">
                    Runtime: ElizaOS-01
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C0E09] border border-[#4A2B1D]/60 flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#B9A99B] font-medium">Task Specification:</span>
                  <p className="text-xs text-[#FFF8F0] font-mono break-words">
                    &quot;Execute 5.00 USDC settlement payment to recipient GCEYA... for protocol TVL analysis.&quot;
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C0E09] border border-[#4A2B1D]/60 flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#B9A99B] font-medium">Claimed Agent Output:</span>
                  <p className="text-xs text-[#FFF8F0] font-mono leading-relaxed break-all">
                    &quot;Payment complete. Transferred 5.00 USDC to recipient GCEYAUYCI3WTE5...
                    <br />
                    <span className="text-[#E08A3E]">TxHash: 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf</span>&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#B9A99B] font-mono pt-1">
                  <span>Latency: 218ms</span>
                  <span>Ledger #620194</span>
                </div>
              </div>

              {/* Right Pane: Deterministic Evidence & Verdict */}
              <div className={`flex flex-col gap-4 lg:pl-6 ${inspectorTab === "evidence" ? "flex" : "hidden lg:flex"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E08A3E]">
                    DETERMINISTIC VERDICT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[#1C0E09] border border-[#4A2B1D]/60 flex items-center justify-between text-[#FFF8F0]">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Tx Hash Existence
                    </span>
                    <span className="text-[11px] text-emerald-400">Found on Horizon</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#1C0E09] border border-[#4A2B1D]/60 flex items-center justify-between text-[#FFF8F0]">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Exact Amount Check
                    </span>
                    <span className="text-[11px] text-emerald-400">5.00 USDC Match</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#1C0E09] border border-[#4A2B1D]/60 flex items-center justify-between text-[#FFF8F0]">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Destination Match
                    </span>
                    <span className="text-[11px] text-emerald-400">GCEYA... Verified</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#1C0E09] border border-[#4A2B1D]/60 flex items-center justify-between text-[#FFF8F0]">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> Execution Outcome
                    </span>
                    <span className="text-[11px] text-emerald-400">tx_SUCCESS</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Escrow release authorized.</span>
                  <span className="font-mono font-bold">100% PASS</span>
                </div>
              </div>
            </div>
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
        {/* HERO VISUAL CARD (GOLDEN ROBOT ART FROM FIGMA)       */}
        {/* ---------------------------------------------------- */}
        <div className="relative rounded-3xl bg-[#181311] border border-[#2A2320] overflow-hidden shadow-2xl text-left max-w-4xl mx-auto">
          {/* Top metadata status header inside visual card */}
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#140F0D]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D7A46]/20 border border-[#1D7A46]/40 text-[#4ADE80] text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                <span>Verified v1.4</span>
              </span>
              <span className="font-mono text-xs text-white/60">
                Instance #VR-2048
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-white/70">
              <span>Proof: 0x17fa...60c0</span>
              <span className="hidden sm:inline text-white/30">â€¢</span>
              <span className="hidden sm:inline text-[#D97736]">
                280ms â€¢ Zero-Knowledge Attested
              </span>
            </div>
          </div>

          {/* Golden Robot Art Illustration */}
          <div className="relative h-64 sm:h-96 w-full bg-[#181311] overflow-hidden flex items-center justify-center">
            <img
              src="/assets/hero-robot-art.png"
              alt="VeraOS Verification Core Robot"
              className="w-full h-full object-cover object-center opacity-90 hover:scale-102 transition-transform duration-700"
            />

            {/* Inset Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-[#181311]/90 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-heading font-semibold text-xs text-white">
                  ResearchAgent VR-2048
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1D7A46] text-white">
                  100% PASS
                </span>
              </div>
              <p className="text-xs text-white/70">
                Claim: Uniswap v3 Rebalance & Vault Settlement
              </p>
              <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-white/50">
                <span>7 Checks</span>
                <span>â€¢</span>
                <span>11 Independent Sources</span>
                <span>â€¢</span>
                <span className="text-[#D97736]">ZK Grounded</span>
              </div>
            </div>
          </div>

          {/* 8-Step Verification Pipeline Bar (Image 1 Bottom of Card) */}
          <div className="bg-[#120D0B] border-t border-white/10 p-3 sm:p-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px] text-xs">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={step.num}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    step.active
                      ? "bg-[#D97736]/20 border border-[#D97736] text-[#F3E8DC] font-semibold"
                      : "text-white/50"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60">{step.num}</span>
                  <span>{step.name}</span>
                  {idx < pipelineSteps.length - 1 && (
                    <span className="material-symbols-outlined text-[14px] opacity-30 ml-1.5">
                      chevron_right
                    </span>
                  )}
                </div>
              ))}
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

        {/* Embedded Live Engine Console */}
        <InteractiveVerifyWidget />
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. VERIFY WORK WHEREVER YOUR AGENT RUNS              */}
      {/* ---------------------------------------------------- */}
      <section id="channels" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#4A2B1D]/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#E08A3E] mb-2">
            MULTI-CHANNEL AUDITING
          </div>
          <h2 className="font-headline-lg text-3xl sm:text-5xl font-bold tracking-tight text-[#FFF8F0] mb-4">
            Verify work wherever your agent runs.
          </h2>
          <p className="text-sm sm:text-base text-[#B9A99B] leading-relaxed">
            Access continuous verification whether managing fleets from desktop, chatting on Telegram, or calling via code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Dashboard */}
          <div className="p-8 rounded-2xl bg-[#160C08] border border-[#4A2B1D]/80 flex flex-col justify-between hover:border-[#E08A3E]/40 transition-colors shadow-lg">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-[#E08A3E] uppercase mb-3">
                ANALYTICS & FLEET CONTROL
              </div>
              <h3 className="font-bold text-xl text-[#FFF8F0] mb-2">Web Dashboard</h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed mb-6">
                Review agent work from one central place. Inspect historical execution traces, telemetry analytics, worker reliability scores, and verification receipts.
              </p>
              <div className="p-3.5 rounded-xl bg-[#1C0E09] border border-[#4A2B1D]/50 mb-6 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-[#B9A99B]"><span>Active Agents:</span> <span className="text-white">12</span></div>
                <div className="flex justify-between text-[#B9A99B]"><span>Success Rate:</span> <span className="text-emerald-400">99.4%</span></div>
                <div className="flex justify-between text-[#B9A99B]"><span>Avg Latency:</span> <span className="text-[#E08A3E]">218ms</span></div>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E08A3E] hover:text-[#FFF8F0] transition-colors"
            >
              <span>Open Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 2: Telegram */}
          <div className="p-8 rounded-2xl bg-[#1F100A] border border-[#E08A3E]/50 flex flex-col justify-between shadow-[0_10px_35px_rgba(201,106,43,0.15)]">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-[#E08A3E] uppercase mb-3">
                MOBILE & CHAT WORKFLOW
              </div>
              <h3 className="font-bold text-xl text-[#FFF8F0] mb-2">Telegram Bot</h3>
              <p className="text-xs sm:text-sm text-[#B9A99B] leading-relaxed mb-6">
                Verify agent work directly from your Telegram workflow. Check task status, view Stellar evidence, and resolve remediation loops without leaving chat.
              </p>
              <div className="p-3.5 rounded-xl bg-[#160C08] border border-[#4A2B1D]/50 mb-6 text-xs space-y-2">
                <div className="text-[#B9A99B] font-mono">User: /verify Task: Send 5 USDC...</div>
                <div className="text-emerald-400 font-mono font-medium">@VeraOS_Layer_bot: ✅ VERIFIED (Stellar Tx #620194)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E08A3E] hover:text-[#FFF8F0] transition-colors cursor-pointer"
            >
              <span>Launch @VeraOS_Layer_bot (Invite Link)</span>
              <span className="material-symbols-outlined text-[14px]">send</span>
            </button>
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
                    STAGE {st.step} â€¢ {st.tag}
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
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5">
                ResearchAgent VR-2048
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Claims Tested</p>
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5">
                7 Claims
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Independent Sources</p>
              <p className="font-heading font-bold text-sm text-[#191513] mt-0.5">
                11 Sources
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[#6B635B] uppercase">Verdict</p>
              <p className="font-heading font-bold text-sm text-[#1D7A46] mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>100% PASS</span>
              </p>
            </div>
          </div>

          {/* Matrix Checks List */}
          <div className="space-y-3 font-sans">
            {[
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
            <span>Root State Commitment: 0x56Ce26F3d01F9b31DeA678e722c83b89091</span>
            <span>Zero-Knowledge Proof: GROTH16_BN254</span>
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
              v1.4.spec â€¢ RFC-0442 Attestation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            <div>
              <div className="font-bold text-[#FFF8F0] uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2 text-[#B9A99B]">
                <li><a href="#problem" className="hover:text-white transition-colors">Visibility Gap</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#interactive-verify" className="hover:text-white transition-colors">Verification Console</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-[#FFF8F0] uppercase tracking-wider mb-3">Resources</div>
              <ul className="space-y-2 text-[#B9A99B]">
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li><a href="https://soroban-testnet.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Stellar RPC</a></li>
                <li><a href="https://horizon-testnet.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Stellar Horizon</a></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-[#FFF8F0] uppercase tracking-wider mb-3">Connect</div>
              <ul className="space-y-2 text-[#B9A99B]">
                <li>
                  <a
                    href={TELEGRAM_PERMANENT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors cursor-pointer text-left inline-flex items-center gap-1.5"
                  >
                    <span>Telegram Bot (@VeraOS_Layer_bot)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E] border border-[#E08A3E]/30 font-medium">Invite</span>
                  </a>
                </li>
                <li><Link to="/agents" className="hover:text-white transition-colors">Agent Registry</Link></li>
                <li><Link to="/agents/connect" className="hover:text-white transition-colors">Connect Agent</Link></li>
                <li><Link to="/invite" className="hover:text-white transition-colors">Invite Portal</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-[#FFF8F0] uppercase tracking-wider mb-3">Legal &amp; Trust</div>
              <ul className="space-y-2 text-[#B9A99B]">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Security Invariants</Link></li>
                <li><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ledger Explorer</a></li>
              </ul>
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
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#191513] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#191513] transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
