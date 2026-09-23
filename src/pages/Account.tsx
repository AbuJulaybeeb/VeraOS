import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAgentContext } from "../context/AgentContext";
import { useVerificationsList } from "../hooks/useVerification";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/utils";
import { TELEGRAM_PERMANENT_INVITE_URL, TELEGRAM_BOT_URL } from "../config/env";

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    openAuthModal,
    updateProfile,
    regenerateApiKey,
    logout,
  } = useAuth();

  const { agents, testHandshake, disconnectAgent } = useAgentContext();
  const { verifications } = useVerificationsList();

  const [activeTab, setActiveTab] = useState<"profile" | "apikeys" | "agents" | "audit" | "danger">("profile");

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

  // Delete Account Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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
      setApiKeyMsg(`New API key generated successfully (${newKey.slice(0, 14)}...). Old key has been revoked.`);
      setTimeout(() => setApiKeyMsg(null), 6000);
    } catch (err: any) {
      setApiKeyMsg("Failed to regenerate API key: " + (err?.message || "Unknown error"));
    } finally {
      setIsRegenerating(false);
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
          network: "verification-rpc",
          message: "Probe failed: " + (err?.message || "Timeout"),
        },
      }));
    } finally {
      setProbingAgentId(null);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toLowerCase() !== "delete my account") return;
    logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 py-12 px-4 font-sans">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#3A2015] border border-[#63361F] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[36px]">manage_accounts</span>
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="font-heading text-xl sm:text-2xl text-[#FFF8F0] font-bold">
              Account Access Required
            </h2>
            <p className="text-sm text-[#B9A99B]">
              Sign in with your Google account to manage programmatic verification keys and agent connections.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => openAuthModal("signin")}
              icon={<span className="material-symbols-outlined text-[18px]">login</span>}
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* Header Profile Bar */}
      <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#63361F]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#3A2015] border border-[#63361F] flex items-center justify-center text-[#E08A3E] font-heading font-bold text-2xl">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#FFF8F0]">
                {user.name}
              </h1>
              <Badge variant="passed" dot>
                GOOGLE AUTHENTICATED
              </Badge>
            </div>
            <p className="font-mono text-xs text-[#B9A99B] flex items-center gap-2 mt-1">
              <span>{user.email}</span>
              <span className="text-[#63361F]">•</span>
              <span className="text-[#E08A3E]">{user.role || "AI Engineer"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className="text-[#f87171] hover:bg-[#2a1210] hover:text-[#f87171]"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#3A2015] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "profile"
              ? "bg-[#C96A2B] text-[#FFF8F0] font-bold"
              : "text-[#B9A99B] hover:bg-[#21110B] hover:text-[#FFF8F0]"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Google Account</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("apikeys")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "apikeys"
              ? "bg-[#C96A2B] text-[#FFF8F0] font-bold"
              : "text-[#B9A99B] hover:bg-[#21110B] hover:text-[#FFF8F0]"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">key</span>
          <span>API Keys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "agents"
              ? "bg-[#C96A2B] text-[#FFF8F0] font-bold"
              : "text-[#B9A99B] hover:bg-[#21110B] hover:text-[#FFF8F0]"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span>Connected Agents</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {agents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
            activeTab === "audit"
              ? "bg-[#C96A2B] text-[#FFF8F0] font-bold"
              : "text-[#B9A99B] hover:bg-[#21110B] hover:text-[#FFF8F0]"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>Audit Log</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {verifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ml-auto",
            activeTab === "danger"
              ? "bg-[#ef4444] text-[#FFF8F0] font-bold"
              : "text-[#f87171] hover:bg-[#2a1210]"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>Danger Zone</span>
        </button>
      </div>

      {/* Global Alerts */}
      {apiKeyMsg && (
        <div className="p-3.5 rounded-2xl bg-[#142818] border border-[#4ade80]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{apiKeyMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GOOGLE ACCOUNT DETAILS */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#3A2015] pb-3">
                <div className="flex items-center gap-2 text-[#FFF8F0] font-semibold text-sm">
                  <span className="material-symbols-outlined text-[#E08A3E] text-[20px]">account_box</span>
                  <span>Google Account Details</span>
                </div>
                <span className="text-[11px] font-mono text-[#B9A99B]">OAuth 2.0 Verified</span>
              </div>

              {profileMsg && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs font-mono flex items-center gap-2",
                    profileMsg.type === "success"
                      ? "bg-[#142818] border border-[#4ade80]/40 text-[#4ade80]"
                      : "bg-[#2a1210] border border-[#f87171]/40 text-[#f87171]"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {profileMsg.type === "success" ? "check_circle" : "error"}
                  </span>
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#B9A99B]">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="px-3.5 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2819] text-[#FFF8F0] text-sm focus:outline-none focus:border-[#C96A2B]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#B9A99B]">Role / Title</label>
                    <input
                      type="text"
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      required
                      className="px-3.5 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2819] text-[#FFF8F0] text-sm focus:outline-none focus:border-[#C96A2B]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={profileSaving}
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-[#B9A99B] uppercase">Full Name</span>
                    <span className="text-sm font-semibold text-[#FFF8F0]">{user.name}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-[#B9A99B] uppercase">Email Address</span>
                    <span className="text-sm font-mono text-[#FFF8F0] truncate">{user.email}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-[#B9A99B] uppercase">Workspace Role</span>
                    <span className="text-sm text-[#E08A3E] font-medium">{user.role || "AI Engineer"}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-[#B9A99B] uppercase">Authentication Provider</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span className="text-sm text-[#4ade80] font-medium">Google Account</span>
                    </div>
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
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col gap-3">
              <span className="text-xs font-bold text-[#FFF8F0] uppercase tracking-wider">
                Verification Summary
              </span>
              <div className="flex flex-col gap-2 pt-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#3A2015]">
                  <span className="text-[#B9A99B]">Connected Agents</span>
                  <span className="font-mono text-[#FFF8F0] font-bold">{agents.length}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#3A2015]">
                  <span className="text-[#B9A99B]">Total Verifications</span>
                  <span className="font-mono text-[#FFF8F0] font-bold">{verifications.length}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#B9A99B]">Verification Rule</span>
                  <span className="font-mono text-[#E08A3E]">Evidence Checks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: API KEYS */}
      {/* ========================================================================= */}
      {activeTab === "apikeys" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A2015] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E08A3E] text-[22px]">key</span>
                  <h3 className="font-heading text-base font-bold text-[#FFF8F0]">
                    Programmatic Verification API Key
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#142818] text-[#4ade80] border border-[#4ade80]/30 font-mono font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#B9A99B] mt-1">
                  Authenticate your AI agents to submit tasks, claims, and trigger independent verification.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRegenModalOpen(true)}
                icon={<span className="material-symbols-outlined text-[16px]">refresh</span>}
                className="text-[#E08A3E] border-[#63361F] hover:bg-[#3A2015]"
              >
                Regenerate Key
              </Button>
            </div>

            {/* Secret Key Display */}
            <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[#B9A99B] text-[18px]">lock</span>
                <span className="text-sm text-[#FFF8F0] select-all tracking-wider truncate">
                  {showApiKey ? (user.apiKey || "vera_live_key_99fa82de") : "••••••••••••••••••••••••••••••••••••••••"}
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
                  variant="primary"
                  size="sm"
                  onClick={handleCopyKey}
                  icon={<span className="material-symbols-outlined text-[16px]">{copiedKey ? "check" : "content_copy"}</span>}
                >
                  {copiedKey ? "Copied" : "Copy Key"}
                </Button>
              </div>
            </div>

            {/* Code Integration Example */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="font-mono text-xs text-[#B9A99B] uppercase tracking-wider">
                Agent Integration Code Snippet (Python & TypeScript)
              </span>
              <div className="p-4 rounded-2xl bg-[#160C08] border border-[#3A2015] font-mono text-xs text-[#FFF8F0] overflow-x-auto leading-relaxed">
                <p className="text-[#B9A99B]"># 1. Initialize VeraOS Client</p>
                <p><span className="text-[#E08A3E]">from</span> veraos <span className="text-[#E08A3E]">import</span> VeraOSClient</p>
                <p>client = VeraOSClient(api_key=<span className="text-[#E6A15A]">&quot;{user.apiKey || "vera_live_..."}&quot;</span>)</p>
                <br />
                <p className="text-[#B9A99B]"># 2. Submit Claim for Independent Verification</p>
                <p>verdict = client.verify(</p>
                <p className="pl-4">agent_id=<span className="text-[#E6A15A]">&quot;agent-financial-bot&quot;</span>,</p>
                <p className="pl-4">task=<span className="text-[#E6A15A]">&quot;Transfer 5 USDC&quot;</span>,</p>
                <p className="pl-4">claim=<span className="text-[#E6A15A]">&quot;Successfully transferred 5 USDC to 0x7a...&quot;</span>,</p>
                <p>)</p>
                <p><span className="text-[#E08A3E]">print</span>(verdict.status)  <span className="text-[#B9A99B]"># &apos;PASSED&apos; | &apos;FAILED&apos; | &apos;UNVERIFIABLE&apos;</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONNECTED AGENTS */}
      {/* ========================================================================= */}
      {activeTab === "agents" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-base font-bold text-[#FFF8F0]">
                Connected Autonomous Agents ({agents.length})
              </h3>
              <p className="text-xs text-[#B9A99B]">
                Agents authorized to send verification claims and receive verification verdicts.
              </p>
            </div>
            <Link to="/agents">
              <Button
                variant="primary"
                size="sm"
                icon={<span className="material-symbols-outlined text-[16px]">add</span>}
              >
                Manage Agents
              </Button>
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#21110B] border border-[#4A2819] text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[#B9A99B] text-4xl">smart_toy</span>
              <p className="text-sm font-semibold text-[#FFF8F0]">No agents connected</p>
              <p className="text-xs text-[#B9A99B] max-w-sm">
                Connect your first autonomous agent runtime to submit task claims for verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => {
                const isProbing = probingAgentId === agent.id;
                const probe = probeResults[agent.id];

                return (
                  <div
                    key={agent.id}
                    className="p-5 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#3A2015] border border-[#63361F] flex items-center justify-center text-[#E08A3E]">
                            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-sm text-[#FFF8F0]">
                              {agent.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#B9A99B]">
                              {agent.runtime || "Autonomous Runtime"}
                            </span>
                          </div>
                        </div>
                        <Badge variant={agent.status === "CONNECTED" ? "passed" : "neutral"} dot>
                          {agent.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#160C08] p-3 rounded-2xl border border-[#3A2015]">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#B9A99B] uppercase">Agent ID</span>
                          <span className="text-[#FFF8F0] truncate">{agent.id}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#B9A99B] uppercase">Default Model</span>
                          <span className="text-[#FFF8F0] truncate">{agent.model}</span>
                        </div>
                        <div className="flex flex-col col-span-2 mt-1">
                          <span className="text-[10px] text-[#B9A99B] uppercase">Endpoint</span>
                          <span className="text-[#B9A99B] truncate">{agent.endpoint || "In-memory"}</span>
                        </div>
                      </div>

                      {probe && (
                        <div className="p-2.5 rounded-xl bg-[#142818] border border-[#4ade80]/30 text-[11px] font-mono text-[#4ade80] flex items-center justify-between">
                          <span>{probe.message}</span>
                          <span className="font-bold">{probe.latencyMs}ms</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#3A2015]">
                      <button
                        type="button"
                        onClick={() => handleProbeAgent(agent.id)}
                        disabled={isProbing}
                        className="text-xs text-[#E08A3E] hover:text-[#FFF8F0] font-mono flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isProbing ? "sync" : "network_check"}
                        </span>
                        <span>{isProbing ? "Probing..." : "Test Latency"}</span>
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectAgent(agent.id)}
                        className="text-[#f87171] hover:bg-[#2a1210] hover:text-[#f87171] text-xs"
                      >
                        Revoke Access
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-[#FFF8F0]">
                Audit Log & Verification Activity
              </h3>
              <p className="text-xs text-[#B9A99B]">
                Real-time chronological record of agent claim verifications and outcomes.
              </p>
            </div>
            <Link to="/verifications">
              <Button variant="outline" size="sm">
                View All Verifications
              </Button>
            </Link>
          </div>

          {verifications.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#21110B] border border-[#4A2819] text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[#B9A99B] text-4xl">history</span>
              <p className="text-sm font-semibold text-[#FFF8F0]">No verification activity yet</p>
              <p className="text-xs text-[#B9A99B] max-w-sm">
                When agents submit task claims, the full audit trail and independent evidence logs will appear here.
              </p>
              <Link to="/verify/new" className="pt-2">
                <Button variant="primary" size="sm">
                  Run First Verification
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-2 sm:p-4 rounded-3xl bg-[#21110B] border border-[#4A2819] flex flex-col gap-2">
              <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 font-mono text-[10px] uppercase text-[#B9A99B] tracking-wider border-b border-[#3A2015]">
                <div className="col-span-3">VERIFICATION ID</div>
                <div className="col-span-4">TASK</div>
                <div className="col-span-2">AGENT</div>
                <div className="col-span-2">VERDICT</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>

              {verifications.slice(0, 10).map((v) => (
                <div
                  key={v.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-[#160C08] border border-[#3A2015] hover:border-[#63361F] transition-colors items-center font-mono text-xs"
                >
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <span className="text-[#FFF8F0] font-bold">{v.displayId || v.id}</span>
                    <span className="text-[10px] text-[#B9A99B] truncate">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="sm:col-span-4 font-sans text-xs text-[#FFF8F0] truncate">
                    {v.taskPrompt}
                  </div>

                  <div className="sm:col-span-2 text-xs text-[#B9A99B] truncate">
                    {v.workerName || v.workerId}
                  </div>

                  <div className="sm:col-span-2 flex items-center">
                    <Badge
                      variant={
                        v.status === "PASSED"
                          ? "passed"
                          : v.status === "FAILED"
                          ? "failed"
                          : "unverified"
                      }
                      dot
                    >
                      {v.status}
                    </Badge>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <Link
                      to={`/verify/${v.id}`}
                      className="text-[#E08A3E] hover:text-[#FFF8F0] text-xs font-semibold"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DANGER ZONE */}
      {/* ========================================================================= */}
      {activeTab === "danger" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-[#21110B] border border-[#ef4444]/40 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-[#f87171] font-bold text-base border-b border-[#3A2015] pb-3">
              <span className="material-symbols-outlined text-[22px]">warning</span>
              <span>Danger Zone</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#160C08] border border-[#3A2015]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#FFF8F0]">Sign Out of Session</span>
                <span className="text-xs text-[#B9A99B]">
                  Revoke this browser session and clear active OAuth credentials.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#2a1210] border border-[#f87171]/30">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#f87171]">Delete Account & Revoke All Keys</span>
                <span className="text-xs text-[#B9A99B]">
                  Permanently wipe your account profile, all API keys, and connected agent authorizations. This action is irreversible.
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Key Confirmation Modal */}
      {isRegenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#21110B] border border-[#4A2819] shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3A2015] border border-[#63361F] flex items-center justify-center text-[#E08A3E]">
              <span className="material-symbols-outlined text-[28px]">refresh</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-bold text-[#FFF8F0]">
                Regenerate API Key?
              </h3>
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                Regenerating will immediately revoke your existing key. Any autonomous agents or SDK scripts using the old key will fail until updated.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
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
              >
                Yes, Regenerate Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#21110B] border border-[#ef4444]/40 shadow-2xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2a1210] border border-[#ef4444]/40 flex items-center justify-center text-[#f87171]">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-bold text-[#FFF8F0]">
                Delete VeraOS Account
              </h3>
              <p className="text-xs text-[#B9A99B] leading-relaxed">
                Type <strong className="text-[#f87171] font-mono">delete my account</strong> to confirm deletion. All data will be permanently wiped.
              </p>
            </div>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="delete my account"
              className="px-3.5 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2819] text-[#FFF8F0] font-mono text-xs focus:outline-none focus:border-[#ef4444]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={deleteConfirmationText.trim().toLowerCase() !== "delete my account"}
                onClick={handleDeleteAccount}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
