import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TELEGRAM_BOT_URL } from "../../config/env";

export const AccessRestrictedGate: React.FC = () => {
  const { user, logout, redeemInviteCode } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await redeemInviteCode(inviteCode.trim());
      setSuccessMsg(result.message || "Invitation verified. Clearance granted!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to redeem code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl bg-surface-container border border-primary/20 p-6 md:p-8 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Status */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_24px_rgba(255,87,8,0.2)]">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-white/5 text-xs text-on-surface">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {user?.name?.charAt(0) || "G"}
            </span>
          )}
          <span className="font-medium text-white">{user?.name}</span>
          <span className="text-outline">({user?.email})</span>
        </div>

        {/* Explanatory Copy */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-headline tracking-tight text-white">
            Access Restricted — Invitation Required
          </h2>
          <p className="text-sm text-[#B9A99B] leading-relaxed">
            Your Google account has been authenticated, but the VeraOS invariant audit engine is currently in private beta and accessible by invitation only.
          </p>
        </div>

        {/* Code Redemption Form */}
        <form onSubmit={handleRedeem} className="w-full space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter VIP Invite Code (e.g. VERA-VIP-2026)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/10 font-mono text-sm text-white placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !inviteCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-sm"
            >
              {isSubmitting ? "Verifying..." : "Redeem Code"}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-error font-medium text-left">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 font-medium text-left">{successMsg}</p>
          )}
        </form>

        {/* External Help & Actions */}
        <div className="w-full pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/invite"
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>Request Invitation</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E08A3E] hover:underline font-medium flex items-center gap-1"
            >
              <span>Telegram Bot</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>

          <button
            type="button"
            onClick={logout}
            className="text-outline hover:text-white transition-colors cursor-pointer"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};
