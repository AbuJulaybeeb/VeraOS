import React from "react";
import { Link } from "react-router-dom";
import { GITHUB_REPO_URL } from "../config/env";

export const PrivacyPolicy: React.FC = () => {
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
            to="/terms"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors font-medium"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Header Section */}
        <div className="space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E08A3E]/10 border border-[#E08A3E]/30 text-[#E08A3E] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse" />
            <span>GDPR &amp; Global Privacy Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[#B9A99B] text-base leading-relaxed">
            Effective Date: <span className="text-white font-medium">September 20, 2026</span> • Last Updated: <span className="text-white font-medium">September 20, 2026</span>
          </p>
          <p className="text-sm text-[#F3E5D5]/80 leading-relaxed bg-[#1C0F0A] p-4 rounded-xl border border-white/5">
            At <strong>VeraOS</strong> (“we”, “us”, or “our”), we operate an enterprise-grade autonomous AI agent verification protocol anchored to the Stellar blockchain and deployed on Cloudflare edge computing infrastructure. This Privacy Policy details the types of personal data and cryptographic payloads we collect, how that information is processed, your statutory rights, and our zero-trust data protection principles.
          </p>
        </div>

        {/* Quick Summary Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Zero-Trust Privacy</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              Operator credentials, salted passwords, and Google OAuth tokens are handled using Web Crypto SHA-256 and never shared.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">toll</span>
              <span>Stellar Ground Truth</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              Blockchain transactions and Soroban smart contract calls are public and immutable on the decentralized Stellar ledger.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5">
            <div className="flex items-center gap-2 text-[#E08A3E] text-sm font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span>Edge Data Isolation</span>
            </div>
            <p className="text-xs text-[#B9A99B]">
              Verification workloads execute in Cloudflare edge worker isolates with strict sandboxing and minimal persistent retention.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-[#F3E5D5]/90">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">01.</span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-[#B9A99B]">
              Depending on how you interact with VeraOS (via our web dashboard, REST API, or gated Telegram Bot), we collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#B9A99B]">
              <li>
                <strong className="text-white">Account &amp; Identity Credentials:</strong> When you authenticate via Google OAuth, we receive your name, email address, profile photo URL, and unique Google account identifier. When registering via email, we store your email address and salted SHA-256 password hash.
              </li>
              <li>
                <strong className="text-white">Stellar Public Keys &amp; Wallet Addresses:</strong> If you connect an onchain wallet (e.g., Freighter, Albedo, Lobstr), we collect and store your public G-address (Ed25519 public key) to verify authorizations and correlate operator transactions. <em>We never access, request, or store private secret keys (S-keys) or recovery seed phrases.</em>
              </li>
              <li>
                <strong className="text-white">Autonomous Agent Telemetry:</strong> Verification payloads submitted to the engine—including natural language task descriptions, claimed agent outputs, execution logs, runtime identifiers (e.g., LangChain, AutoGPT, CrewAI), and transaction hashes.
              </li>
              <li>
                <strong className="text-white">Telegram Gateway Data:</strong> For users accessing our gated Telegram Bot (<code className="text-[#E08A3E]">@Vera_Of_bot</code>), we process your Telegram user ID, username, invite link redemption status, and conversational verification queries.
              </li>
              <li>
                <strong className="text-white">Technical &amp; Network Telemetry:</strong> IP address (processed at Cloudflare edge for DDoS mitigation and geolocation routing), browser user agent, device type, HTTP referrer headers, and system diagnostic logs.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">02.</span>
              <span>How We Use Your Information</span>
            </h2>
            <p className="text-[#B9A99B]">
              We utilize collected information solely for legitimate operational, security, and verification purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#B9A99B]">
              <li>
                <strong className="text-white">Deterministic Invariant Verification:</strong> Corroborating agent output claims against live Stellar Horizon RPC nodes and Soroban smart contracts to generate cryptographic audit proofs.
              </li>
              <li>
                <strong className="text-white">Access Control &amp; Rate Limiting:</strong> Enforcing invite-only access to our Telegram bot, preventing denial-of-service floods, and ensuring only authorized operators execute edge verification pipelines.
              </li>
              <li>
                <strong className="text-white">Platform Authentication:</strong> Maintaining secure operator sessions, synchronizing active agent configurations, and providing access to historical verification receipts.
              </li>
              <li>
                <strong className="text-white">Audit Trail Delivery:</strong> Allowing enterprise operators to download cryptographic evidence bundles, cryptographic hashes, and discrepancy remediation instructions.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">03.</span>
              <span>Blockchain Transparency &amp; Public Ledger Data</span>
            </h2>
            <div className="p-4 rounded-xl bg-[#1C0F0A] border border-[#E08A3E]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#E08A3E] font-semibold">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Important Public Ledger Notice</span>
              </div>
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                By design, transactions on the <strong>Stellar Network</strong> (including transaction hashes, source account addresses, payment amounts, asset codes, and Soroban contract states) are public, transparent, and immutably written to a decentralized blockchain. VeraOS does not control the Stellar consensus mechanism and cannot alter, redact, or expunge data once finalized on the distributed ledger.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">04.</span>
              <span>Sub-Processors &amp; Third-Party Services</span>
            </h2>
            <p className="text-[#B9A99B]">
              VeraOS integrates with select high-security infrastructure providers to deliver our edge verification protocol:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-[#1C0F0A] border border-white/5">
                <span className="font-semibold text-white">Cloudflare, Inc.</span>
                <p className="text-xs text-[#B9A99B] mt-1">
                  Global edge worker execution, D1 SQL storage, KV cache, and TLS termination.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1C0F0A] border border-white/5">
                <span className="font-semibold text-white">Google Identity Services</span>
                <p className="text-xs text-[#B9A99B] mt-1">
                  Secure OAuth 2.0 authentication and identity federation.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1C0F0A] border border-white/5">
                <span className="font-semibold text-white">Stellar Development Foundation</span>
                <p className="text-xs text-[#B9A99B] mt-1">
                  Public Horizon &amp; Soroban RPC API infrastructure for blockchain state querying.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#1C0F0A] border border-white/5">
                <span className="font-semibold text-white">Telegram Messenger Inc.</span>
                <p className="text-xs text-[#B9A99B] mt-1">
                  Bot API delivery for gated conversational operator audits and alerts.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">05.</span>
              <span>Local Storage &amp; Cookie Usage</span>
            </h2>
            <p className="text-[#B9A99B]">
              VeraOS does not employ invasive advertising cookies or cross-site tracking pixels. We only utilize standard browser LocalStorage for essential session maintenance:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono text-[#B9A99B]">
              <li><code className="text-[#E08A3E]">veraos_auth_token_v2</code>: Authenticated operator session JWT token</li>
              <li><code className="text-[#E08A3E]">veraos_user_v2</code>: Cached user profile display attributes</li>
              <li><code className="text-[#E08A3E]">veraos_theme</code>: User UI appearance preference (dark / warm amber)</li>
              <li><code className="text-[#E08A3E]">veraos_active_agent_id</code>: Selected connected agent interface ID</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">06.</span>
              <span>Data Retention &amp; Security Controls</span>
            </h2>
            <p className="text-[#B9A99B]">
              We enforce enterprise security standards across all layers of our architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#B9A99B]">
              <li>
                <strong className="text-white">Encryption:</strong> All network traffic is encrypted via TLS 1.3 in transit. Relational records stored in Cloudflare D1 are encrypted at rest with AES-256.
              </li>
              <li>
                <strong className="text-white">Retention Period:</strong> Verification audit records are retained for thirty (30) days by default to permit operator review, after which non-blockchain payloads can be purged upon operator request.
              </li>
              <li>
                <strong className="text-white">Zero Custody:</strong> VeraOS never possesses custodial access to your cryptocurrency or private keys.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">07.</span>
              <span>Your Statutory Rights (GDPR &amp; CCPA)</span>
            </h2>
            <p className="text-[#B9A99B]">
              Subject to applicable jurisdictional data protection laws, you retain the following rights regarding personal data held directly by VeraOS:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#B9A99B]">
              <li>The right to request access to your stored account profile and verification receipts.</li>
              <li>The right to rectify inaccurate personal profile information.</li>
              <li>The right to request deletion of your VeraOS database account and associated telemetry (excluding decentralized onchain Stellar ledger records).</li>
              <li>The right to export your data in a machine-readable JSON format.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#E08A3E] font-mono text-base">08.</span>
              <span>Contact &amp; Data Protection Inquiries</span>
            </h2>
            <p className="text-[#B9A99B]">
              For inquiries regarding this Privacy Policy, data subject access requests, or security vulnerability disclosures, please open an issue on our official GitHub repository or reach out to our privacy engineering team:
            </p>
            <div className="p-4 rounded-xl bg-[#1C0F0A] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-white">VeraOS Engineering &amp; Legal</span>
                <p className="text-xs text-[#B9A99B] mt-0.5">Privacy Desk • Stellar Edge Verification Protocol</p>
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
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms and Conditions
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
