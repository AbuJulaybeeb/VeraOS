import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAgentContext } from "../context/AgentContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { cn } from "../lib/utils";
import { TELEGRAM_PERMANENT_INVITE_URL, TELEGRAM_BOT_URL } from "../config/env";

export const Account: React.FC = () => {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    updateProfile,
    regenerateApiKey,
    updatePassword,
    unlinkWallet,
    connectWallet,
    logout,
  } = useAuth();

  const { agents, openConnectModal, testHandshake, disconnectAgent } =
    useAgentContext();

  const [activeTab, setActiveTab] = useState<"overview" | "credentials" | "agents">("overview");

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileRole, setProfileRole] = useState(user?.role || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // API Key State
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [apiKeyMsg, setApiKeyMsg] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Wallet Linking State
  const [isManagingWallet, setIsManagingWallet] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Telegram Invite Copy State
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const TELEGRAM_PERMANENT_INVITE = TELEGRAM_PERMANENT_INVITE_URL;
  const botUsername = TELEGRAM_BOT_URL.split("/").pop() || "VeraOS_Layer_bot";

  // Agent Probe State
  const [probingAgentId, setProbingAgentId] = useState<string | null>(null);
  const [probeResults, setProbeResults] = useState<
    Record<string, { latencyMs: number; network: string; message: string }>
  >({});

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileRole(user.role);
    }
  }, [user]);

  const handleCopyKey = () => {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyTelegramInvite = () => {
    navigator.clipboard.writeText(TELEGRAM_PERMANENT_INVITE);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const ok = await updateProfile({ name: profileName, role: profileRole });
      if (ok) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully." });
        setIsEditingProfile(false);
      } else {
        setProfileMsg({ type: "error", text: "Failed to update profile. Please try again." });
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err?.message || "Error updating profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    setIsRegenerating(true);
    setApiKeyMsg(null);
    try {
      const newKey = await regenerateApiKey();
      setIsRegenModalOpen(false);
      setShowApiKey(true);
      setApiKeyMsg(`New API key generated successfully (${newKey.slice(0, 15)}...). Old key has been revoked.`);
      setTimeout(() => setApiKeyMsg(null), 6000);
    } catch (err: any) {
      setApiKeyMsg("Failed to regenerate API key: " + (err?.message || "Unknown error"));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const ok = await updatePassword(currentPassword, newPassword);
      if (ok) {
        setPasswordMsg({ type: "success", text: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: "Current password verification failed. Please try again." });
      }
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err?.message || "Failed to update password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggleWallet = async () => {
    setIsManagingWallet(true);
    setWalletMsg(null);
    try {
      if (user?.walletAddress) {
        await unlinkWallet();
        setWalletMsg({ type: "success", text: "Stellar wallet unlinked from account." });
      } else {
        const ok = await connectWallet();
        if (ok) {
          setWalletMsg({ type: "success", text: "Stellar wallet connected and linked." });
        }
      }
    } catch (err: any) {
      setWalletMsg({ type: "error", text: err?.message || "Wallet operation failed." });
    } finally {
      setIsManagingWallet(false);
    }
  };

  const handleProbeAgent = async (agentId: string) => {
    setProbingAgentId(agentId);
    try {
      const res = await testHandshake(agentId);
      setProbeResults((prev) => ({
        ...prev,
        [agentId]: {
          latencyMs: res.latencyMs,
          network: res.network,
          message: res.message,
        },
      }));
    } catch (err: any) {
      setProbeResults((prev) => ({
        ...prev,
        [agentId]: {
          latencyMs: 0,
          network: "stellar-testnet",
          message: "Probe failed: " + (err?.message || "Network timeout"),
        },
      }));
    } finally {
      setProbingAgentId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-space-lg max-w-5xl mx-auto flex flex-col gap-6">
        <div className="p-8 rounded-2xl bg-surface-container border border-white/10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container shadow-[0_0_24px_rgba(255,87,8,0.25)]">
            <span className="material-symbols-outlined text-[36px]">manage_accounts</span>
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Sign In to View Account & Credentials
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Access your real-time API keys, cryptographic attestations, linked Google Workspace, and connected autonomous agents.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => openAuthModal("signin")}
              icon={<span className="material-symbols-outlined text-[18px]">login</span>}
            >
              Sign In to Account
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => openAuthModal("signup")}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-space-md md:p-space-lg max-w-6xl mx-auto flex flex-col gap-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-container/40 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-headline-sm font-bold text-xl shadow-[0_0_20px_rgba(255,87,8,0.3)]">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="font-headline-sm text-xl md:text-2xl font-bold text-on-surface">
                {user.name}
              </h1>
              <Badge variant="passed" dot>
                {user.invitationStatus === "admin" ? "PLATFORM OWNER" : "VERIFIED USER"}
              </Badge>
            </div>
            <p className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-2">
              <span>{user.email}</span>
              <span className="text-outline">•</span>
              <span className="text-[#E08A3E] font-medium">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingProfile(true)}
            icon={<span className="material-symbols-outlined text-[16px]">edit</span>}
          >
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            icon={<span className="material-symbols-outlined text-[16px]">logout</span>}
            className="text-error hover:bg-error/10 hover:text-error"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-sm font-medium transition-colors cursor-pointer",
            activeTab === "overview"
              ? "bg-primary-container text-on-primary font-semibold shadow-[0_0_16px_rgba(255,87,8,0.25)]"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">account_circle</span>
          <span>Account Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-sm font-medium transition-colors cursor-pointer",
            activeTab === "credentials"
              ? "bg-primary-container text-on-primary font-semibold shadow-[0_0_16px_rgba(255,87,8,0.25)]"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">key</span>
          <span>Credentials & API Keys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-sm font-medium transition-colors cursor-pointer",
            activeTab === "agents"
              ? "bg-primary-container text-on-primary font-semibold shadow-[0_0_16px_rgba(255,87,8,0.25)]"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span>Connected Agents</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-black/30 font-code-sm">
            {agents.length}
          </span>
        </button>
      </div>

      {/* Global Alerts / Messages */}
      {apiKeyMsg && (
        <div className="p-3 rounded-xl bg-[#14291e] border border-[#22c55e]/40 text-[#4ade80] font-code-sm text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{apiKeyMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ACCOUNT OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Workspace Card */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Card className="p-space-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">badge</span>
                  <span>User Identity & Access Details</span>
                </div>
                <span className="text-[11px] font-code-sm text-outline">Real-time database record</span>
              </div>

              {profileMsg && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs font-code-sm flex items-center gap-2",
                    profileMsg.type === "success"
                      ? "bg-[#14291e] border border-[#22c55e]/30 text-[#4ade80]"
                      : "bg-error-container/50 border border-error/30 text-error"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {profileMsg.type === "success" ? "check_circle" : "error"}
                  </span>
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-on-surface-variant">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-on-surface-variant">Job Title / Role</label>
                    <input
                      type="text"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      required
                      className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={profileSaving}
                      icon={<span className="material-symbols-outlined text-[16px]">save</span>}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileName(user.name);
                        setProfileRole(user.role);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] font-code-sm text-outline uppercase">User ID</span>
                    <span className="font-code-sm text-xs text-on-surface select-all truncate">{user.id}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] font-code-sm text-outline uppercase">Primary Email</span>
                    <span className="font-code-sm text-xs text-on-surface truncate">{user.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] font-code-sm text-outline uppercase">Auth Provider</span>
                    <div className="flex items-center gap-1.5 font-code-sm text-xs text-on-surface">
                      <span className="capitalize">{user.authProvider || "Standard Email"}</span>
                      {user.authProvider === "google" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Google OAuth
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                    <span className="text-[11px] font-code-sm text-outline uppercase">Account Created</span>
                    <span className="font-code-sm text-xs text-on-surface">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active Session"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1 sm:col-span-2">
                    <span className="text-[11px] font-code-sm text-outline uppercase">Last Login Timestamp</span>
                    <span className="font-code-sm text-xs text-secondary">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Current session active"}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Linked Services Grid */}
            <Card className="p-space-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-secondary text-[20px]">link</span>
                  <span>Connected Authentication & Integrations</span>
                </div>
                <span className="text-[11px] font-code-sm text-outline">Third-party linking</span>
              </div>

              {walletMsg && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs font-code-sm flex items-center gap-2",
                    walletMsg.type === "success"
                      ? "bg-[#14291e] border border-[#22c55e]/30 text-[#4ade80]"
                      : "bg-error-container/50 border border-error/30 text-error"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {walletMsg.type === "success" ? "check_circle" : "error"}
                  </span>
                  <span>{walletMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {/* Google Account */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-on-surface">Google Workspace Account</span>
                      <span className="font-code-sm text-[11px] text-on-surface-variant">
                        {user.googleId ? `Linked (${user.email})` : "Not connected via Google OAuth"}
                      </span>
                    </div>
                  </div>
                  <div>
                    {user.googleId ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-code-sm">
                        Connected
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAuthModal("signin")}
                      >
                        Connect Google
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stellar Web3 Wallet */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-on-surface">Stellar Web3 Wallet (Testnet)</span>
                      <span className="font-code-sm text-[11px] text-on-surface-variant truncate max-w-xs">
                        {user.walletAddress || "No Stellar public key linked to this profile"}
                      </span>
                    </div>
                  </div>
                  <div>
                    {user.walletAddress ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={isManagingWallet}
                        onClick={handleToggleWallet}
                        className="text-error hover:bg-error/10 hover:text-error"
                      >
                        Unlink Wallet
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={isManagingWallet}
                        onClick={handleToggleWallet}
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>

                {/* Telegram Bot Permanent Access */}
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#E08A3E]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E08A3E]/20 border border-[#E08A3E]/40 flex items-center justify-center shrink-0 text-[#E08A3E]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-on-surface">Telegram Bot Clearance</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E] border border-[#E08A3E]/30">
                          Invite-Only
                        </span>
                      </div>
                      <span className="font-code-sm text-[11px] text-on-surface-variant">
                        Bot handle: @{botUsername} • Permanent invite authorization enabled
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyTelegramInvite}
                      icon={<span className="material-symbols-outlined text-[14px]">{copiedTelegram ? "check" : "content_copy"}</span>}
                    >
                      {copiedTelegram ? "Copied" : "Copy Invite Link"}
                    </Button>
                    <a
                      href={TELEGRAM_PERMANENT_INVITE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#E08A3E] hover:bg-[#c96a2b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Bot</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Security & Summary Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="p-space-md flex flex-col gap-4">
              <div className="flex items-center gap-2 text-on-surface font-semibold text-sm border-b border-white/5 pb-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span>Cryptographic Status</span>
              </div>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Attestation Network:</span>
                  <span className="font-code-sm font-semibold text-secondary">Stellar Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Signing Schema:</span>
                  <span className="font-code-sm text-on-surface">ed25519-sha256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Audit Anchor:</span>
                  <span className="font-code-sm text-emerald-400">Live Horizon RPC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Security Clearance:</span>
                  <span className="font-code-sm text-[#E08A3E] font-semibold uppercase">{user.invitationStatus}</span>
                </div>
              </div>
            </Card>

            <Card className="p-space-md flex flex-col gap-3 bg-gradient-to-br from-surface-container to-surface-container-high border-white/10">
              <div className="flex items-center gap-2 text-primary-container font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                <span>Developer Documentation</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Learn how to pass real cryptographically verified agent states into the VeraOS engine using Python, TypeScript, or REST.
              </p>
              <Link to="/docs">
                <Button variant="outline" size="sm" className="w-full justify-between mt-1">
                  <span>Explore SDK Reference</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREDENTIALS & API KEYS */}
      {/* ========================================================================= */}
      {activeTab === "credentials" && (
        <div className="flex flex-col gap-6">
          {/* Main API Key Card */}
          <Card className="p-space-lg flex flex-col gap-5 border border-primary-container/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[22px]">key</span>
                  <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                    VeraOS Engine API Key
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-code-sm font-semibold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Use this secret key to authenticate autonomous AI agent workflows, Python SDK instances, and verification webhooks.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRegenModalOpen(true)}
                icon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
                className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10 hover:border-amber-400/50"
              >
                Regenerate Secret Key
              </Button>
            </div>

            {/* Secret Key Display Box */}
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 font-code-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
                <span className="text-sm text-on-surface select-all tracking-wider truncate">
                  {showApiKey ? (user.apiKey || "vera_live_dev_preview_key") : "••••••••••••••••••••••••••••••••••••••••"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  icon={<span className="material-symbols-outlined text-[16px]">{showApiKey ? "visibility_off" : "visibility"}</span>}
                >
                  {showApiKey ? "Hide" : "Reveal"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyKey}
                  icon={<span className="material-symbols-outlined text-[16px]">{copiedKey ? "check" : "content_copy"}</span>}
                >
                  {copiedKey ? "Copied" : "Copy Key"}
                </Button>
              </div>
            </div>

            {/* Code Integration Preview */}
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                SDK Usage Example (Python & cURL)
              </span>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-code-sm text-xs text-[#FFF8F0] overflow-x-auto leading-relaxed">
                <p className="text-outline"># Authenticate with the VeraOS Python SDK</p>
                <p><span className="text-secondary">from</span> veraos <span className="text-secondary">import</span> VeraOSClient</p>
                <p>client = VeraOSClient(api_key=<span className="text-[#E08A3E]">"{user.apiKey || "vera_live_..."}"</span>)</p>
                <p>task = client.verify(claim=<span className="text-[#4ade80]">"stellar_tx_0x9a8f..."</span>)</p>
              </div>
            </div>
          </Card>

          {/* Password Management Card */}
          <Card className="p-space-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-outline text-[20px]">lock_reset</span>
                <span>Change Account Password</span>
              </div>
              <span className="text-[11px] font-code-sm text-outline">Stored with secure argon2/bcrypt hash</span>
            </div>

            {passwordMsg && (
              <div
                className={cn(
                  "p-3 rounded-lg text-xs font-code-sm flex items-center gap-2",
                  passwordMsg.type === "success"
                    ? "bg-[#14291e] border border-[#22c55e]/30 text-[#4ade80]"
                    : "bg-error-container/50 border border-error/30 text-error"
                )}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {passwordMsg.type === "success" ? "check_circle" : "error"}
                </span>
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="px-3 py-2 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="md:col-span-3 flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isUpdatingPassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  icon={<span className="material-symbols-outlined text-[16px]">save</span>}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Cryptographic Session & Tokens Card */}
          <Card className="p-space-lg flex flex-col gap-3">
            <div className="flex items-center gap-2 text-on-surface font-semibold text-sm border-b border-white/5 pb-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">security</span>
              <span>Active Cryptographic Session & Attestation Protocol</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-code-sm pt-1">
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                <span className="text-outline uppercase text-[10px]">Session Token Format</span>
                <span className="text-on-surface">JWT / Ed25519 Dual Sign</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                <span className="text-outline uppercase text-[10px]">State Consensus Protocol</span>
                <span className="text-emerald-400">Stellar Consensus (SCP)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-1">
                <span className="text-outline uppercase text-[10px]">Attestation Contract</span>
                <span className="text-[#E08A3E] truncate">CBAQ...7X8Y (Soroban Testnet)</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONNECTED AGENTS & REAL-TIME VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "agents" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                Connected Autonomous Agents ({agents.length})
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live agents persisted to your database and authorized to submit proof-of-execution attestations.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openConnectModal()}
              icon={<span className="material-symbols-outlined text-[16px]">add</span>}
            >
              Connect New Agent
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const isProbing = probingAgentId === agent.id;
              const probe = probeResults[agent.id];

              return (
                <Card key={agent.id} className="p-space-md flex flex-col justify-between gap-4 border border-white/10 hover:border-[#E08A3E]/40 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
                          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-on-surface">{agent.name}</span>
                          <span className="text-[11px] font-code-sm text-outline truncate max-w-[180px]">{agent.runtime}</span>
                        </div>
                      </div>
                      <Badge variant={agent.status === "CONNECTED" ? "passed" : "neutral"} dot>
                        {agent.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-code-sm bg-surface-container-low p-2.5 rounded-lg mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase">Agent ID</span>
                        <span className="text-on-surface truncate">{agent.id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase">Default Model</span>
                        <span className="text-on-surface truncate">{agent.model}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-[10px] text-outline uppercase">Endpoint URL</span>
                        <span className="text-on-surface-variant truncate">{agent.endpoint || "In-memory Worker"}</span>
                      </div>
                    </div>

                    {probe && (
                      <div className="p-2 rounded bg-[#14291e] border border-[#22c55e]/30 text-[11px] font-code-sm text-[#4ade80] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>{probe.message}</span>
                        </div>
                        <span className="font-bold shrink-0">{probe.latencyMs}ms</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleProbeAgent(agent.id)}
                      disabled={isProbing}
                      className="text-xs text-[#E08A3E] hover:text-white font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isProbing ? "sync" : "network_check"}
                      </span>
                      <span>{isProbing ? "Probing Stellar RPC..." : "Probe Live Latency"}</span>
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectAgent(agent.id)}
                      className="text-outline hover:text-error text-xs"
                    >
                      Disconnect
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGENERATE API KEY MODAL */}
      {/* ========================================================================= */}
      {isRegenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#160C08] border border-[#ff5708]/40 shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-headline-sm text-base font-bold text-white">
                Revoke & Regenerate API Key?
              </h3>
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                Regenerating your secret key will immediately invalidate the current key across all autonomous agents, CI/CD pipelines, and SDK connections.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRegenModalOpen(false)}
                disabled={isRegenerating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isRegenerating}
                onClick={handleRegenerateKey}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Yes, Regenerate Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
