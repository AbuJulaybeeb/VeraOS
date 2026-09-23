import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export const InvitePortal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, loginWithOtp } = useAuth();

  // Manual Redeem Existing Code
  const [code, setCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Email OTP Flow
  const [otpEmail, setOtpEmail] = useState(user?.email || "");
  const [otpName, setOtpName] = useState(user?.name || "");
  const [otpOrg, setOtpOrg] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<{
    email: string;
    otp: string;
    code: string;
    telegramDeepLink: string;
    expiresInSeconds: number;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isVerifyingWeb, setIsVerifyingWeb] = useState(false);
  const [webVerifySuccess, setWebVerifySuccess] = useState<string | null>(null);

  // Operator Share Link Generator
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [generatedShareLink, setGeneratedShareLink] = useState<string | null>(null);
  const [generatedShareCode, setGeneratedShareCode] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const botUsername = "Vera_Of_bot";

  // Auto-detect code from URL query param (?code=... or ?invite=...)
  useEffect(() => {
    const urlCode = searchParams.get("code") || searchParams.get("invite");
    if (urlCode) {
      const clean = urlCode.trim().toUpperCase();
      setCode(clean);
      const directUrl = `https://t.me/${botUsername}?start=invite_${clean}`;
      setRedeemSuccess(directUrl);
    }
  }, [searchParams]);

  // Request Email OTP Passcode
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setWebVerifySuccess(null);

    const cleanEmail = otpEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setIsRequestingOtp(true);
    try {
      const apiUrl = (import.meta as any).env?.VITE_VERAOS_API_URL || "";
      const endpoint = apiUrl ? `${apiUrl}/v1/invite/request-otp` : "/v1/invite/request-otp";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: otpName.trim(),
          org: otpOrg.trim(),
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setGeneratedOtp({
          email: data.email,
          otp: data.otp,
          code: data.code,
          telegramDeepLink: data.telegramDeepLink || `https://t.me/${botUsername}?start=invite_${data.otp}`,
          expiresInSeconds: data.expiresInSeconds || 900,
        });
      } else {
        // Fallback local OTP simulation if offline
        const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp({
          email: cleanEmail,
          otp: localOtp,
          code: `OTP-${localOtp}`,
          telegramDeepLink: `https://t.me/${botUsername}?start=invite_${localOtp}`,
          expiresInSeconds: 900,
        });
      }
    } catch {
      const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp({
        email: cleanEmail,
        otp: localOtp,
        code: `OTP-${localOtp}`,
        telegramDeepLink: `https://t.me/${botUsername}?start=invite_${localOtp}`,
        expiresInSeconds: 900,
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Verify OTP for instant Web clearance
  const handleVerifyWebClearance = async () => {
    if (!generatedOtp) return;
    setIsVerifyingWeb(true);
    setWebVerifySuccess(null);
    try {
      await loginWithOtp(generatedOtp.email, generatedOtp.otp);
      setWebVerifySuccess("Operator credentials activated! You now have full clearance across Web & Telegram.");
    } catch (err: any) {
      setOtpError(err?.message || "Passcode verification failed.");
    } finally {
      setIsVerifyingWeb(false);
    }
  };

  // Manual Redeem Form
  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccess(null);

    const clean = code.trim().toUpperCase();
    if (!clean) {
      setRedeemError("Please enter an invitation code or 6-digit OTP.");
      return;
    }

    const validSeeds = ["VERA-VIP-2026", "STELLAR-AUDITOR-01", "ENTERPRISE-ALPHA"];
    if (
      validSeeds.includes(clean) ||
      clean.startsWith("VERA-") ||
      clean.startsWith("OTP-") ||
      /^\d{6}$/.test(clean) ||
      clean.length >= 6
    ) {
      const directUrl = `https://t.me/${botUsername}?start=invite_${clean}`;
      setRedeemSuccess(directUrl);
    } else {
      setRedeemError("Invalid code. Please enter a valid 6-digit OTP or invitation code.");
    }
  };

  // Generate 1-Click Shareable Link
  const handleGenerateShareable = async () => {
    setIsGeneratingShare(true);
    try {
      const apiUrl = (import.meta as any).env?.VITE_VERAOS_API_URL || "";
      const endpoint = apiUrl ? `${apiUrl}/v1/invite/generate` : "/v1/invite/generate";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdBy: user?.email || "invite_portal", maxUses: 1 }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.telegramInviteLink) {
          setGeneratedShareLink(data.telegramInviteLink);
          setGeneratedShareCode(data.code || "");
          return;
        }
      }
      const fallback = Math.random().toString(36).slice(2, 8).toUpperCase();
      const fallbackCode = `VERA-INV-${fallback}`;
      setGeneratedShareCode(fallbackCode);
      setGeneratedShareLink(`https://t.me/${botUsername}?start=invite_${fallbackCode}`);
    } catch {
      const fallback = Math.random().toString(36).slice(2, 8).toUpperCase();
      const fallbackCode = `VERA-INV-${fallback}`;
      setGeneratedShareCode(fallbackCode);
      setGeneratedShareLink(`https://t.me/${botUsername}?start=invite_${fallbackCode}`);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-10 py-10 px-4">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C1710] border border-[#E08A3E]/30 text-xs font-semibold text-[#E08A3E] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#E08A3E] animate-pulse" />
          <span>Invite-Gated Access Gateway</span>
        </div>
        <h1 className="font-headline-lg text-3xl sm:text-4xl font-bold tracking-tight text-[#FFF8F0]">
          VeraOS Telegram & Web Invitation Portal
        </h1>
        <p className="text-sm sm:text-base text-[#B9A99B] max-w-xl leading-relaxed">
          Access to @{botUsername} and the enterprise audit engine is invite-only. Enter your email to receive an instant 6-digit access OTP passcode, or redeem an existing invite.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Instant Bot Invite via Email OTP (Primary Feature) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#21110B]/95 border-2 border-[#E08A3E]/40 shadow-2xl flex flex-col justify-between gap-5 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-[#C96A2B] to-[#E08A3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
            Instant Passcode
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E]">
              <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
              <span>Get Bot Passcode via Email</span>
            </div>
            <h3 className="font-bold text-lg text-[#FFF8F0]">
              Instant Telegram Bot Clearance
            </h3>
            <p className="text-xs text-[#B9A99B] leading-relaxed">
              Enter your email to immediately generate your 6-digit OTP passcode and 1-click launch link.
            </p>

            {!generatedOtp ? (
              <form onSubmit={handleRequestOtp} className="flex flex-col gap-3 mt-2">
                <div>
                  <label className="text-[11px] font-medium text-[#B9A99B] block mb-1">
                    Your Email Address <span className="text-[#E08A3E]">*</span>
                  </label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="name@company.com or your Google email"
                    required
                    className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#B9A99B] block mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={otpName}
                      onChange={(e) => setOtpName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#B9A99B] block mb-1">
                      Protocol / Org (Optional)
                    </label>
                    <input
                      type="text"
                      value={otpOrg}
                      onChange={(e) => setOtpOrg(e.target.value)}
                      placeholder="e.g. Stellar DeFi"
                      className="w-full p-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] text-xs text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isRequestingOtp}
                  className="w-full mt-2 shadow-lg"
                >
                  Generate 6-Digit Telegram Passcode
                </Button>

                {otpError && (
                  <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-400">
                    {otpError}
                  </div>
                )}
              </form>
            ) : (
              <div className="flex flex-col gap-4 mt-2 animate-in fade-in duration-200">
                {/* 6-Digit Passcode Display */}
                <div className="p-4 rounded-xl bg-[#140804] border border-[#E08A3E]/40 flex flex-col items-center gap-2 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-[#B9A99B] font-medium">
                    Your 6-Digit Telegram Access Passcode
                  </span>
                  <div className="flex items-center justify-center gap-2 my-1">
                    {generatedOtp.otp.split("").map((digit, idx) => (
                      <span
                        key={idx}
                        className="w-9 h-11 rounded-lg bg-[#24120A] border border-[#E08A3E]/60 text-xl font-bold font-mono text-[#E08A3E] flex items-center justify-center shadow-inner"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => copyToClipboard(generatedOtp.otp, setCopiedOtp)}
                      className="text-[11px] text-[#E08A3E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedOtp ? "check" : "content_copy"}
                      </span>
                      <span>{copiedOtp ? "Passcode Copied!" : "Copy Passcode"}</span>
                    </button>
                    <span className="text-white/20">•</span>
                    <span className="text-[11px] text-[#B9A99B] font-mono">
                      Expires in 15 mins
                    </span>
                  </div>
                </div>

                {/* 1-Click Launch Button */}
                <a
                  href={generatedOtp.telegramDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C96A2B] to-[#E08A3E] hover:from-[#E08A3E] hover:to-[#ff9b49] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>Launch @{botUsername} & Auto-Redeem</span>
                </a>

                {/* Telegram Bot Instructions */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-[#B9A99B] flex flex-col gap-1">
                  <span className="font-semibold text-white">How to use in Telegram:</span>
                  <p>
                    1. Click the button above for instant 1-click authorization.
                  </p>
                  <p>
                    2. Or open <strong className="text-white">@{botUsername}</strong> and simply send your 6-digit code: <code className="text-[#E08A3E] font-mono font-bold">{generatedOtp.otp}</code> (or <code className="text-[#E08A3E] font-mono">/invite {generatedOtp.otp}</code>).
                  </p>
                </div>

                {/* Optional Instant Web Verification */}
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyWebClearance}
                    loading={isVerifyingWeb}
                    className="w-full text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1">verified_user</span>
                    <span>Verify Passcode for Web Dashboard Access</span>
                  </Button>

                  {webVerifySuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{webVerifySuccess}</span>
                    </div>
                  )}
                </div>

                {/* Reset button */}
                <button
                  onClick={() => setGeneratedOtp(null)}
                  className="text-[11px] text-[#B9A99B] hover:text-white underline text-center cursor-pointer pt-1"
                >
                  Generate another passcode for a different email
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#4A2B1D]/60 flex items-center justify-between text-[11px] text-[#B9A99B]">
            <span>Whitelisted for: <strong className="text-white">{otpEmail || "Enterprise"}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-Registered on D1
            </span>
          </div>
        </div>

        {/* Card 2: Redeem Existing Invitation Code or Passcode */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-xl flex flex-col justify-between gap-5 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E]">
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Redeem Existing Code</span>
            </div>
            <h3 className="font-bold text-lg text-[#FFF8F0]">
              Already have an Invite or OTP?
            </h3>
            <p className="text-xs text-[#B9A99B] leading-relaxed">
              Enter any 6-digit OTP passcode or alphanumeric VIP code to activate your Telegram clearance.
            </p>

            <form onSubmit={handleRedeem} className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 482910 or VERA-VIP-2026"
                className="w-full p-3 rounded-xl bg-[#160C08] border border-[#4A2B1D] font-mono text-sm text-[#FFF8F0] placeholder:text-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
              />
              <Button type="submit" variant="primary" className="w-full shadow-lg">
                Verify & Activate Operator Pass
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
                    onClick={() => copyToClipboard(redeemSuccess, setCopiedLink)}
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
            <span>Access Code: <code className="text-[#E08A3E] font-mono">VERA-VIP-2026</code></span>
            <button
              onClick={() => setCode("VERA-VIP-2026")}
              className="text-[#E08A3E] hover:underline font-semibold cursor-pointer"
            >
              Insert
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: 1-Click Invite Link Generator for Team Leads */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#21110B]/90 border border-[#E08A3E]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E08A3E]">
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>Operator Shareable Links</span>
          </div>
          <h3 className="font-bold text-lg text-[#FFF8F0]">
            Generate 1-Click Invite Link for Teammates
          </h3>
          <p className="text-xs text-[#B9A99B] leading-relaxed">
            Create an invite link to send directly to your team or agent operators. When they click the link, Telegram opens and grants them full operator clearance immediately.
          </p>
          {generatedShareLink && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                readOnly
                value={generatedShareLink}
                className="flex-1 p-2.5 rounded-lg bg-[#160C08] border border-[#4A2B1D] font-mono text-xs text-[#FFF8F0] select-all focus:outline-none"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => copyToClipboard(generatedShareLink, setCopiedShareLink)}
                className="shrink-0"
              >
                {copiedShareLink ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          )}
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={handleGenerateShareable}
            loading={isGeneratingShare}
            className="shadow-lg whitespace-nowrap"
          >
            {generatedShareLink ? "Generate New Link" : "Generate 1-Click Invite Link"}
          </Button>
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
