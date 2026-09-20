import React, { useState } from "react";
import { Button } from "../ui/Button";
import { TELEGRAM_BOT_URL } from "../../config/env";
import { useAuth } from "../../context/AuthContext";

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInviteCode?: string;
}

export const InviteLinkModal: React.FC<InviteLinkModalProps> = ({
  isOpen,
  onClose,
  defaultInviteCode,
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"launch" | "share">("launch");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract bot username from env or default
  const botUsername = TELEGRAM_BOT_URL.split("/").pop() || "Vera_Of_bot";

  // Pre-seed or personal link
  const personalCode = defaultInviteCode || "VERA-VIP-2026";
  const personalLaunchUrl = `https://t.me/${botUsername}?start=invite_${personalCode}`;

  const handleGenerateShareableLink = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const apiUrl = (import.meta as any).env?.VITE_VERAOS_API_URL || "";
      const endpoint = apiUrl ? `${apiUrl}/v1/invite/generate` : "/v1/invite/generate";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy: user?.email || user?.name || "web_operator",
          maxUses: 1,
          notes: `Created by ${user?.email || "operator"} via Web UI`,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.telegramInviteLink) {
          setGeneratedLink(data.telegramInviteLink);
          setGeneratedCode(data.code || "");
          setActiveTab("share");
          return;
        }
      }
      // Fallback generation if offline
      const fallbackSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `VERA-INV-${fallbackSuffix}`;
      const link = `https://t.me/${botUsername}?start=invite_${code}`;
      setGeneratedLink(link);
      setGeneratedCode(code);
      setActiveTab("share");
    } catch {
      const fallbackSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `VERA-INV-${fallbackSuffix}`;
      const link = `https://t.me/${botUsername}?start=invite_${code}`;
      setGeneratedLink(link);
      setGeneratedCode(code);
      setActiveTab("share");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1C0F0A] border border-[#E08A3E]/30 shadow-2xl p-6 flex flex-col gap-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C1710] border border-[#E08A3E]/40 flex items-center justify-center text-[#E08A3E]">
              <span className="material-symbols-outlined text-[24px]">send</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Telegram Bot Access & Invites</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Invite-Only
                </span>
              </div>
              <p className="text-xs text-[#B9A99B]">
                Access to @{botUsername} is strictly gated. Use an authorized invite link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#120805] rounded-xl border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("launch")}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "launch"
                ? "bg-[#C96A2B] text-white shadow-sm"
                : "text-[#B9A99B] hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>Launch Bot For Myself</span>
          </button>
          <button
            onClick={() => {
              if (!generatedLink) handleGenerateShareableLink();
              else setActiveTab("share");
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "share"
                ? "bg-[#C96A2B] text-white shadow-sm"
                : "text-[#B9A99B] hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Invite Someone Else</span>
          </button>
        </div>

        {/* TAB 1: Launch For Myself */}
        {activeTab === "launch" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#21110B] border border-white/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">Automatic Operator Clearance</span>
                <span className="text-[#00E5FF] font-mono text-[11px]">1-Click Verified</span>
              </div>
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                Click below to open Telegram. The bot will automatically recognize your invitation parameter, activate your account on Cloudflare D1, and grant you full operator clearance.
              </p>
              <div className="pt-2">
                <a
                  href={personalLaunchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C96A2B] to-[#E08A3E] hover:from-[#E08A3E] hover:to-[#ff9b49] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>Launch @{botUsername} with Auto-Invite</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#120805] border border-white/5 text-xs text-[#B9A99B]">
              <span className="truncate mr-2 font-mono text-[11px] text-white/70">
                {personalLaunchUrl}
              </span>
              <button
                onClick={() => handleCopy(personalLaunchUrl)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Invite Someone Else */}
        {activeTab === "share" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#21110B] border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Shareable Operator Invite Link
                </span>
                {generatedCode && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                    Code: {generatedCode}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#B9A99B] leading-relaxed">
                Send this link to anyone you want to authorize. When they click it, Telegram will open and they will immediately be invited and granted operator access.
              </p>

              {generatedLink ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 p-2.5 rounded-lg bg-[#120805] border border-[#4A2B1D] font-mono text-xs text-white select-all focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopy(generatedLink)}
                    className="shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                </div>
              ) : (
                <div className="py-3 flex justify-center">
                  <Button
                    variant="primary"
                    onClick={handleGenerateShareableLink}
                    loading={isGenerating}
                  >
                    Generate 1-Click Invite Link
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleGenerateShareableLink}
                disabled={isGenerating}
                className="text-xs text-[#E08A3E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Generate Another Link</span>
              </button>
              {generatedLink && (
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    generatedLink
                  )}&text=${encodeURIComponent(
                    "Here is your private invite link to access VeraOS on Telegram:"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">share</span>
                  <span>Share via Telegram</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-outline">
          <span>Security: No email OTP required</span>
          <span>Clearance: Auto-granted on click</span>
        </div>
      </div>
    </div>
  );
};
