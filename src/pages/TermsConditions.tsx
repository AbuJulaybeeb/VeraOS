import React from "react";
import { Link } from "react-router-dom";
import { GITHUB_REPO_URL } from "../config/env";

export const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#160C08] text-[#F3E5D5] flex flex-col selection:bg-[#E08A3E]/30 selection:text-white">
      {/* Top Navigation Header */}
      <header className="h-16 border-b border-white/5 bg-[#160C08]/90 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white group">
            <span className="material-symbols-outlined text-[#E08A3E] transition-transform group-hover:scale-110">
              verified
            </span>
            <span>
              Vera<span className="text-[#E08A3E]">OS</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded bg-white/5 text-[#B9A99B] border border-white/5 font-mono">
            Legal &amp; Compliance
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-[#B9A99B] hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="text-[#B9A99B] hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/docs" className="text-[#B9A99B] hover:text-white transition-colors">
            Docs
          </Link>
          <Link
            to="/privacy"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors font-medium"
          >
            Privacy Policy
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Header Section */}
        <div className="space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E08A3E]/10 border border-[#E08A3E]/30 text-[#E08A3E] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse" />
            <span>Master Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-[#B9A99B] text-base leading-relaxed">
            Effective Date: <span className="text-white font-medium">September 20, 2026</span> • Last Updated: <span className="text-white font-medium">September 20, 2026</span>
          </p>
          <p className="text-sm text-[#F3E5D5]/80 leading-relaxed bg-[#1C0F0A] p-4 rounded-xl border border-white/5">
            Please read these Terms &amp; Conditions (“Terms”) carefully before accessing or utilizing the <strong>VeraOS</strong> platform, including our web dashboard, edge APIs, smart contract interfaces, and gated Telegram verification bots. By visiting the website, connecting an agent, authenticating via Google or Stellar wallets, or redeeming an invite link, you agree to be legally bound by these Terms.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Deterministic Verification</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              VeraOS audits agent execution payloads against verifiable onchain invariants and cryptographic consensus rules.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              <span>Gated Bot Access</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              Telegram bot interaction requires valid invite link token redemption. Open, unauthorized bot access is strictly restricted.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>No Financial Advice</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              Verification proofs attest only to computational and onchain consistency, not investment suitability or financial advisory.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-[#F3E5D5]/90">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">01.</span>
              <span>Acceptance &amp; Scope of Agreement</span>
            </h2>
            <p className="text-[#B9A99B]">
              These Terms constitute an enforceable legal agreement between you (“User”, “Operator”, or “Enterprise”) and VeraOS (“we”, “us”, or “our”). If you are entering into these Terms on behalf of an enterprise, company, or organizational entity, you represent and warrant that you possess full authority to bind that entity to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">02.</span>
              <span>Definitions</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#B9A99B]">
              <li>
                <strong className="text-white">“Autonomous Agent”:</strong> Any artificial intelligence software entity, algorithmic worker, LLM pipeline, or script (including AutoGPT, LangChain, CrewAI, or custom runtime) submitting tasks or actions for audit.
              </li>
              <li>
                <strong className="text-white">“Invariant”:</strong> A deterministic validation rule, mathematical constraint, asset balance requirement, or ledger state condition verified by VeraOS.
              </li>
              <li>
                <strong className="text-white">“Attestation”:</strong> A cryptographic hash or verification receipt generated upon evaluating agent claims against public Stellar ledger consensus.
              </li>
              <li>
                <strong className="text-white">“Telegram Bot Gateway”:</strong> The conversational verification interface accessible via <code className="text-[#E08A3E]">@Vera_Of_bot</code>, secured by cryptographic invite tokens.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">03.</span>
              <span>User Accounts &amp; Authentication</span>
            </h2>
            <p className="text-[#B9A99B]">
              You may access VeraOS via Google OAuth 2.0, Web3 Stellar wallet connection, or email registration. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#B9A99B]">
              <li>Provide accurate and complete registration details where required.</li>
              <li>Maintain the confidentiality and custody of your credentials and connected wallet private keys.</li>
              <li>Immediately notify VeraOS upon discovering any unauthorized session or security compromise.</li>
              <li>Accept sole responsibility for all activity occurring under your authenticated credentials or API keys.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">04.</span>
              <span>Gated Access &amp; Invite System Rules</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#1C0F0A] border border-[#E08A3E]/30 space-y-2">
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                In accordance with VeraOS security governance:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#B9A99B]">
                <li><strong className="text-white">Invite-Only Bot Access:</strong> The Telegram Bot is invite-gated. Users who message the bot without an authorized invite code will be rejected until a legitimate invite token is redeemed.</li>
                <li><strong className="text-white">Single-Use &amp; Revocable Invites:</strong> Shareable invite links generated through the platform or verified operators may be configured for limited uses or revoked at any time.</li>
                <li><strong className="text-white">Prohibited Token Forgery:</strong> Any attempt to brute-force, forge, or exploit invite redemption tokens constitutes a material breach resulting in immediate IP/account banning.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">05.</span>
              <span>Acceptable Use &amp; Prohibited Conduct</span>
            </h2>
            <p className="text-[#B9A99B]">
              When utilizing VeraOS web applications, edge APIs, or bot endpoints, you expressly agree NOT to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#B9A99B]">
              <li>Deploy automated denial-of-service (DDoS) traffic or overwhelm Cloudflare edge endpoints with high-volume malicious queries.</li>
              <li>Submit adversarial prompt injections designed to manipulate verification invariants or deceive the LLM arbitration subsystem.</li>
              <li>Falsify cryptographic hash proofs, forge Stellar transaction headers, or claim nonexistent ledger settlements.</li>
              <li>Reverse engineer, decompile, or tamper with proprietary telemetry sandboxes beyond permitted open-source components.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">06.</span>
              <span>Autonomous Agent Disclaimers &amp; Non-Fiduciary Status</span>
            </h2>
            <p className="text-[#B9A99B]">
              <strong className="text-white">VeraOS is an audit and verification protocol, not an autonomous agent operator:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#B9A99B]">
              <li>
                <strong className="text-white">Operator Responsibility:</strong> You retain complete responsibility for any autonomous agent you connect to VeraOS. VeraOS does not direct agent behavior, execute unpermitted transactions, or hold custody of funds.
              </li>
              <li>
                <strong className="text-white">No Financial or Legal Advice:</strong> VeraOS verification receipts, discrepancy remediation directives, and invariant audits do not constitute financial, investment, accounting, or legal counsel.
              </li>
              <li>
                <strong className="text-white">Blockchain Non-Reversibility:</strong> Transactions committed to the Stellar blockchain or executed through Soroban smart contracts are decentralized, final, and irreversible. VeraOS has no power to unwind or refund blockchain transactions.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">07.</span>
              <span>Intellectual Property &amp; Open Source</span>
            </h2>
            <p className="text-[#B9A99B]">
              The core VeraOS client repository and smart contract libraries are made available under open-source licenses as designated in the GitHub repository. All proprietary trademarks, logos, brand assets, and service names belong exclusively to VeraOS.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">08.</span>
              <span>Disclaimer of Warranties</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
              <p className="text-xs text-[#B9A99B] uppercase font-mono tracking-wider leading-relaxed">
                THE VERAOS PLATFORM, APIS, TELEGRAM BOT GATEWAY, AND VERIFICATION OUTPUTS ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED ERROR-FREE OPERATION.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">09.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-[#B9A99B]">
              To the maximum extent permitted by applicable law, in no event shall VeraOS, its developers, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data corruption, blockchain network gas fees, or autonomous agent execution losses arising out of or related to your use of the platform.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">10.</span>
              <span>Modifications to Service &amp; Terms</span>
            </h2>
            <p className="text-[#B9A99B]">
              We reserve the right to revise or update these Terms at any time to reflect protocol upgrades, regulatory compliance mandates, or security enhancements. Continued use of VeraOS following posted revisions constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">11.</span>
              <span>Contact &amp; Governance</span>
            </h2>
            <p className="text-[#B9A99B]">
              If you have any questions or require legal clarification regarding these Terms, please contact our team:
            </p>
            <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-white">VeraOS Governance &amp; Legal Desk</span>
                <p className="text-xs text-[#B9A99B] mt-0.5">Autonomous Agent Invariant Verification Protocol</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <span>GitHub Repository</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9A99B]">
          <span>© 2026 VeraOS. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
