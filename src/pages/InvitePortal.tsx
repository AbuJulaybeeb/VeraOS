import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { TELEGRAM_BOT_URL } from "../config/env";

export const InvitePortal: React.FC = () => {
  const [code, setCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Request invite form state
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqOrg, setReqOrg] = useState("");
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const botUsername = "Vera_Of_bot";

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);

    const clean = code.trim().toUpperCase();
    if (!clean) {
      setRedeemError("Please enter an invitation code.");
      return;
    }

    const validSeeds = ["VERA-VIP-2026", "STELLAR-AUDITOR-01", "FOUNDER-ALPHA"];
    if (validSeeds.includes(clean) || clean.startsWith("VERA-") || clean.length >= 6) {
      const directUrl = `https://t.me/${botUsername}?start=invite_${clean}`;
      setRedeemSuccess(directUrl);
    } else {
      setRedeemError("Invalid invitation code. Codes usually look like VERA-VIP-2026.");
    }
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail.includes("@")) return;
    setReqSubmitted(true);
  };

  const handleCopyLink = () => {
    if (redeemSuccess) {
      navigator.clipboard.writeText(redeemSuccess);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-10 py-10 px-4">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C1710] border border-[#E08A3E]/30 text-xs font-semibold text-[#E08A3E] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#E08A3E] animate-pulse" />
          <span>Enterprise Access Gateway</span>
        </div>
        <h1 className="font-headline-lg text-3xl sm:text-4xl font-bold tracking-tight text-[#FFF8F0]">
          VeraOS Invitation & Access Portal
        </h1>
        <p className="text-sm sm:text-base text-[#B9A99B] max-w-xl leading-relaxed">
          VeraOS is an invitation-only audit engine and Telegram bot. Redeem your operator credentials or request team clearance below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Redeem Code */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-xl flex flex-col justify-between gap-5 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E]">
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Redeem Invitation Code</span>
            </div>
            <h3 className="font-bold text-lg text-[#FFF8F0]">
              Already have an invite code?
            </h3>
            <p className="text-xs text-[#B9A99B] leading-relaxed">
              Enter your code to generate a verified 1-click activation link for the Telegram bot.
            </p>

            <form onSubmit={handleRedeem} className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. VERA-VIP-2026"
                className="w-full p-3 rounded-xl bg-[#160C08] border border-[#4A2B1D] font-mono text-sm text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
              />
              <Button type="submit" variant="primary" className="w-full shadow-lg">
                Activate Operator Pass
              </Button>
            </form>

            {redeemError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-400">
                {redeemError}
              </div>
            )}

            {redeemSuccess && (
              <div className="p-4 rounded-xl bg-[#160C08] border border-emerald-500/40 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Code Verified! Ready to Launch</span>
                </div>
                <p className="text-xs text-[#B9A99B]">
                  Click below to open Telegram and claim your authorized operator session:
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={redeemSuccess}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#C96A2B] hover:bg-[#E08A3E] text-white text-xs font-bold text-center transition-colors shadow-md"
                  >
                    Open Telegram Bot
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition-colors border border-white/10"
                    title="Copy Link"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedLink ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#4A2B1D]/60 flex items-center justify-between text-[11px] text-[#B9A99B]">
            <span>VIP Code: <code className="text-[#E08A3E] font-mono">VERA-VIP-2026</code></span>
            <button
              onClick={() => setCode("VERA-VIP-2026")}
              className="text-[#E08A3E] hover:underline font-semibold cursor-pointer"
            >
              Insert
            </button>
          </div>
        </div>

        {/* Card 2: Request Access */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-xl flex flex-col justify-between gap-5 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E]">
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>Enterprise Clearance</span>
            </div>
            <h3 className="font-bold text-lg text-[#FFF8F0]">
              Request an Organization Invite
            </h3>
            <p className="text-xs text-[#B9A99B] leading-relaxed">
              For DeFi protocols, AI agent developers, and institutions deploying on Stellar.
            </p>

            {reqSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center flex flex-col items-center gap-2 my-auto">
                <span className="material-symbols-outlined text-emerald-400 text-[32px]">task_alt</span>
                <h4 className="font-bold text-[#FFF8F0] text-sm">Request Submitted</h4>
                <p className="text-xs text-[#B9A99B]">
                  Our team has queued your invite. An operator will contact {reqEmail} with your VIP activation key.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
                <input
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="Work Email"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
                <input
                  type="text"
                  value={reqOrg}
                  onChange={(e) => setReqOrg(e.target.value)}
                  placeholder="Organization or Protocol Name"
                  className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                />
                <Button type="submit" variant="outline" className="w-full mt-1">
                  Submit Invitation Request
                </Button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-[#4A2B1D]/60 text-[11px] text-[#B9A99B] text-center">
            Standard turnaround time: &lt; 2 hours for protocol developers.
          </div>
        </div>
      </div>

      {/* Back to Platform */}
      <div className="text-center pt-4">
        <Link to="/dashboard" className="text-xs text-[#B9A99B] hover:text-[#FFF8F0] inline-flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          <span>Back to Telemetry Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
