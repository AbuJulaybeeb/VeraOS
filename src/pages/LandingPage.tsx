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
    title: "Verification #V-1048: Payment Deficit",
    message: "Worker claimed 5.0 USDC, but Stellar Horizon ledger recorded only 0.50 USDC (4.50 USDC missing).",
    time: "2m ago",
    path: "/verify/v_test_89bf2e",
    read: false,
  },
  {
    id: "notif_lp_2",
    type: "success",
    title: "Stellar Payment Verified",
    message: "Transaction verified on Stellar Testnet. 5.00 USDC confirmed on ledger.",
    time: "14m ago",
    path: "/verify/v_test_pass_001",
    read: false,
  },
  {
    id: "notif_lp_3",
    type: "warning",
    title: "Missing Transaction Hash",
    message: "Worker claimed bounty was sent, but gave no Stellar transaction hash.",
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
        ? `curl -X POST https://api.veraos.network/v1/verify \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "task": "Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.",\n    "worker": {\n      "id": "agent-alpha-09",\n      "name": "Autonomous Worker",\n      "output": "1. Blend Protocol — $14M TVL\\n2. YieldBlox — $11M TVL\\n3. Aqua Network — $18M TVL\\nSent 5.0 USDC TxHash: 0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"\n    }\n  }'`
        : `import { VeraOS } from '@veraos/sdk';\n\nconst vera = new VeraOS();\n\nconst verification = await vera.verify({\n  task: 'Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.',\n  worker: {\n    id: 'agent-alpha-09',\n    output: agentExecutionResult.text\n  }\n});\n\nif (verification.verdict.status !== 'VERIFIED') {\n  console.log('Correction required:', verification.remediation?.directives);\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#160C08] font-body-md text-[#F3E5D5] bg-grid-tech min-h-screen selection:bg-[#C96A2B] selection:text-[#FFF8F0]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#160C08]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.6)] border-b border-[#4A2B1D]/40">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center bg-[#2C1710] rounded-lg transition-transform group-hover:scale-105 shadow-[0_0_16px_rgba(201,106,43,0.35)] border border-[#4A2B1D]">
                <svg
                  className="w-4 h-4 text-[#E08A3E]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <polygon
                    fill="currentColor"
                    fillOpacity="0.2"
                    points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2"
                  />
                  <polyline points="12 2 12 12 21 7.5" />
                  <polyline points="12 12 3 7.5" />
                  <line x1="12" x2="12" y1="12" y2="22" />
                </svg>
              </div>
              <span className="font-headline-sm text-headline-sm text-[#FFF8F0] tracking-tight font-bold">
                Vera<span className="text-[#E08A3E]">OS</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="transition-colors bg-[#2C1710] text-[#FFF8F0] font-headline-sm text-headline-sm rounded px-3 py-1.5 border border-[#4A2B1D]/50"
              >
                Dashboard
              </Link>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 font-body-md text-body-md text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] rounded transition-colors"
              >
                How It Works
              </a>
              <a
                href="#demo"
                className="px-3 py-1.5 font-body-md text-body-md text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] rounded transition-colors"
              >
                Live Test
              </a>
              <a
                href="#developers"
                className="px-3 py-1.5 font-body-md text-body-md text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] rounded transition-colors"
              >
                Developers
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-xs text-[#B9A99B] hover:text-[#FFF8F0] hover:border-[#C96A2B]/60 transition-all cursor-pointer shadow-sm"
              title="Quick Search (Ctrl+K or Cmd+K)"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Search verifications...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#2C1710] text-[10px] text-[#B9A99B] border border-[#4A2B1D]">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C96A2B] shadow-[0_0_8px_rgba(201,106,43,0.8)] animate-pulse" />
                )}
              </button>

              <NotificationsPopover
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-[#FFF8F0] bg-[#2C1710] hover:bg-[#3A2015] transition-all border border-[#4A2B1D]"
                >
                  Dashboard ({user?.name.split(" ")[0]})
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-[#C96A2B] hover:ring-2 hover:ring-[#E08A3E] flex items-center justify-center transition-all cursor-pointer text-white"
                  title={`${user?.name} (Account)`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-11 w-60 rounded-2xl bg-[#21110B] border border-[#4A2B1D] shadow-2xl z-50 p-2.5 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 rounded-lg bg-[#160C08] flex flex-col">
                        <span className="font-semibold text-[#FFF8F0] text-xs">
                          {user?.name}
                        </span>
                        <span className="text-[11px] text-[#B9A99B] truncate">
                          {user?.email}
                        </span>
                        <span className="text-[10px] text-[#E08A3E] mt-0.5">
                          {user?.role}
                        </span>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2C1710] transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">grid_view</span>
                        <span>Open Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-2"
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
                  className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg font-body-sm text-body-sm text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center justify-center px-3 sm:px-3.5 py-1.5 rounded-lg font-body-sm text-body-sm font-semibold text-[#E08A3E] hover:text-white bg-[#C96A2B]/20 hover:bg-[#C96A2B] transition-all border border-[#C96A2B]/40 shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            <Link
              to="/verify/new"
              className="inline-flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-lg font-body-sm sm:font-body-md text-white font-semibold bg-[#C96A2B] hover:bg-[#E08A3E] transition-all shadow-[0_0_18px_rgba(201,106,43,0.45)] active:scale-[0.99] shrink-0"
            >
              <span className="hidden sm:inline">Run Verification</span>
              <span className="sm:hidden">Verify</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 bg-[#160C08] min-h-[calc(100vh-280px)]">
        <div className="flex flex-col w-full">
          {/* Top Ambient Glow & Kinetic Warm Waves */}
          <div className="relative w-full overflow-hidden">
            {/* Background Warm Molten Wave Graphic Asset */}
            <div className="absolute -top-12 md:-top-16 inset-x-0 w-full h-[880px] md:h-[980px] pointer-events-none z-0 flex items-center justify-center opacity-75">
              <img
                alt="VeraOS Warm Molten Wave Ambient"
                className="w-full h-full object-cover object-center filter saturate-125 sepia-50 brightness-95 select-none pointer-events-none mix-blend-screen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHzUnl7SYnEo2kdag-1WKSnWYqNEthZg_UhSXS95ugxx52YdIgdEkKpfktXgy63SGLK-Ey2IGElxVEXaUJmBoox4HznZZ5R9jbgyahDa8x6K79hVeu9Nn6Ch25mYFIIDtillGQ-yMJoPylSKDPlW85HunDazhJRH5iOTbrplCWxP3vP187Hy-YlSqkTEwlB91E-u0RTmBMZXIGJ7LWdI7QqoMrZSeiHd274Gvemuwni0emQbDhYYMSrw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#160C08] via-transparent to-[#160C08] opacity-95" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#160C08] via-transparent to-[#160C08] opacity-70" />
            </div>

            {/* Secondary warm molten glow flares */}
            <div className="pointer-events-none absolute -top-40 right-[-10%] w-[980px] h-[780px] opacity-25 mix-blend-screen blur-[120px] bg-gradient-to-br from-[#C96A2B] via-[#E08A3E] to-[#3A2015]" />
            <div className="pointer-events-none absolute top-72 left-[-15%] w-[680px] h-[520px] opacity-20 mix-blend-screen blur-[130px] bg-gradient-to-tr from-[#E6A15A] via-[#C96A2B] to-[#21110B]" />

            {/* 1. HERO SECTION */}
            <section className="relative z-10 max-w-7xl mx-auto px-gutter pt-14 pb-20 flex flex-col items-center text-center">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#21110B]/90 backdrop-blur-md border border-[#4A2B1D] shadow-[0_0_24px_rgba(201,106,43,0.2)] mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A2B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E08A3E]" />
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold">
                  INDEPENDENT PROOF FOR AI AGENTS · STELLAR NATIVE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display-hero text-display-hero md:text-[68px] md:leading-[74px] text-[#FFF8F0] tracking-tight max-w-4xl mx-auto font-bold mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                Verify before you{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8F0] via-[#E08A3E] to-[#C96A2B] drop-shadow-[0_0_28px_rgba(201,106,43,0.45)]">
                  trust
                </span>
                .
              </h1>

              {/* Plain English Subtitle */}
              <p className="font-body-lg text-body-lg text-[#B9A99B] max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
                When an AI agent says “Task completed” or “Payment sent”, how do you know it really happened? VeraOS independently verifies AI agent work against real Stellar blockchain data before you pay.
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <Link
                  to="/verify/new"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C96A2B] text-white font-headline-sm text-headline-sm font-semibold shadow-[0_0_28px_rgba(201,106,43,0.45)] hover:bg-[#E08A3E] transition-all"
                >
                  <span>Verify an Agent's Work</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#E08A3E] font-headline-sm text-headline-sm hover:bg-[#2C1710] transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person_add
                  </span>
                  <span>Sign Up Free</span>
                </button>
                <Link
                  to="/verify/v_test_89bf2e"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#FFF8F0] font-headline-sm text-headline-sm hover:bg-[#2C1710] transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[#E08A3E] text-[20px]">
                    terminal
                  </span>
                  <span>See Live Example</span>
                </Link>
              </div>

              {/* Real World Showcase Cards */}
              <div className="w-full max-w-5xl mb-12 relative flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                {/* Card 1: Verified Stellar Transaction */}
                <div className="w-full sm:w-80 p-5 rounded-2xl bg-gradient-to-br from-[#2C1710]/95 via-[#21110B]/95 to-[#160C08]/95 backdrop-blur-2xl border border-[#4A2B1D] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(201,106,43,0.15)] transform md:-rotate-4 hover:rotate-0 transition-transform duration-300 text-left relative overflow-hidden group">
                  <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C96A2B]/15 rounded-full blur-2xl group-hover:bg-[#E08A3E]/25 transition-colors" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#E08A3E] text-[20px]">
                        verified
                      </span>
                      <span className="font-label-caps text-label-caps text-[#FFF8F0] uppercase tracking-wider font-bold">
                        VERIFIED ON STELLAR
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-[11px] text-[#B9A99B] uppercase font-semibold mb-1">
                    AGENT TASK
                  </div>
                  <div className="font-semibold text-sm text-[#FFF8F0] mb-3">
                    Transfer 5.00 USDC to Worker
                  </div>
                  <div className="pt-2 border-t border-[#4A2B1D]/60 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-[#B9A99B]">
                      <span>Amount Verified:</span>
                      <span className="text-[#FFF8F0] font-mono font-bold">5.00 USDC</span>
                    </div>
                    <div className="flex justify-between text-[#B9A99B]">
                      <span>Stellar Ledger:</span>
                      <span className="text-[#E08A3E] font-mono">Ledger #1,048,576</span>
                    </div>
                    <div className="flex justify-between text-[#B9A99B]">
                      <span>Source:</span>
                      <span className="text-emerald-400 font-medium">Stellar Horizon Testnet</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Caught Deceptive Claim */}
                <div className="w-full sm:w-96 p-6 rounded-2xl bg-gradient-to-b from-[#2C1710]/95 via-[#21110B]/95 to-[#160C08]/95 backdrop-blur-2xl border border-red-900/40 shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(239,68,68,0.15)] transform md:rotate-2 hover:rotate-0 transition-transform duration-300 text-left relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-900/10 rounded-full blur-2xl" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-800/50 flex items-center justify-center text-red-400">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#FFF8F0] leading-tight">
                          Discrepancy Detected
                        </h3>
                        <span className="text-[11px] text-[#B9A99B]">
                          Agent claimed success, but underpaid
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-red-950/70 border border-red-800/50 text-[10px] text-red-400 font-bold">
                      FAILED
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] mb-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#B9A99B]">Agent Claimed:</span>
                      <span className="text-[#FFF8F0] font-mono font-medium">Sent 5.00 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B9A99B]">Actual Transfer:</span>
                      <span className="text-red-400 font-mono font-bold">0.50 USDC</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#4A2B1D]/40">
                      <span className="text-[#E08A3E] font-medium">Missing Deficit:</span>
                      <span className="text-red-400 font-mono font-bold">4.50 USDC remaining</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#B9A99B] flex items-center justify-between">
                    <span>Remediation: Worker prompted to execute 4.5 USDC transfer</span>
                  </div>
                </div>
              </div>

              {/* 4-Step Plain English Workflow */}
              <div className="w-full max-w-5xl rounded-2xl bg-[#21110B]/90 backdrop-blur-xl border border-[#4A2B1D] shadow-2xl p-6 sm:p-8 text-left relative">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#4A2B1D]/60">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E08A3E] animate-pulse" />
                    <span className="font-label-caps text-label-caps uppercase text-[#FFF8F0] tracking-wider font-semibold">
                      HOW VERAOS VERIFIES AGENT WORK
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#B9A99B]">
                    <span>Blockchain: <strong className="text-[#E08A3E]">Stellar Testnet</strong></span>
                    <span>•</span>
                    <span>Method: <strong className="text-[#FFF8F0]">Zero-Trust Kernel</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col p-4 rounded-xl bg-[#160C08] border border-[#4A2B1D] shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-xs text-[#B9A99B]">
                      <span className="font-bold text-[#E08A3E]">STEP 01</span>
                      <span className="material-symbols-outlined text-[18px]">assignment</span>
                    </div>
                    <h3 className="font-bold text-[#FFF8F0] mb-1 text-sm">
                      1. You Set the Task
                    </h3>
                    <p className="text-xs text-[#B9A99B] leading-relaxed">
                      Define the job for the AI agent—like finding protocols, executing payments, or checking contracts.
                    </p>
                  </div>

                  <div className="flex flex-col p-4 rounded-xl bg-[#160C08] border border-[#4A2B1D] shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-xs text-[#B9A99B]">
                      <span className="font-bold text-[#E08A3E]">STEP 02</span>
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </div>
                    <h3 className="font-bold text-[#FFF8F0] mb-1 text-sm">
                      2. Agent Submits Work
                    </h3>
                    <p className="text-xs text-[#B9A99B] leading-relaxed">
                      The AI agent claims it completed the task and reports what it did along with any transaction hashes.
                    </p>
                  </div>

                  <div className="flex flex-col p-4 rounded-xl bg-[#160C08] border border-[#4A2B1D] shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-xs text-[#B9A99B]">
                      <span className="font-bold text-[#E08A3E]">STEP 03</span>
                      <span className="material-symbols-outlined text-[18px]">search_check</span>
                    </div>
                    <h3 className="font-bold text-[#FFF8F0] mb-1 text-sm">
                      3. VeraOS Checks Proof
                    </h3>
                    <p className="text-xs text-[#B9A99B] leading-relaxed">
                      VeraOS queries Stellar Horizon directly. We never trust the agent's word—we verify actual ledger records.
                    </p>
                  </div>

                  <div className="flex flex-col p-4 rounded-xl bg-[#160C08] border border-[#4A2B1D] shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-xs text-[#B9A99B]">
                      <span className="font-bold text-[#E08A3E]">STEP 04</span>
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                    <h3 className="font-bold text-[#FFF8F0] mb-1 text-sm">
                      4. Pass or Actionable Fix
                    </h3>
                    <p className="text-xs text-[#B9A99B] leading-relaxed">
                      You get a clear PASS or FAIL. If anything was missed, VeraOS gives the agent exact steps to correct it.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 2. THE PROBLEM (In Everyday Language) */}
          <section className="max-w-7xl mx-auto px-gutter py-20 w-full relative" id="how-it-works">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                  WHY INDEPENDENT VERIFICATION MATTERS
                </span>
                <h2 className="font-headline-lg text-headline-lg text-[#FFF8F0] font-bold">
                  AI agents can say they are finished.
                  <br />
                  That doesn't mean they actually are.
                </h2>
              </div>
              <p className="font-body-md text-body-md text-[#B9A99B] max-w-md">
                Autonomous AI agents often make math errors, send the wrong amounts, skip instructions, or invent confirmation links. Without independent verification, you risk paying for incomplete or wrong work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-md hover:border-[#C96A2B]/60 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#2C1710] flex items-center justify-center text-[#E08A3E] mb-4">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <h3 className="font-bold text-base text-[#FFF8F0] mb-2">
                    Underpayments & Math Errors
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-4 leading-relaxed">
                    An agent claims it paid 5.00 USDC, but only transferred 0.50 USDC due to unit confusion. VeraOS checks the exact amount on Stellar and catches the 4.50 USDC deficit.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#160C08] text-xs flex justify-between">
                  <span className="text-[#B9A99B]">Claimed: 5.0 USDC</span>
                  <span className="text-red-400 font-bold">Actual: 0.5 USDC</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-md hover:border-[#C96A2B]/60 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#2C1710] flex items-center justify-center text-[#E08A3E] mb-4">
                    <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                  </div>
                  <h3 className="font-bold text-base text-[#FFF8F0] mb-2">
                    Skipped Instructions
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-4 leading-relaxed">
                    You asked for 3 protocols, but the agent only returned 2 and claimed the job was complete. VeraOS counts results and rejects incomplete answers.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#160C08] text-xs flex justify-between">
                  <span className="text-[#B9A99B]">Required: 3 items</span>
                  <span className="text-red-400 font-bold">Provided: 2 items</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#21110B]/90 border border-[#4A2B1D] shadow-md hover:border-[#C96A2B]/60 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#2C1710] flex items-center justify-center text-[#E08A3E] mb-4">
                    <span className="material-symbols-outlined text-[20px]">link_off</span>
                  </div>
                  <h3 className="font-bold text-base text-[#FFF8F0] mb-2">
                    Missing Transaction Proof
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-4 leading-relaxed">
                    The agent writes “I sent the payment” but provides no transaction hash or ledger link. VeraOS flags it as Unverifiable until valid onchain proof is provided.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#160C08] text-xs flex justify-between">
                  <span className="text-[#B9A99B]">Proof: Text only</span>
                  <span className="text-amber-400 font-bold">Unverifiable</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. INTERACTIVE BENCHMARK CONSOLE */}
          <section className="bg-[#120906] py-24 w-full relative" id="demo">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#21110B] border border-red-900/40 text-xs uppercase text-red-400 font-bold mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE VERIFICATION BENCHMARK
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-[#FFF8F0] font-bold">
                    See VeraOS Catch an Agent Mistake
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-[#B9A99B] max-w-md">
                  In this real test scenario, an agent claims it sent 5 USDC. VeraOS inspects the Stellar Horizon ledger and catches the 4.5 USDC deficit.
                </p>
              </div>

              {/* Console Window */}
              <div className="rounded-2xl bg-[#160C08] border border-[#4A2B1D] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="bg-[#21110B] border-b border-[#4A2B1D] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="font-mono text-xs text-[#FFF8F0] pl-2">
                      vera-verifier --network=stellar-testnet
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded bg-[#160C08] text-[#B9A99B]">
                      Network: Stellar Testnet
                    </span>
                    <span className="px-2.5 py-1 rounded bg-red-950 text-red-400 font-bold">
                      FAILED · CORRECTION REQUIRED
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-[#1B0E09] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#4A2B1D]">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#E08A3E] text-[24px]">
                      assignment
                    </span>
                    <div>
                      <div className="text-[10px] uppercase text-[#B9A99B] font-bold">
                        TASK GIVEN TO AGENT
                      </div>
                      <p className="font-mono text-sm text-[#FFF8F0] font-semibold">
                        “Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.”
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded bg-[#21110B] text-[#B9A99B] border border-[#4A2B1D]">
                      Attempt 1 of 3
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#4A2B1D]">
                  {/* Left Column: What the Agent Said */}
                  <div className="p-6 bg-[#160C08]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase text-[#B9A99B] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                        WHAT THE WORKER AGENT CLAIMED
                      </span>
                      <span className="text-xs text-amber-400 font-medium">
                        Self-Reported
                      </span>
                    </div>
                    <div className="bg-[#120906] border border-[#4A2B1D] p-4 rounded-xl text-xs space-y-2.5 font-mono">
                      <p className="text-[#B9A99B]">
                        “I completed the task and sent the payment:”
                      </p>
                      <ul className="space-y-1 pl-4 list-disc text-[#FFF8F0]">
                        <li>Blend Protocol — $14.2M TVL</li>
                        <li>YieldBlox — $11.0M TVL</li>
                        <li>Aqua Network — $18.5M TVL</li>
                      </ul>
                      <div className="pt-2 border-t border-[#4A2B1D]">
                        <div className="text-[#B9A99B]">Payment Claim:</div>
                        <div className="text-[#FFF8F0] font-bold">
                          Sent 5.0 USDC -&gt; recipient GBBD47...FLA5
                        </div>
                        <div className="text-[#B9A99B] text-[11px] truncate">
                          TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: What VeraOS Found on Stellar */}
                  <div className="p-6 bg-[#1B0E09]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase text-[#E08A3E] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        INDEPENDENT STELLAR LEDGER CHECK
                      </span>
                      <span className="text-xs text-red-400 font-bold">
                        DEFICIT DETECTED
                      </span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#21110B] border border-[#4A2B1D]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[#FFF8F0]">Rule 1: 3 Protocols Provided</span>
                          <span className="text-emerald-400 font-bold text-[10px]">PASSED</span>
                        </div>
                        <p className="text-[#B9A99B] text-[11px]">
                          Worker provided exactly 3 protocol names as requested.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#21110B] border border-red-900/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[#FFF8F0]">Rule 2: Payment Equals 5.0 USDC</span>
                          <span className="text-red-400 font-bold text-[10px]">FAILED</span>
                        </div>
                        <p className="text-[#B9A99B] text-[11px] mb-2">
                          Stellar Horizon transaction receipt shows only <strong className="text-red-400">0.50 USDC</strong> was transferred to GBBD47...FLA5.
                        </p>
                        <div className="p-2 rounded bg-[#160C08] text-red-400 font-mono text-[11px]">
                          Deficit: 4.50 USDC missing. Directive sent to worker to correct transaction.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-[#21110B] border-t border-[#4A2B1D] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400 text-[24px]">
                      sync_problem
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[#FFF8F0]">
                        Verdict: FAILED (Attempt 1) → Correction Loop Active
                      </div>
                      <div className="text-xs text-[#B9A99B]">
                        Worker can resubmit a supplemental 4.50 USDC transaction to achieve VERIFIED status.
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/verify/v_test_89bf2e"
                    className="px-4 py-2 rounded-lg bg-[#2C1710] text-[#FFF8F0] text-xs font-semibold hover:bg-[#3A2015] transition-colors border border-[#4A2B1D]"
                  >
                    View Full Verification Details
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 4. DEVELOPER PRIMITIVES (Simple API) */}
          <section className="py-24 w-full bg-[#160C08]" id="developers">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                    DEVELOPER API & SDK
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-[#FFF8F0] font-bold">
                    Add verification in 3 lines of code.
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-[#B9A99B] max-w-md">
                  Works with any AI framework—LangChain, CrewAI, AutoGPT, or raw Python and Node.js.
                </p>
              </div>

              <div className="rounded-2xl bg-[#21110B] border border-[#4A2B1D] shadow-2xl overflow-hidden">
                <div className="bg-[#2C1710] border-b border-[#4A2B1D] px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveTab("curl")}
                      className={`text-xs uppercase font-bold px-3 py-1.5 rounded transition-colors ${
                        activeTab === "curl"
                          ? "text-[#FFF8F0] bg-[#160C08]"
                          : "text-[#B9A99B] hover:text-[#FFF8F0]"
                      }`}
                    >
                      cURL (POST /v1/verify)
                    </button>
                    <button
                      onClick={() => setActiveTab("ts")}
                      className={`text-xs uppercase font-bold px-3 py-1.5 rounded transition-colors ${
                        activeTab === "ts"
                          ? "text-[#FFF8F0] bg-[#160C08]"
                          : "text-[#B9A99B] hover:text-[#FFF8F0]"
                      }`}
                    >
                      TypeScript / Node.js
                    </button>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-[#B9A99B] hover:text-[#FFF8F0] text-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {activeTab === "curl" ? (
                  <div className="p-6 overflow-x-auto bg-[#160C08] font-mono text-xs text-[#B9A99B] leading-relaxed">
                    <div className="text-[#63361F] mb-2 font-bold"># Send a task and agent output to VeraOS for verification</div>
                    <span className="text-[#E08A3E]">curl</span> -X POST http://localhost:5173/v1/verify \<br />
                    &nbsp;&nbsp;-H <span className="text-[#C96A2B]">"Content-Type: application/json"</span> \<br />
                    &nbsp;&nbsp;-d <span className="text-[#FFF8F0]">{`'{
  "task": "Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.",
  "worker": {
    "id": "agent-alpha-09",
    "output": "1. Blend — $14M TVL\\n2. YieldBlox — $11M TVL\\n3. Aqua — $18M TVL\\nSent 5.0 USDC TxHash: 0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"
  }
}'`}</span>
                  </div>
                ) : (
                  <div className="p-6 overflow-x-auto bg-[#160C08] font-mono text-xs text-[#B9A99B] leading-relaxed">
                    <span className="text-[#E08A3E]">import</span> &#123; VeraOS &#125; <span className="text-[#E08A3E]">from</span> <span className="text-[#C96A2B]">'@veraos/sdk'</span>;<br /><br />
                    <span className="text-[#E08A3E]">const</span> vera = <span className="text-[#E08A3E]">new</span> VeraOS();<br /><br />
                    <span className="text-[#E08A3E]">const</span> verification = <span className="text-[#E08A3E]">await</span> vera.verify(&#123;<br />
                    &nbsp;&nbsp;task: <span className="text-[#C96A2B]">'Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.'</span>,<br />
                    &nbsp;&nbsp;worker: &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;id: <span className="text-[#C96A2B]">'agent-alpha-09'</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;output: agentResult.text<br />
                    &nbsp;&nbsp;&#125;<br />
                    &#125;);<br /><br />
                    <span className="text-[#E08A3E]">if</span> (verification.verdict.status !== <span className="text-[#C96A2B]">'VERIFIED'</span>) &#123;<br />
                    &nbsp;&nbsp;console.log(<span className="text-[#C96A2B]">'Fix required:'</span>, verification.remediation?.directives);<br />
                    &#125;
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 5. FINAL CALL TO ACTION */}
          <section className="max-w-7xl mx-auto px-gutter pt-8 pb-24 w-full">
            <div className="p-12 md:p-16 rounded-2xl bg-gradient-to-b from-[#21110B] to-[#160C08] border border-[#4A2B1D] text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-[600px] h-[350px] bg-gradient-to-r from-[#C96A2B] via-[#E08A3E] to-[#63361F] rounded-full blur-[110px]" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-4 block">
                  SAFE AUTONOMOUS AGENTS
                </span>
                <h2 className="font-display-hero text-display-hero md:text-[50px] md:leading-[58px] text-[#FFF8F0] font-bold mb-6">
                  Never pay for unverified work.
                </h2>
                <p className="font-body-lg text-body-lg text-[#B9A99B] mb-10 max-w-xl mx-auto leading-relaxed">
                  Start verifying AI agents today with Stellar-native truth. Check claims, detect errors, and guarantee real outcomes.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <Link
                    to="/verify/new"
                    className="px-8 py-3.5 rounded-lg bg-[#C96A2B] text-white font-headline-sm text-headline-sm font-semibold shadow-[0_0_24px_rgba(201,106,43,0.4)] hover:bg-[#E08A3E] transition-all"
                  >
                    Run a Verification
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="px-8 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#E08A3E] font-headline-sm text-headline-sm hover:bg-[#2C1710] transition-colors cursor-pointer shadow-sm"
                  >
                    Sign Up Free
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#FFF8F0] font-headline-sm text-headline-sm hover:bg-[#2C1710] transition-colors"
                  >
                    Open Dashboard
                  </Link>
                </div>
                <div className="text-xs text-[#B9A99B] flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Stellar Testnet Horizon & Soroban RPC Online</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#120906] py-10 shadow-[0_-1px_12px_rgba(0,0,0,0.5)] border-t border-[#4A2B1D]/50">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9A99B]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#FFF8F0]">VeraOS</span>
              <span>•</span>
              <span>Stellar-Native AI Verification Layer</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Horizon Testnet</span>
              <span>•</span>
              <span>Stellar Expert Explorer</span>
            </div>
          </div>
          <div className="text-center text-[11px] text-[#63361F] pt-4 border-t border-[#4A2B1D]/20">
            © 2026 VeraOS. Verify before you trust.
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
