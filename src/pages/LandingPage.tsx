import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../context/ThemeContext";
import { NotificationsPopover, NotificationItem } from "../components/notifications/NotificationsPopover";
import { CommandPalette } from "../components/search/CommandPalette";

const INITIAL_LANDING_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_lp_1",
    type: "critical",
    title: "Verification #V-1048: Invariant Breaches",
    message: "Seamless Protocol TVL deficit (-$1.75M) and 90% compensation payout deficit.",
    time: "2m ago",
    path: "/verify/v_test_89bf2e",
    read: false,
  },
  {
    id: "notif_lp_2",
    type: "success",
    title: "EAS Attestation Confirmed",
    message: "Token audit #V-00022 verified on Base Mainnet. UID 0x12a9bc... finalized.",
    time: "14m ago",
    path: "/verify/v_test_pass_001",
    read: false,
  },
  {
    id: "notif_lp_3",
    type: "warning",
    title: "Unverified Bounty Claim",
    message: "Worker ScoutAgent reported 5 USDC payment without independent Base receipt.",
    time: "32m ago",
    path: "/verify/v_test_unver_003",
    read: false,
  },
];

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"curl" | "ts">("curl");
  const [copied, setCopied] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_LANDING_NOTIFICATIONS);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleCopyCode = () => {
    const code =
      activeTab === "curl"
        ? `curl -X POST https://api.veraos.network/v1/verify \\\n  -H "Authorization: Bearer vera_live_9f828a1c" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "task_id": "task_lend_usdc_004",\n    "network": "base-mainnet",\n    "invariants": [\n      { "metric": "tvl_threshold", "operator": ">=", "value": 10000000 },\n      { "metric": "exact_transfer", "asset": "USDC", "amount": 5.0 }\n    ],\n    "agent_submission": {\n      "tx_hash": "0x8a7b3c2141cde049fa8102391039bc0912",\n      "protocols": ["Seamless", "Moonwell", "Overnight"]\n    }\n  }'`
        : `import { VeraOS } from '@veraos/sdk';\n\nconst vera = new VeraOS({ apiKey: process.env.VERA_API_KEY });\n\nconst verification = await vera.verify({\n  task: 'task_lend_usdc_004',\n  chainId: 8453, // Base Mainnet\n  invariants: [\n    { rule: 'tvl_threshold', min: 10_000_000 },\n    { rule: 'exact_payment', amount: 5.0, token: 'USDC' }\n  ],\n  executionTrace: agentResult.trace\n});\n\nif (!verification.valid) {\n  await agent.remediate(verification.remediationDirectives);\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface bg-grid-tech min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-white/5">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 flex items-center justify-center bg-surface-container-high rounded transition-transform group-hover:scale-105 shadow-[0_0_12px_rgba(255,87,8,0.25)]">
                <svg
                  className="w-4 h-4 text-primary-container"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <polygon
                    fill="currentColor"
                    fillOpacity="0.15"
                    points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2"
                  />
                  <polyline points="12 2 12 12 21 7.5" />
                  <polyline points="12 12 3 7.5" />
                  <line x1="12" x2="12" y1="12" y2="22" />
                </svg>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                Vera<span className="text-primary-container">OS</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="transition-colors bg-surface-container-high text-on-surface font-headline-sm text-headline-sm rounded px-3 py-1.5"
              >
                Dashboard
              </Link>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
              >
                How It Works
              </a>
              <a
                href="#developers"
                className="px-3 py-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
              >
                Developers
              </a>
              <Link
                to="/agents/connect"
                className="px-3 py-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded transition-colors"
              >
                Connect Agent
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-space-xs sm:gap-space-sm">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-left cursor-pointer"
              title="Search telemetry and traces (⌘K)"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span className="hidden md:inline font-body-sm text-body-sm text-on-surface-variant">Search</span>
              <span className="hidden lg:inline font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline border border-white/5">
                ⌘K
              </span>
            </button>

            {/* Notifications Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(255,87,8,0.7)] animate-pulse" />
                )}
              </button>

              <NotificationsPopover
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>

            {/* Theme Toggle (Dark / White Theme) */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface bg-surface-container hover:bg-surface-container-high transition-all border border-white/5"
                >
                  Dashboard ({user?.name.split(" ")[0]})
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-primary hover:ring-2 hover:ring-primary-container flex items-center justify-center transition-all cursor-pointer"
                  title={`${user?.name} (Click to switch or manage account)`}
                >
                  <span className="material-symbols-outlined text-on-primary text-[18px]">
                    person
                  </span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-11 w-60 rounded-2xl bg-surface-container border border-white/10 shadow-2xl z-50 p-2.5 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 rounded-lg bg-surface-container-low flex flex-col">
                        <span className="font-semibold text-on-surface text-xs">
                          {user?.name}
                        </span>
                        <span className="text-[11px] text-outline font-code-sm truncate">
                          {user?.email}
                        </span>
                        <span className="text-[10px] text-secondary font-code-sm mt-0.5">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">grid_view</span>
                        <span>Open Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          openAuthModal("signup");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        <span>Sign Up New Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center justify-center px-3 sm:px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold text-[#ffb95f] hover:text-white bg-primary-container/20 hover:bg-primary-container transition-all border border-[#ffb95f]/40 shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            <Link
              to="/verify/new"
              className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-lg font-body-sm sm:font-body-md text-on-primary font-semibold bg-primary-container hover:bg-secondary-container transition-all shadow-[0_0_16px_rgba(255,87,8,0.35)] active:scale-[0.99] shrink-0"
            >
              <span className="hidden sm:inline">Run a Verification</span>
              <span className="sm:hidden">Verify</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-280px)]">
        <div className="flex flex-col w-full">
          {/* Top Ambient Glow & Kinetic Ribbon Canvas with 3D Wave Asset */}
          <div className="relative w-full overflow-hidden">
            {/* Background 3D Ribbon Wave Graphic Asset */}
            <div className="absolute -top-12 md:-top-16 inset-x-0 w-full h-[880px] md:h-[980px] pointer-events-none z-0 flex items-center justify-center opacity-85">
              <img
                alt="VeraOS Kinetic Ambient Glow"
                className="w-full h-full object-cover object-center filter saturate-125 brightness-105 select-none pointer-events-none mix-blend-screen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHzUnl7SYnEo2kdag-1WKSnWYqNEthZg_UhSXS95ugxx52YdIgdEkKpfktXgy63SGLK-Ey2IGElxVEXaUJmBoox4HznZZ5R9jbgyahDa8x6K79hVeu9Nn6Ch25mYFIIDtillGQ-yMJoPylSKDPlW85HunDazhJRH5iOTbrplCWxP3vP187Hy-YlSqkTEwlB91E-u0RTmBMZXIGJ7LWdI7QqoMrZSeiHd274Gvemuwni0emQbDhYYMSrw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-surface opacity-60" />
            </div>

            {/* Secondary atmospheric glow flares */}
            <div className="pointer-events-none absolute -top-40 right-[-10%] w-[980px] h-[780px] opacity-35 mix-blend-screen blur-[100px] bg-gradient-to-br from-primary-container via-secondary to-tertiary-container" />
            <div className="pointer-events-none absolute top-72 left-[-15%] w-[680px] h-[520px] opacity-25 mix-blend-screen blur-[110px] bg-gradient-to-tr from-primary via-on-primary-fixed-variant to-secondary-container" />

            {/* 1. HERO SECTION */}
            <section className="relative z-10 max-w-7xl mx-auto px-gutter pt-12 pb-24 flex flex-col items-center text-center">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 backdrop-blur-md border border-white/10 shadow-[0_0_24px_rgba(255,87,8,0.25)] mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                  AI AGENT VERIFICATION INFRASTRUCTURE · v2.4 KERNEL DEPLOYED
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display-hero text-display-hero md:text-[68px] md:leading-[74px] text-on-surface tracking-tight max-w-4xl mx-auto font-bold mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                Verify before you{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb59c] via-[#ffb95f] to-[#ff5708] drop-shadow-[0_0_28px_rgba(255,87,8,0.45)]">
                  trust
                </span>
                .
              </h1>

              {/* Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 text-balance drop-shadow-sm">
                VeraOS independently verifies the work of autonomous AI agents using cryptographic ground truth, onchain state, and web evidence before results are committed.
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <Link
                  to="/verify/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold shadow-[0_0_28px_rgba(255,87,8,0.45)] hover:bg-secondary-container hover:shadow-[0_0_36px_rgba(238,152,0,0.5)] transition-all"
                >
                  <span>Run a Verification</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container-high/90 backdrop-blur-md border border-[#ffb95f]/40 text-[#ffb95f] font-headline-sm text-headline-sm hover:bg-[#ffb95f]/10 transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person_add
                  </span>
                  <span>Sign Up Free</span>
                </button>
                <Link
                  to="/verify/v_test_89bf2e"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container-high/90 backdrop-blur-md border border-white/10 text-on-surface font-headline-sm text-headline-sm hover:bg-surface-variant transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    terminal
                  </span>
                  <span>Explore Demo</span>
                </Link>
              </div>

              {/* Floating Glassmorphic Showcase Cards */}
              <div className="w-full max-w-5xl mb-12 relative flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                {/* Card 1: Verification Identity */}
                <div className="w-full sm:w-80 p-5 rounded-2xl bg-gradient-to-br from-[#241c2c]/90 via-[#181922]/90 to-[#121318]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(160,120,255,0.15)] transform md:-rotate-6 hover:rotate-0 transition-transform duration-300 text-left relative overflow-hidden group">
                  <div className="absolute -top-16 -right-16 w-36 h-36 bg-tertiary-container/20 rounded-full blur-2xl group-hover:bg-primary-container/25 transition-colors" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[22px]">
                        contactless
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold">
                        VERA ATTESTED
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary-container/80 -mr-2" />
                      <div className="w-5 h-5 rounded-full bg-secondary/80 backdrop-blur-sm" />
                    </div>
                  </div>
                  <div className="font-code-sm text-code-sm text-on-surface-variant mb-1">
                    AGENT IDENTIFIER
                  </div>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-mono font-semibold tracking-wide mb-4">
                    ag_0x8453_9bf2
                  </div>
                  <div className="flex items-end justify-between pt-2 border-t border-white/10 text-[11px] font-code-sm text-on-surface-variant">
                    <div>
                      <div className="text-outline uppercase text-[9px]">
                        Consensus
                      </div>
                      <div className="text-secondary font-medium">
                        zk-EAS Base 8453
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-outline uppercase text-[9px]">
                        Proof Hash
                      </div>
                      <div className="text-primary font-mono">
                        0x7d2e...91aa
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Runtime Verification */}
                <div className="w-full sm:w-96 p-6 rounded-2xl bg-gradient-to-b from-surface-container-high/80 via-surface-container/75 to-surface-container-low/85 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(255,87,8,0.2)] transform md:rotate-3 hover:rotate-0 transition-transform duration-300 text-left relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center shadow-[0_0_12px_rgba(255,87,8,0.4)]">
                        <span className="material-symbols-outlined text-on-primary text-[16px]">
                          auto_awesome
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                          Optimization Agent
                        </h3>
                        <span className="font-code-sm text-[11px] text-on-surface-variant">
                          Runtime Status: Invariant Checked
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest border border-white/10 font-label-caps text-label-caps text-secondary font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      EVAL_LIVE
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-white/5 mb-3 font-code-sm text-code-sm text-on-surface-variant">
                    <div className="text-[11px] text-outline mb-1 font-label-caps uppercase">
                      Triangulated Quorum
                    </div>
                    <div className="text-on-surface font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check_circle
                      </span>
                      <span>Base Mempool state verified (0.50% bound asserted)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-code-sm text-on-surface-variant">
                    <span className="text-secondary font-semibold">
                      Attestation: EAS_BASE_MAINNET
                    </span>
                    <span className="text-outline">Latency: 142ms</span>
                  </div>
                </div>
              </div>

              {/* Technical Pipeline Flow Diagram */}
              <div className="w-full max-w-5xl rounded-xl bg-surface-container-low/85 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8 text-left relative">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                    <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider font-semibold">
                      RUNTIME ATTESTATION PIPELINE
                    </span>
                    <span className="text-outline font-code-sm text-code-sm">/</span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      NODE_CLUSTER_BASE_4
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-code-sm text-code-sm">
                    <span className="text-on-surface-variant">
                      Latency: <span className="text-secondary font-medium">142ms</span>
                    </span>
                    <span className="text-outline">|</span>
                    <span className="text-on-surface-variant">
                      Verdict Hash: <span className="text-primary font-mono">0x9f8c...3e1a</span>
                    </span>
                    <span className="text-outline">|</span>
                    <span className="text-on-surface-variant">
                      Standard: <span className="text-on-surface font-medium">EIP-712</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  <div className="flex flex-col p-4 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/5 shadow-md group hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                        STAGE 01
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                        smart_toy
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                      Worker Agent
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Emits structured intent, state deltas & claimed artifacts.
                    </p>
                    <div className="mt-auto px-2.5 py-1 rounded bg-surface-container-lowest font-code-sm text-code-sm text-secondary">
                      agent_dispatch.v2
                    </div>
                  </div>

                  <div className="flex flex-col p-4 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/5 shadow-md group hover:bg-surface-container-high transition-colors relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-caps text-label-caps text-primary uppercase font-semibold">
                        STAGE 02
                      </span>
                      <span className="material-symbols-outlined text-primary-container text-[18px]">
                        hub
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                      VeraOS Kernel
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Deconstructs task invariants into verifiable cryptographic checks.
                    </p>
                    <div className="mt-auto px-2.5 py-1 rounded bg-surface-container-lowest font-code-sm text-code-sm text-primary">
                      invariant_tree_split
                    </div>
                  </div>

                  <div className="flex flex-col p-4 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/5 shadow-md group hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                        STAGE 03
                      </span>
                      <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">
                        rule
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                      Triangulation
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Independent parallel queries across Base RPC & Web TLS-Notary.
                    </p>
                    <div className="mt-auto px-2.5 py-1 rounded bg-surface-container-lowest font-code-sm text-code-sm text-tertiary">
                      3-oracle_quorum
                    </div>
                  </div>

                  <div className="flex flex-col p-4 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/5 shadow-md group hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-caps text-label-caps text-error uppercase font-semibold">
                        STAGE 04
                      </span>
                      <span className="material-symbols-outlined text-error text-[18px]">
                        verified_user
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                      Cryptographic Verdict
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Deterministic signed verdict issued onchain: PASS / FAIL.
                    </p>
                    <div className="mt-auto px-2.5 py-1 rounded bg-error-container/40 text-on-error-container font-code-sm text-code-sm font-semibold flex items-center justify-between">
                      <span>VERDICT_REJECTED</span>
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex flex-col gap-2">
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-container via-secondary to-error w-3/4 rounded-full" />
                  </div>
                  <div className="flex justify-between text-on-surface-variant font-code-sm text-code-sm">
                    <span>Trace ID: trc_8841ae9</span>
                    <span>Quorum Consensual Check: 3/3 Validated</span>
                    <span className="text-error font-medium">Invariants Breached: 2</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 2. THE PROBLEM SECTION */}
          <section className="max-w-7xl mx-auto px-gutter py-20 w-full relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold mb-3 block">
                  SYSTEMIC FAILURE MODES
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  AI agents can say they're done.
                  <br />
                  That doesn't mean they're right.
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Autonomous agents frequently hallucinate successful completion, swallow unhandled execution errors, and invent external API confirmations. Without independent verification, agent execution in production is purely speculative.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md hover:bg-surface-container transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container-highest font-label-caps text-label-caps text-primary uppercase">
                      DEF-01: MISREPORTING
                    </span>
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      warning
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    Incorrect Claims
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Agent reports swap completed with 0.5% slippage; independent mempool reconstruction proves actual execution suffered 4.2% loss.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline flex items-center justify-between">
                  <span className="text-on-surface-variant">Claim: 0.50%</span>
                  <span className="text-error font-medium">Delta: +3.70%</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md hover:bg-surface-container transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container-highest font-label-caps text-label-caps text-secondary uppercase">
                      DEF-02: OMISSIONS
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      playlist_remove
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    Missing Requirements
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Sub-agent silently dropped static bytecode analysis step due to context window truncation, then declared full audit clearance.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline flex items-center justify-between">
                  <span className="text-on-surface-variant">Required: 4 gates</span>
                  <span className="text-error font-medium">Executed: 3 gates</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md hover:bg-surface-container transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container-highest font-label-caps text-label-caps text-error uppercase">
                      DEF-03: ROUTING
                    </span>
                    <span className="material-symbols-outlined text-error text-[20px]">
                      wrong_location
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    Wrong Transactions
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Funds transferred to an unverified implementation proxy on an unintended testnet fork because chain ID derivation was not asserted.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline flex items-center justify-between">
                  <span className="text-on-surface-variant">Expected: 8453 (Base)</span>
                  <span className="text-error font-medium">Actual: 84532 (Sepolia)</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md hover:bg-surface-container transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container-highest font-label-caps text-label-caps text-tertiary uppercase">
                      DEF-04: ATTESTATION
                    </span>
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      sentiment_dissatisfied
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    Weak Evidence
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Agent provides conversational text asserting compliance instead of supplying verifiable cryptographic receipts or signature proofs.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline flex items-center justify-between">
                  <span className="text-on-surface-variant">Proof Type: Text LLM</span>
                  <span className="text-error font-medium">Unverifiable</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-md hover:bg-surface-container transition-colors flex flex-col justify-between md:col-span-2 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded bg-surface-container-highest font-label-caps text-label-caps text-primary-container uppercase">
                      DEF-05: CEILING VIOLATION
                    </span>
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      security_update_warning
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    Out-of-Bounds Execution
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Autonomous execution loops exceeded approved max gas expenditure ceilings and mutated unauthorized contract storage slots outside its defined policy sandbox.
                  </p>
                </div>
                <div className="p-3 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline flex flex-wrap items-center justify-between gap-2">
                  <span className="text-on-surface-variant">Max Gas Authorized: 250,000</span>
                  <span className="text-error font-medium">
                    Observed: 1,420,891 (Limit Exceeded & Storage Slot 0x03 Mutated)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. HOW IT WORKS */}
          <section className="bg-surface-container-lowest py-24 w-full relative overflow-hidden" id="how-it-works">
            <div className="pointer-events-none absolute -bottom-48 -left-48 w-96 h-96 bg-primary-container/10 rounded-full blur-[110px]" />
            <div className="max-w-7xl mx-auto px-gutter relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold mb-3 block">
                  EXECUTION ARCHITECTURE
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-4">
                  How VeraOS Verifies Agent Outcomes
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  A 4-step deterministic protocol pipeline bridging natural language agent tasks with immutable state validation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 relative shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold mb-5 shadow-[0_0_12px_rgba(255,87,8,0.2)]">
                    01
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                    Task Ingestion
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Tasks are registered alongside formal declarative invariants, numerical boundaries, and contract permission boundaries.
                  </p>
                  <div className="font-code-sm text-code-sm text-outline bg-surface-container-lowest p-2.5 rounded">
                    invariant: tvl &gt;= 10M<br />
                    invariant: transfer == 5.0
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 relative shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary font-bold mb-5 shadow-[0_0_12px_rgba(255,87,8,0.2)]">
                    02
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                    Claim Parsing
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Extracts structured assertions from agent response traces, isolating claimed txHashes, protocol names, and amounts.
                  </p>
                  <div className="font-code-sm text-code-sm text-outline bg-surface-container-lowest p-2.5 rounded">
                    parsed_claims: [3]<br />
                    receipt_targets: [1]
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 relative shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-secondary font-bold mb-5 shadow-[0_0_12px_rgba(238,152,0,0.2)]">
                    03
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                    Evidence Grounding
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Directly queries Base RPC nodes, TLS-notarized web snapshots, and mempool receipts. No agent-provided data is trusted.
                  </p>
                  <div className="font-code-sm text-code-sm text-outline bg-surface-container-lowest p-2.5 rounded">
                    rpc_query: Base_8453<br />
                    tls_proof: valid
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 relative shadow-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-headline-sm text-headline-sm text-primary-container font-bold mb-5 shadow-[0_0_16px_rgba(255,87,8,0.35)]">
                    04
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                    Attestation Verdict
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Issues deterministic signed cryptographic verdicts (PASS / FAIL) committed to the onchain EAS registry.
                  </p>
                  <div className="font-code-sm text-code-sm text-primary-container bg-surface-container-lowest p-2.5 rounded font-semibold">
                    verdict: EVALUATED<br />
                    status: REJECTED
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. THREE EVIDENCE PILLARS */}
          <section className="max-w-7xl mx-auto px-gutter py-24 w-full relative">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-gradient-to-r from-primary-container/10 via-secondary/15 to-tertiary-container/10 rounded-full blur-[120px]" />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 relative z-10">
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold mb-3 block">
                  EVIDENCE TRIANGULATION
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Don't trust the output. Check the evidence.
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Every agent execution assertion is validated simultaneously across three independent cryptographic vectors.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              <div className="p-8 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-primary-container/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold font-code-md text-code-md">
                      01
                    </span>
                    <span className="px-3 py-1 rounded bg-surface-container font-label-caps text-label-caps uppercase text-secondary font-semibold">
                      ONCHAIN STATE
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-3">
                    Base Mainnet Core
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Verifies raw transaction receipts, internal traces, emitted EVM event logs, gas usage meters, and contract storage changes directly via multi-client Base RPC nodes.
                  </p>
                </div>
                <ul className="space-y-3 font-code-sm text-code-sm text-on-surface-variant pt-4 bg-surface-container-lowest/90 p-4 rounded-lg border border-white/5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      check_circle
                    </span>
                    <span>Receipt Status & Block Index</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      check_circle
                    </span>
                    <span>Accurate ERC20 Decimal Normalization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      check_circle
                    </span>
                    <span>Direct State Diff Inspection</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-secondary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary font-bold font-code-md text-code-md">
                      02
                    </span>
                    <span className="px-3 py-1 rounded bg-surface-container font-label-caps text-label-caps uppercase text-secondary font-semibold">
                      TLS-NOTARIZATION
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-3">
                    Independent Web Oracles
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Proves real-world data points like protocol TVL, external pricing feeds, or API endpoints using immutable TLS session proofs and cryptographic session hashes.
                  </p>
                </div>
                <ul className="space-y-3 font-code-sm text-code-sm text-on-surface-variant pt-4 bg-surface-container-lowest/90 p-4 rounded-lg border border-white/5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      check_circle
                    </span>
                    <span>TLSNotary Session Zero-Knowledge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      check_circle
                    </span>
                    <span>Timestamped JSON Path Match</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      check_circle
                    </span>
                    <span>Tamper-Proof REST Body Extraction</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col justify-between hover:border-tertiary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary font-bold font-code-md text-code-md">
                      03
                    </span>
                    <span className="px-3 py-1 rounded bg-surface-container font-label-caps text-label-caps uppercase text-tertiary font-semibold">
                      TRACE AUDIT
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-3">
                    Agent Execution Trace
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Deeply examines the agent's full tool invocation log, token expenditure, system prompt obedience, and context integrity to ensure no steps were omitted.
                  </p>
                </div>
                <ul className="space-y-3 font-code-sm text-code-sm text-on-surface-variant pt-4 bg-surface-container-lowest/90 p-4 rounded-lg border border-white/5">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">
                      check_circle
                    </span>
                    <span>Tool Invocation Parameter Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">
                      check_circle
                    </span>
                    <span>Invariant Constraint Bounds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">
                      check_circle
                    </span>
                    <span>Structured JSON Schema Compliance</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. PRODUCT DEMO (Interactive Developer Console) */}
          <section className="bg-surface-container-lowest py-24 w-full relative overflow-hidden" id="demo">
            <div className="pointer-events-none absolute -top-40 right-[-15%] w-[800px] h-[600px] bg-gradient-to-l from-primary-container/15 via-secondary/10 to-transparent blur-[120px]" />
            <div className="max-w-7xl mx-auto px-gutter relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-error/30 font-label-caps text-label-caps uppercase text-error mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    LIVE AUDIT INCIDENT BENCHMARK
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    The Verification Console
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  A realistic production scenario: An autonomous DeFi operations agent reported successful task execution, but VeraOS kernel caught dual critical invariant breaches.
                </p>
              </div>

              {/* Main Developer Console Window */}
              <div className="rounded-2xl bg-surface/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="bg-surface-container-high/90 border-b border-white/5 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-error" />
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <div className="w-3 h-3 rounded-full bg-surface-bright" />
                    </div>
                    <span className="font-code-sm text-code-sm text-on-surface font-medium pl-2">
                      vera_verifier_cli --stream --eval-id=984f1a20
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                      Network: Base (8453)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-caps text-label-caps uppercase font-bold">
                      REJECTED
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-low/80 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">
                      assignment
                    </span>
                    <div>
                      <div className="font-label-caps text-label-caps uppercase text-outline font-semibold">
                        TASK MANDATE
                      </div>
                      <p className="font-code-md text-code-md text-on-surface font-semibold">
                        “Find 3 Base lending protocols with TVL above $10M and pay 5 USDC.”
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-code-sm text-code-sm px-3 py-1.5 rounded bg-surface-container-high text-on-surface-variant">
                      Invariants: 2
                    </span>
                    <span className="font-code-sm text-code-sm px-3 py-1.5 rounded bg-surface-container-high text-on-surface-variant">
                      Quorum: Strict
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                  {/* Left Column */}
                  <div className="p-6 bg-surface/80">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                          smart_toy
                        </span>
                        WORKER AGENT CLAIM (SUBMISSION)
                      </span>
                      <span className="font-code-sm text-code-sm text-primary">
                        Status: Self-Reported Success
                      </span>
                    </div>
                    <div className="bg-surface-container-lowest/90 border border-white/5 p-4 rounded-lg font-code-sm text-code-sm text-on-surface space-y-3">
                      <p className="text-on-surface-variant">
                        “Execution finished with complete fidelity. Protocols identified:”
                      </p>
                      <ul className="space-y-1 pl-4 list-disc text-on-surface">
                        <li>
                          <span className="text-on-surface font-semibold">Seamless Protocol:</span> Reported TVL <span className="text-secondary">$8.2M</span>
                        </li>
                        <li>
                          <span className="text-on-surface font-semibold">Moonwell:</span> Reported TVL <span className="text-secondary">$45.0M</span>
                        </li>
                        <li>
                          <span className="text-on-surface font-semibold">Overnight:</span> Reported TVL <span className="text-secondary">$12.0M</span>
                        </li>
                      </ul>
                      <div className="pt-3">
                        <div className="text-on-surface-variant">Dispatched Payment:</div>
                        <div className="text-secondary font-mono">
                          Sent 5.0 USDC -&gt; recipient 0x3f982...48a
                        </div>
                        <div className="text-outline text-[11px]">
                          TxHash: 0x8a7b3c21...41cd
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="p-6 bg-surface-container-low/70">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-label-caps text-label-caps uppercase text-primary-container font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                          verified
                        </span>
                        VERAOS INDEPENDENT TRIANGULATION
                      </span>
                      <span className="font-code-sm text-code-sm text-error font-semibold">
                        2 VIOLATIONS FLAGGED
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-surface-container/90 border border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-error text-[18px]">
                              cancel
                            </span>
                            <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                              Invariant 1: [TVL &gt; $10M for all 3]
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps uppercase font-bold">
                            FAILED
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                          DefiLlama Base mainnet verified TVL for Seamless Protocol is <span className="text-error font-medium font-mono">$8,241,900</span>.
                        </p>
                        <div className="font-code-sm text-code-sm text-error bg-surface-container-lowest p-2 rounded">
                          Delta: -$1,758,100 below required $10,000,000 threshold.
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-surface-container/90 border border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-error text-[18px]">
                              cancel
                            </span>
                            <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                              Invariant 2: [Payment exact 5.00 USDC]
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-caps text-label-caps uppercase font-bold">
                            FAILED
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                          Base TxReceipt <span className="font-mono text-on-surface">0x8a7b...41cd</span> transferred <span className="text-error font-medium font-mono">500,000 base units (0.5 USDC)</span> due to decimal math error.
                        </p>
                        <div className="font-code-sm text-code-sm text-error bg-surface-container-lowest p-2 rounded">
                          Underfunded by 4.5 USDC. Agent hallucinated transfer perfection.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-surface-container-highest/90 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-[24px]">
                      gpp_bad
                    </span>
                    <div>
                      <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        TASK NOT VERIFIED — STATUS: VERDICT_REJECTED
                      </div>
                      <div className="font-code-sm text-code-sm text-on-surface-variant">
                        Deterministic attestation committed to Base registry at block #21,849,201
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/verify/v_test_89bf2e"
                    className="px-4 py-2 rounded bg-surface-container text-on-surface font-headline-sm text-headline-sm hover:bg-surface-bright transition-colors"
                  >
                    Inspect Full Verification #V-1048
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 6. DEVELOPER SECTION (API & SDK) */}
          <section className="bg-surface-container-lowest py-24 w-full" id="developers">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold mb-3 block">
                    DEVELOPER PRIMITIVES
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Built for agents, not just humans.
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Simple REST, WebSocket, and TypeScript SDK integrations. Insert a single verification assertion call into any LangChain, AutoGPT, or CrewAI workflow.
                </p>
              </div>

              <div className="rounded-2xl bg-surface/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="bg-surface-container-high/90 border-b border-white/5 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveTab("curl")}
                      className={`font-label-caps text-label-caps uppercase font-bold px-3 py-1.5 rounded ${
                        activeTab === "curl"
                          ? "text-primary bg-surface-container"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      cURL (POST /v1/verify)
                    </button>
                    <button
                      onClick={() => setActiveTab("ts")}
                      className={`font-label-caps text-label-caps uppercase font-bold px-3 py-1.5 rounded ${
                        activeTab === "ts"
                          ? "text-primary bg-surface-container"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      TypeScript SDK
                    </button>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface font-code-sm text-code-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {activeTab === "curl" ? (
                  <div className="p-6 overflow-x-auto bg-surface font-code-sm text-code-sm text-on-surface-variant leading-relaxed">
                    <div className="text-outline mb-2"># Request verification for an autonomous agent execution</div>
                    <span className="text-primary-container">curl</span> -X POST https://api.veraos.network/v1/verify \<br />
                    &nbsp;&nbsp;-H <span className="text-secondary">"Authorization: Bearer vera_live_9f828a1c"</span> \<br />
                    &nbsp;&nbsp;-H <span className="text-secondary">"Content-Type: application/json"</span> \<br />
                    &nbsp;&nbsp;-d <span className="text-on-surface">{`'{
  "task_id": "task_lend_usdc_004",
  "network": "base-mainnet",
  "invariants": [
    { "metric": "tvl_threshold", "operator": ">=", "value": 10000000 },
    { "metric": "exact_transfer", "asset": "USDC", "amount": 5.0 }
  ],
  "agent_submission": {
    "tx_hash": "0x8a7b3c2141cde049fa8102391039bc0912",
    "protocols": ["Seamless", "Moonwell", "Overnight"]
  }
}'`}</span>
                  </div>
                ) : (
                  <div className="p-6 overflow-x-auto bg-surface font-code-sm text-code-sm text-on-surface-variant leading-relaxed">
                    <span className="text-primary-container">import</span> &#123; VeraOS &#125; <span className="text-primary-container">from</span> <span className="text-secondary">'@veraos/sdk'</span>;<br /><br />
                    <span className="text-primary-container">const</span> vera = <span className="text-primary-container">new</span> VeraOS(&#123; apiKey: process.env.VERA_API_KEY &#125;);<br /><br />
                    <span className="text-primary-container">const</span> verification = <span className="text-primary-container">await</span> vera.verify(&#123;<br />
                    &nbsp;&nbsp;task: <span className="text-secondary">'task_lend_usdc_004'</span>,<br />
                    &nbsp;&nbsp;chainId: 8453, <span className="text-outline">// Base Mainnet</span><br />
                    &nbsp;&nbsp;invariants: [<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#123; rule: <span className="text-secondary">'tvl_threshold'</span>, min: 10_000_000 &#125;,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#123; rule: <span className="text-secondary">'exact_payment'</span>, amount: 5.0, token: <span className="text-secondary">'USDC'</span> &#125;<br />
                    &nbsp;&nbsp;],<br />
                    &nbsp;&nbsp;executionTrace: agentResult.trace<br />
                    &#125;);<br /><br />
                    <span className="text-primary-container">if</span> (!verification.valid) &#123;<br />
                    &nbsp;&nbsp;<span className="text-primary-container">await</span> agent.remediate(verification.remediationDirectives);<br />
                    &#125;
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 7. BASE ONCHAIN PROOF */}
          <section className="max-w-7xl mx-auto px-gutter py-24 w-full">
            <div className="p-8 md:p-12 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="pointer-events-none absolute -right-20 -bottom-20 w-96 h-96 bg-primary-container/15 rounded-full blur-[90px]" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/5 font-label-caps text-label-caps uppercase text-secondary font-bold mb-4">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      token
                    </span>
                    BASE MAINNET ATTESTATION REGISTRY
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-4">
                    Proof that lives beyond the agent.
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Every verification verdict generates an immutable attestation via the Ethereum Attestation Service (EAS) on Base. Smart contracts and downstream agents can query attestation validity directly via onchain interfaces.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-lg bg-surface-container-lowest/90 border border-white/5">
                      <div className="font-label-caps text-label-caps text-outline uppercase">
                        EAS SCHEMA ID
                      </div>
                      <div className="font-code-sm text-code-sm text-on-surface font-semibold truncate">
                        0x9a4f22...10cc
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-surface-container-lowest/90 border border-white/5">
                      <div className="font-label-caps text-label-caps text-outline uppercase">
                        FINALITY
                      </div>
                      <div className="font-code-sm text-code-sm text-primary font-semibold">
                        Instant (L2 Final)
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-surface-container-lowest/90 border border-white/5">
                      <div className="font-label-caps text-label-caps text-outline uppercase">
                        ATTESTATION COST
                      </div>
                      <div className="font-code-sm text-code-sm text-secondary font-semibold">
                        &lt; $0.0008 / txn
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-96 p-6 rounded-2xl bg-surface-container-high/90 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                      ATTESTATION RECEIPT
                    </span>
                    <span className="flex items-center gap-1 font-code-sm text-code-sm text-[#4ade80]">
                      <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
                      Confirmed
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-white/5 font-code-sm text-code-sm space-y-2">
                    <div className="text-on-surface-variant">Attester:</div>
                    <div className="text-on-surface truncate font-mono text-[12px]">
                      0xVeraKernel845391a20b0849208a001
                    </div>
                    <div className="text-on-surface-variant pt-1">UID:</div>
                    <div className="text-secondary truncate font-mono text-[12px]">
                      0x4c2810a9918230fec00281b378129031
                    </div>
                  </div>
                  <Link
                    to="/verify/v_test_89bf2e"
                    className="w-full py-2.5 rounded bg-surface-container text-on-surface font-headline-sm text-headline-sm text-center hover:bg-surface-bright transition-colors flex items-center justify-center gap-2 border border-white/5"
                  >
                    <span>View in VeraOS Console</span>
                    <span className="material-symbols-outlined text-[16px]">
                      open_in_new
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FINAL CTA */}
          <section className="max-w-7xl mx-auto px-gutter pt-12 pb-24 w-full">
            <div className="p-12 md:p-16 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-white/10 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-[600px] h-[350px] bg-gradient-to-r from-primary-container via-secondary to-tertiary-container rounded-full blur-[100px]" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold mb-4 block">
                  ZERO-HALLUCINATION RUNTIME
                </span>
                <h2 className="font-display-hero text-display-hero md:text-[52px] md:leading-[60px] text-on-surface font-bold mb-6 drop-shadow-sm">
                  Trust the work. Not the claim.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
                  Integrate the VeraOS verification kernel into your agent swarms in under 5 minutes. Protect your protocols, smart contracts, and users from silent failures.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                  <Link
                    to="/verify/new"
                    className="px-8 py-3.5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold shadow-[0_0_24px_rgba(255,87,8,0.4)] hover:bg-secondary-container transition-all"
                  >
                    Run a Verification
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="px-8 py-3.5 rounded-lg bg-surface-container-high/90 backdrop-blur-md border border-[#ffb95f]/40 text-[#ffb95f] font-headline-sm text-headline-sm hover:bg-[#ffb95f]/10 transition-colors cursor-pointer shadow-sm"
                  >
                    Sign Up Free
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3.5 rounded-lg bg-surface-container-high/90 backdrop-blur-md border border-white/10 text-on-surface font-headline-sm text-headline-sm hover:bg-surface-variant transition-colors"
                  >
                    Explore Dashboard
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 font-code-sm text-code-sm text-on-surface-variant">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      verified
                    </span>
                    <span>Verifying 450,000+ daily agent actions</span>
                  </span>
                  <span className="text-outline">•</span>
                  <span>Base & Ethereum Native</span>
                  <span className="text-outline">•</span>
                  <span>Open Standards (EAS · EIP-712)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-space-xl shadow-[0_-1px_12px_rgba(0,0,0,0.5)] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg bg-surface-container-low/40 rounded-lg p-space-md border border-white/5">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
                </span>
                <span className="font-code-sm text-code-sm text-on-surface">
                  Base Mainnet Operational
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  API Latency
                </span>
                <span className="font-code-sm text-code-sm text-secondary font-medium">
                  14ms
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm font-code-sm text-code-sm text-on-surface-variant">
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Epoch
              </span>
              <span className="text-on-surface font-code-sm text-code-sm">
                #894,204
              </span>
              <span className="text-outline">|</span>
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Consensus
              </span>
              <span className="text-on-surface font-code-sm text-code-sm">
                Zero-Knowledge
              </span>
            </div>
          </div>

          <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-code-sm text-code-sm border-t border-white/5">
            <p>© 2026 VeraOS Foundation. All runtime verification rights reserved.</p>
            <div className="flex items-center gap-space-md font-body-sm text-body-sm">
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                v2.14.0-rc4
              </span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span className="text-on-surface-variant">Obsidian Core</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};
