import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GITHUB_REPO_URL, TELEGRAM_BOT_URL } from "../config/env";

export const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "overview" | "architecture" | "stellar" | "telegram" | "api" | "security"
  >("overview");

  const sections = [
    { id: "overview", label: "Overview & Problem", icon: "menu_book" },
    { id: "architecture", label: "System Architecture", icon: "schema" },
    { id: "stellar", label: "Stellar Integration", icon: "toll" },
    { id: "telegram", label: "Telegram Bot", icon: "send" },
    { id: "api", label: "REST API Reference", icon: "code" },
    { id: "security", label: "Security & Invariants", icon: "security" },
  ];

  return (
    <div className="min-h-screen bg-[#160C08] text-[#F3E5D5] flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 bg-[#160C08]/90 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <span className="material-symbols-outlined text-[#E08A3E]">verified</span>
            <span>Vera<span className="text-[#E08A3E]">OS</span> Docs</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[#E08A3E] font-mono">v0.2.0</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-[#B9A99B] hover:text-white transition-colors">
            Dashboard
          </Link>
          <a
            href={`${TELEGRAM_BOT_URL}?start=invite_VERA-VIP-2026`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E08A3E] hover:underline flex items-center gap-1"
          >
            <span>Telegram Bot (Auto-Invite)</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B9A99B] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>GitHub</span>
            <span className="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 p-4 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${
                  activeSection === sec.id
                    ? "bg-[#E08A3E]/15 text-[#E08A3E] border border-[#E08A3E]/30"
                    : "text-[#B9A99B] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-8">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">VeraOS Overview</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  The independent verification layer for AI agents. VeraOS independently corroborates agent task
                  claims against authoritative ground-truth evidence before work can be trusted or settled.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-3">
                <h2 className="text-lg font-semibold text-white">The Problem</h2>
                <p className="text-sm text-[#B9A99B] leading-relaxed">
                  Autonomous AI agents are increasingly authorized to conduct financial payments, claim task bounties,
                  and execute smart contracts on Stellar. Today, host platforms trust the agent's text output blindly.
                  If an agent claims it paid 5 USDC but actually sent 0.5 USDC or a hallucinated transaction hash,
                  the deficit passes unnoticed.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-3">
                <h2 className="text-lg font-semibold text-white">The Solution: Verify Before You Trust</h2>
                <p className="text-sm text-[#B9A99B] leading-relaxed">
                  VeraOS sits between the agent and task settlement. It extracts requirements from the task, extracts
                  claims from the worker, independently queries the Stellar Soroban RPC ledger, executes deterministic
                  checks, and produces an immutable structured verdict.
                </p>
              </div>
            </div>
          )}

          {activeSection === "architecture" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Architecture</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  The VeraOS verification engine operates as a five-stage deterministic state machine.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-surface-container border border-white/5">
                  <span className="text-xs font-mono text-[#E08A3E]">Stage 1</span>
                  <h3 className="text-base font-semibold text-white mt-1">Requirement Extractor</h3>
                  <p className="text-sm text-[#B9A99B] mt-1">
                    Converts task prompts into mathematical invariants (amount, asset, recipient, cardinality, bounds).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/5">
                  <span className="text-xs font-mono text-[#E08A3E]">Stage 2</span>
                  <h3 className="text-base font-semibold text-white mt-1">Claim Extractor</h3>
                  <p className="text-sm text-[#B9A99B] mt-1">
                    Parses worker statements and transaction hashes. Worker claims are treated as hypotheses to test,
                    never as evidence.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/5">
                  <span className="text-xs font-mono text-[#E08A3E]">Stage 3</span>
                  <h3 className="text-base font-semibold text-white mt-1">Deterministic Check Engine</h3>
                  <p className="text-sm text-[#B9A99B] mt-1">
                    Queries Stellar Soroban RPC and decodes Envelope XDR with `@stellar/stellar-sdk` to evaluate ground truth.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/5">
                  <span className="text-xs font-mono text-[#E08A3E]">Stage 4</span>
                  <h3 className="text-base font-semibold text-white mt-1">Mathematical Verdict Synthesizer</h3>
                  <p className="text-sm text-[#B9A99B] mt-1">
                    Emits a structured status (`VERIFIED` or `FAILED`), calculating exact delta differences (e.g. `-4.50 USDC`).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-white/5">
                  <span className="text-xs font-mono text-[#E08A3E]">Stage 5</span>
                  <h3 className="text-base font-semibold text-white mt-1">Remediation Engine</h3>
                  <p className="text-sm text-[#B9A99B] mt-1">
                    Generates concrete, actionable directives so the agent can self-correct and resubmit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "stellar" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Stellar Testnet Integration</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  Real, live Stellar blockchain artifacts validated on the public Testnet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-container border border-red-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">Deceptive Transaction</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">0.50 USDC actual</span>
                  </div>
                  <p className="text-xs text-[#B9A99B] mb-2">
                    Worker claimed 5.00 USDC, but the actual transaction transferred only 0.50 USDC:
                  </p>
                  <a
                    href="https://stellar.expert/explorer/testnet/tx/108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#E08A3E] hover:underline break-all flex items-center gap-1"
                  >
                    <span>108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-surface-container border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Corrected Transaction</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">5.00 USDC actual</span>
                  </div>
                  <p className="text-xs text-[#B9A99B] mb-2">
                    The corrected transaction transferring the full required 5.00 USDC:
                  </p>
                  <a
                    href="https://stellar.expert/explorer/testnet/tx/62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-emerald-400 hover:underline break-all flex items-center gap-1"
                  >
                    <span>62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeSection === "telegram" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Telegram Bot Interface</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  Interact with the VeraOS verification engine directly from Telegram via long polling or webhooks.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-4 font-mono text-xs">
                <div><span className="text-[#E08A3E]">/start</span> — Brand greeting and command list</div>
                <div><span className="text-[#E08A3E]">/verify</span> — Start verification (interactive or inline)</div>
                <div><span className="text-[#E08A3E]">/status &lt;id&gt;</span> — Check current verdict status</div>
                <div><span className="text-[#E08A3E]">/evidence &lt;id&gt;</span> — View onchain evidence & explorer links</div>
                <div><span className="text-[#E08A3E]">/correct &lt;id&gt;</span> — Issue remediation directives</div>
                <div><span className="text-[#E08A3E]">/resubmit &lt;id&gt;</span> — Resubmit updated worker claim</div>
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">REST API Reference</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  Run verifications via standard HTTP endpoints.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">POST</span>
                  <span className="text-white">/v1/verify</span>
                </div>
                <pre className="p-3 rounded bg-black/40 text-xs font-mono text-[#B9A99B] overflow-x-auto">
{`curl -X POST http://localhost:5173/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L.",
    "worker": {
      "id": "agent-alpha-09",
      "output": "Sent 5 USDC via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759."
    }
  }'`}
                </pre>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Security & Invariant Enforcement</h1>
                <p className="text-[#B9A99B] text-base leading-relaxed">
                  VeraOS operates a zero-trust verification kernel for autonomous agent workflows, ensuring actions are cryptographically proven against real ledger state before execution or settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#E08A3E] font-semibold text-sm">
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    <span>Deterministic Evaluation</span>
                  </div>
                  <p className="text-xs text-[#B9A99B] leading-relaxed">
                    Zero hallucinations in evaluation. Agent claims are parsed into mathematical invariants and validated directly against Stellar Horizon RPC transactions.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <span className="material-symbols-outlined text-lg">enhanced_encryption</span>
                    <span>Edge Isolation & Cryptography</span>
                  </div>
                  <p className="text-xs text-[#B9A99B] leading-relaxed">
                    Runs on Cloudflare global edge with Web Crypto SHA-256 password hashing, HMAC-SHA256 session integrity, and zero client-side secret exposure.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container border border-white/5 space-y-3">
                <h3 className="text-base font-semibold text-white">Enterprise Compliance Standards</h3>
                <ul className="list-disc list-inside text-sm text-[#B9A99B] space-y-2">
                  <li><strong className="text-white">Audit Trail Logging:</strong> Every verification, user authentication, and wallet connection is recorded immutably in Cloudflare D1.</li>
                  <li><strong className="text-white">Tamper-Proof Proofs:</strong> Verification reports include full cryptographic evidence hashes and direct Stellar Expert explorer links.</li>
                  <li><strong className="text-white">Role-Based Access:</strong> Whitelist-gated access with single-use and multi-use cryptographically generated VIP invite tokens.</li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
