import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../context/ThemeContext";
import { NotificationsPopover, NotificationItem } from "../components/notifications/NotificationsPopover";
import { CommandPalette } from "../components/search/CommandPalette";
import { InteractiveVerifyWidget } from "../components/verification/InteractiveVerifyWidget";
import { TELEGRAM_BOT_URL, GITHUB_REPO_URL } from "../config/env";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Telegram Demonstration Card Interactive State
  const [tgDemoTab, setTgDemoTab] = useState<"card" | "evidence" | "correction">("card");

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
        ? `curl -X POST http://localhost:5173/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{\\n    "task": "Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.",\\n    "worker": {\\n      "id": "agent-alpha-09",\\n      "name": "Autonomous Worker",\\n      "output": "1. Blend Protocol — $14M TVL\\n2. YieldBlox — $11M TVL\\n3. Aqua Network — $18M TVL\\nSent 5.0 USDC TxHash: 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759"\\n    }\\n  }'`
        : `import { VeraOS } from '@veraos/sdk';\\n\\nconst vera = new VeraOS();\\n\\nconst verification = await vera.verify({\\n  task: 'Find 3 Stellar lending protocols with TVL above $10M and pay yourself 5 USDC.',\\n  worker: {\\n    id: 'agent-alpha-09',\\n    output: agentExecutionResult.text\\n  }\\n});\\n\\nif (verification.verdict.status !== 'VERIFIED') {\\n  console.log('Correction required:', verification.remediation?.directives);\\n}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#160C08] font-body-md text-[#F3E5D5] bg-grid-tech min-h-screen selection:bg-[#C96A2B] selection:text-[#FFF8F0]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#160C08]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-[#4A2B1D]/40 transition-all">
        <div className="h-16 lg:h-[70px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* 1. Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#2C1710] to-[#1C0E09] rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(201,106,43,0.45)] border border-[#4A2B1D]">
              <svg
                className="w-4 h-4 text-[#E08A3E] transition-transform duration-300 group-hover:rotate-6"
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
            <span className="font-headline-sm text-lg text-[#FFF8F0] tracking-tight font-bold whitespace-nowrap">
              Vera<span className="text-[#E08A3E]">OS</span>
            </span>
          </Link>

          {/* 2. Center: LTS Modern Floating Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-full bg-[#1F0F09]/80 border border-[#3E1E12]/80 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <a
              href="#verify-anywhere"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              How it works
            </a>
            <a
              href="#interactive-verify"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Verify
            </a>
            <a
              href="#demo"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Evidence
            </a>
            <a
              href="#developers"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              API
            </a>
            <Link
              to="/docs"
              className="px-3 xl:px-3.5 py-1.5 text-xs xl:text-[13px] font-medium tracking-normal text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2F170E]/80 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Docs
            </Link>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 pl-2.5 pr-3 py-1 text-xs font-semibold text-[#E08A3E] bg-[#E08A3E]/10 hover:bg-[#E08A3E]/20 border border-[#E08A3E]/30 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(224,138,62,0.15)] whitespace-nowrap group shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse shrink-0" />
              <span>Telegram Bot</span>
              <span className="material-symbols-outlined text-[12px] opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">arrow_outward</span>
            </a>
          </nav>

          {/* 3. Right: Action Controls & CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F0F09]/80 border border-[#3E1E12] text-xs text-[#B9A99B] hover:text-[#FFF8F0] hover:border-[#C96A2B]/60 transition-all cursor-pointer shadow-sm backdrop-blur-sm whitespace-nowrap"
              title="Quick Search (Ctrl+K or Cmd+K)"
            >
              <span className="material-symbols-outlined text-[15px] text-[#C96A2B]">search</span>
              <span className="text-[11px] font-medium">Search</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#2C1710] text-[10px] text-[#B9A99B] border border-[#4A2B1D]">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#20110A] border border-transparent hover:border-[#4A2B1D]/50 transition-all cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[19px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C96A2B] shadow-[0_0_8px_rgba(201,106,43,0.8)] animate-pulse" />
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
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C96A2B] to-[#E08A3E] hover:ring-2 hover:ring-[#E08A3E] flex items-center justify-center transition-all cursor-pointer text-white shadow-[0_0_12px_rgba(201,106,43,0.35)]"
                  title={`${user?.name} (Account)`}
                >
                  <span className="material-symbols-outlined text-[17px]">
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
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center">
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#20110A] transition-all cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Dashboard CTA Pill */}
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#C96A2B] via-[#D87431] to-[#E08A3E] hover:from-[#D87431] hover:to-[#E59247] shadow-[0_0_18px_rgba(201,106,43,0.35)] hover:shadow-[0_0_24px_rgba(201,106,43,0.55)] active:scale-[0.98] transition-all shrink-0 whitespace-nowrap group"
            >
              <span>Open Dashboard</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#B9A99B] hover:text-[#FFF8F0] bg-[#20110A] border border-[#4A2B1D]/60 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#160C08]/95 backdrop-blur-2xl border-b border-[#4A2B1D] px-4 py-4 flex flex-col gap-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
            <a
              href="#verify-anywhere"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              How it works
            </a>
            <a
              href="#interactive-verify"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              Verify a task
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              Evidence
            </a>
            <a
              href="#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              API
            </a>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] transition-colors"
            >
              Docs
            </Link>

            <div className="pt-2 border-t border-[#4A2B1D]/40 flex flex-col gap-2">
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#21110B] border border-[#4A2B1D] text-xs text-[#E08A3E] font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E] animate-pulse" />
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span>Open Telegram Bot (@Vera_Of_bot)</span>
                </div>
                <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
              </a>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C96A2B] to-[#E08A3E] text-white font-semibold text-xs shadow-[0_0_16px_rgba(201,106,43,0.35)]"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        )}
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
                  INDEPENDENT PROOF FOR AI AGENTS · WEB · TELEGRAM · API
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

              {/* Hero CTA Group */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <a
                  href="#interactive-verify"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C96A2B] text-white font-headline-sm text-headline-sm font-semibold shadow-[0_0_28px_rgba(201,106,43,0.45)] hover:bg-[#E08A3E] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Verify a Task</span>
                </a>

                {/* Telegram Hero CTA */}
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#E08A3E] font-headline-sm text-headline-sm hover:bg-[#2C1710] hover:border-[#C96A2B]/60 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <span>Open Telegram Bot</span>
                  <span className="material-symbols-outlined text-[16px] opacity-70">arrow_outward</span>
                </a>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#FFF8F0] font-headline-sm text-headline-sm hover:bg-[#2C1710] transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[#E08A3E] text-[18px]">
                    grid_view
                  </span>
                  <span>Open Dashboard</span>
                </Link>
              </div>

              {/* Real World Showcase Cards */}
              <div className="w-full max-w-5xl mb-12 relative flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                {/* Card 1: Verified Stellar Transaction */}
                <div className="w-full sm:w-80 p-5 rounded-2xl bg-gradient-to-br from-[#2C1710]/95 via-[#21110B]/95 to-[#160C08]/95 backdrop-blur-2xl border border-[#4A2B1D] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(201,106,43,0.15)] transform md:-rotate-3 hover:rotate-0 transition-transform duration-300 text-left relative overflow-hidden group">
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
                      <span>Evidence Source:</span>
                      <span className="text-emerald-400 font-medium">Stellar RPC & Horizon</span>
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
                      <span className="text-red-400 font-mono font-bold">-4.50 USDC remaining</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#B9A99B] flex items-center justify-between">
                    <span>Remediation: Worker prompted to execute 4.5 USDC transfer</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 2. PRIMARY PRODUCT SECTION — VERIFY ANYWHERE */}
          <section className="max-w-7xl mx-auto px-gutter py-20 w-full relative" id="verify-anywhere">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                ONE UNIFIED PLATFORM · THREE PRODUCT SURFACES
              </span>
              <h2 className="font-display-hero text-[38px] md:text-[46px] leading-tight text-[#FFF8F0] font-bold mb-4">
                Verify anywhere
              </h2>
              <p className="font-body-lg text-body-lg text-[#B9A99B] leading-relaxed">
                Run verification from the VeraOS dashboard, monitor work through Telegram, or connect VeraOS directly to your AI agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Web Dashboard Entry */}
              <div className="p-7 rounded-2xl bg-[#21110B]/90 border border-[#4A2B1D] hover:border-[#C96A2B]/60 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] group-hover:scale-105 transition-transform shadow-md">
                      <span className="material-symbols-outlined text-[24px]">grid_view</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#2C1710] text-[#E08A3E] text-[10px] font-mono uppercase font-bold border border-[#4A2B1D]">
                      Web Surface
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-[#FFF8F0] mb-2">
                    Dashboard
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-6 leading-relaxed">
                    Run and inspect verifications visually. View live telemetry, inspect granular ledger proofs, and manage agent remediation.
                  </p>
                  <ul className="space-y-2 text-xs text-[#B9A99B] mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Visual ledger & transaction inspector</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Historical audit logs & telemetry</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Interactive failure remediation flow</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to="/dashboard"
                  className="w-full text-center py-3 rounded-xl bg-[#2C1710] hover:bg-[#C96A2B] text-[#FFF8F0] font-semibold text-sm transition-colors border border-[#4A2B1D]"
                >
                  Open Dashboard
                </Link>
              </div>

              {/* Telegram Bot Entry */}
              <div className="p-7 rounded-2xl bg-[#21110B]/90 border border-[#E08A3E]/40 hover:border-[#E08A3E] transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C96A2B]/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] group-hover:scale-105 transition-transform shadow-md">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#C96A2B]/20 text-[#E08A3E] text-[10px] font-mono uppercase font-bold border border-[#C96A2B]/40">
                      Mobile & Chat
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-[#FFF8F0] mb-2">
                    Telegram Bot
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-6 leading-relaxed">
                    Start, monitor and control verifications from Telegram. Get instant mobile alerts, inline verification cards, and 1-tap correction directives.
                  </p>
                  <ul className="space-y-2 text-xs text-[#B9A99B] mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Execute with conversational /verify</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Real-time FAILED / VERIFIED cards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Single shared repository with Web</span>
                    </li>
                  </ul>
                </div>
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(201,106,43,0.35)] flex items-center justify-center gap-2"
                >
                  <span>Open Telegram</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </a>
              </div>

              {/* Developer API Entry */}
              <div className="p-7 rounded-2xl bg-[#21110B]/90 border border-[#4A2B1D] hover:border-[#C96A2B]/60 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] group-hover:scale-105 transition-transform shadow-md">
                      <span className="material-symbols-outlined text-[24px]">terminal</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#2C1710] text-[#E08A3E] text-[10px] font-mono uppercase font-bold border border-[#4A2B1D]">
                      Programmatic
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-[#FFF8F0] mb-2">
                    Developer API
                  </h3>
                  <p className="text-sm text-[#B9A99B] mb-6 leading-relaxed">
                    Connect VeraOS directly to an AI agent or application. Secure autonomous pipelines, payouts, and swarms with deterministic checks.
                  </p>
                  <ul className="space-y-2 text-xs text-[#B9A99B] mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Simple REST endpoint: POST /v1/verify</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Deterministic JSON verdict payloads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>LangChain, CrewAI & AutoGPT ready</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="#developers"
                  className="w-full text-center py-3 rounded-xl bg-[#2C1710] hover:bg-[#C96A2B] text-[#FFF8F0] font-semibold text-sm transition-colors border border-[#4A2B1D]"
                >
                  View API
                </a>
              </div>
            </div>
          </section>

          {/* 3. SHOW HOW TELEGRAM WORKS DEMO SECTION */}
          <section className="bg-[#120906] py-24 w-full relative border-y border-[#4A2B1D]/40">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                  TELEGRAM INTEGRATION IN ACTION
                </span>
                <h2 className="font-headline-lg text-[32px] md:text-[40px] text-[#FFF8F0] font-bold mb-4">
                  Verification, wherever you work.
                </h2>
                <p className="font-body-md text-body-md text-[#B9A99B] leading-relaxed">
                  Telegram is another interface for VeraOS. Trigger verification requests, receive real-time updates, and request worker corrections directly inside your daily chat workflows.
                </p>
              </div>

              {/* Telegram Architecture Flow */}
              <div className="mb-14 p-6 rounded-2xl bg-[#1B0E09] border border-[#4A2B1D] max-w-4xl mx-auto">
                <div className="text-xs uppercase font-bold text-[#E08A3E] tracking-wider mb-4 text-center">
                  END-TO-END TELEGRAM VERIFICATION PATH
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#21110B] border border-[#4A2B1D]">
                    <div className="text-[#E08A3E] font-bold mb-1">User</div>
                    <div className="text-[11px] text-[#B9A99B]">Sends /verify</div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center text-[#63361F]">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#21110B] border border-[#4A2B1D]">
                    <div className="text-[#E08A3E] font-bold mb-1">Telegram</div>
                    <div className="text-[11px] text-[#B9A99B]">Webhook dispatch</div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center text-[#63361F]">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#21110B] border border-[#4A2B1D]">
                    <div className="text-[#E08A3E] font-bold mb-1">VeraOS</div>
                    <div className="text-[11px] text-[#B9A99B]">Engine & Evidence</div>
                  </div>
                </div>
                <div className="flex items-center justify-center my-3 text-[#63361F]">
                  <span className="material-symbols-outlined text-[20px]">south</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center text-xs max-w-md mx-auto">
                  <div className="p-3 rounded-xl bg-[#21110B] border border-[#4A2B1D]">
                    <div className="text-[#E08A3E] font-bold mb-1">Evidence</div>
                    <div className="text-[11px] text-[#B9A99B]">Stellar RPC ground truth</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#21110B] border border-emerald-900/40">
                    <div className="text-emerald-400 font-bold mb-1">Verdict</div>
                    <div className="text-[11px] text-[#B9A99B]">VERIFIED / FAILED card</div>
                  </div>
                </div>
              </div>

              {/* Realistic Telegram Result Card Showcase */}
              <div className="max-w-xl mx-auto">
                <div className="rounded-2xl bg-[#1B110B] border border-[#4A2B1D] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                  {/* Telegram Header Bar */}
                  <div className="bg-[#26150D] px-5 py-3.5 border-b border-[#4A2B1D] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C96A2B] flex items-center justify-center text-white shadow-sm">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#FFF8F0] flex items-center gap-1.5">
                          <span>VeraOS Bot</span>
                          <span className="material-symbols-outlined text-emerald-400 text-[14px]">verified</span>
                        </div>
                        <span className="text-[11px] text-[#B9A99B]">bot</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#160C08] text-[#E08A3E] text-[11px] font-mono border border-[#4A2B1D]">
                      Live Card Demo
                    </span>
                  </div>

                  {/* Telegram Message Body */}
                  <div className="p-6 bg-[#160C08] font-mono text-xs space-y-4">
                    <div className="p-4 rounded-xl bg-[#21110B] border border-[#4A2B1D] text-[#FFF8F0] leading-relaxed space-y-3">
                      <div className="text-base font-bold flex items-center gap-2">
                        <span>🛡 VeraOS</span>
                      </div>

                      <div className="text-xs text-[#B9A99B]">
                        Verification: <span className="text-[#FFF8F0] font-bold">V-8F31A</span>
                      </div>

                      <div className="text-red-400 font-bold text-sm">
                        ❌ VERIFICATION FAILED
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#4A2B1D]/50">
                        <div>
                          <span className="text-[#B9A99B] text-[11px] block">Requirement:</span>
                          <span className="text-[#FFF8F0] font-bold">5.00 USDC</span>
                        </div>
                        <div>
                          <span className="text-[#B9A99B] text-[11px] block">Observed:</span>
                          <span className="text-red-400 font-bold">0.50 USDC</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[#B9A99B] text-[11px] block">Difference:</span>
                        <span className="text-red-400 font-bold">-4.50 USDC</span>
                      </div>

                      <div className="pt-2 border-t border-[#4A2B1D]/50 space-y-1">
                        <div className="text-[11px] text-[#B9A99B] uppercase">Checks:</div>
                        <div className="text-emerald-400">✓ Transaction exists</div>
                        <div className="text-emerald-400">✓ Recipient</div>
                        <div className="text-emerald-400">✓ Asset</div>
                        <div className="text-red-400">✗ Amount</div>
                      </div>

                      <div className="pt-2 border-t border-[#4A2B1D]/50 text-[11px] text-[#B9A99B]">
                        Evidence: <strong className="text-[#FFF8F0]">Stellar Testnet</strong>
                      </div>
                    </div>

                    {/* Interactive Demo Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTgDemoTab(tgDemoTab === "evidence" ? "card" : "evidence")}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                          tgDemoTab === "evidence"
                            ? "bg-[#C96A2B] text-white border-[#E08A3E]"
                            : "bg-[#2C1710] text-[#FFF8F0] border-[#4A2B1D] hover:bg-[#3A2015]"
                        }`}
                      >
                        <span>View Evidence</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTgDemoTab(tgDemoTab === "correction" ? "card" : "correction")}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1 ${
                          tgDemoTab === "correction"
                            ? "bg-[#C96A2B] text-white border-[#E08A3E]"
                            : "bg-[#2C1710] text-[#FFF8F0] border-[#4A2B1D] hover:bg-[#3A2015]"
                        }`}
                      >
                        <span>Request Correction</span>
                      </button>
                    </div>

                    {/* Interactive Detail Drawer for Demo */}
                    {tgDemoTab === "evidence" && (
                      <div className="p-3.5 rounded-xl bg-[#21110B] border border-[#4A2B1D] space-y-2 animate-in fade-in duration-150">
                        <div className="text-[#E08A3E] font-bold text-xs uppercase">
                          Evidence Breakdown
                        </div>
                        <div className="text-[11px] text-[#B9A99B] space-y-1">
                          <div>Network: <strong>Stellar Testnet</strong></div>
                          <div>Status: <span className="text-emerald-400">Confirmed on Ledger #1,048,576</span></div>
                          <div className="truncate">Tx: 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759</div>
                          <div>Observed Transfer: <span className="text-red-400 font-bold">0.50 USDC</span></div>
                        </div>
                      </div>
                    )}

                    {tgDemoTab === "correction" && (
                      <div className="p-3.5 rounded-xl bg-[#21110B] border border-red-900/50 space-y-2 animate-in fade-in duration-150">
                        <div className="text-red-400 font-bold text-xs uppercase">
                          Correction Request Registered
                        </div>
                        <p className="text-[11px] text-[#B9A99B] leading-relaxed">
                          Directive issued: "Payment mismatch. Expected 5.00 USDC, but observed transfer was 0.50 USDC. The worker can now resubmit with the supplemental 4.50 USDC transaction."
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Demo Card Footer */}
                  <div className="p-4 bg-[#21110B] border-t border-[#4A2B1D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-[#B9A99B] italic">
                      UI demonstration of Telegram verification card.
                    </span>
                    <a
                      href={TELEGRAM_BOT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-lg bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Try in Telegram</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. MAKE WEBSITE USABLE WITHOUT AN AI AGENT (Interactive Console) */}
          <section className="py-24 w-full bg-[#160C08]" id="interactive-verify">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                  BROWSER-NATIVE VERIFICATION
                </span>
                <h2 className="font-headline-lg text-[32px] md:text-[40px] text-[#FFF8F0] font-bold mb-4">
                  Verify a task
                </h2>
                <p className="font-body-md text-body-md text-[#B9A99B] leading-relaxed">
                  You don't need an external AI agent to test VeraOS. Enter a task requirement and worker execution output below to run an independent verification against live Stellar Testnet evidence.
                </p>
              </div>

              {/* Embedded Interactive Verification Component */}
              <InteractiveVerifyWidget />
            </div>
          </section>

          {/* 5. THREE WAYS TO VERIFY SECTION */}
          <section className="bg-[#120906] py-24 w-full relative border-t border-[#4A2B1D]/40">
            <div className="max-w-7xl mx-auto px-gutter">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-[#E08A3E] font-bold mb-3 block">
                  CHOOSE YOUR INTERFACE
                </span>
                <h2 className="font-headline-lg text-[32px] md:text-[40px] text-[#FFF8F0] font-bold mb-4">
                  Three ways to verify
                </h2>
                <p className="font-body-md text-body-md text-[#B9A99B] leading-relaxed">
                  All three interfaces connect to the same deterministic verification engine and shared registry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 01 Dashboard */}
                <div className="p-8 rounded-2xl bg-[#1B0E09] border border-[#4A2B1D] flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#E08A3E] uppercase tracking-wider mb-2">
                      01 — Dashboard
                    </div>
                    <h3 className="font-bold text-lg text-[#FFF8F0] mb-3">
                      For people who want to inspect verification visually.
                    </h3>
                    <p className="text-sm text-[#B9A99B] leading-relaxed mb-6">
                      Explore detailed ledger breakdowns, raw RPC responses, side-by-side claim comparisons, and visual correction flows.
                    </p>
                    <ul className="space-y-2 text-xs text-[#B9A99B] mb-6">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Full telemetry and audit trail</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Side-by-side evidence triangulation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Visual agent correction drawer</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#E08A3E] hover:text-[#FFF8F0] transition-colors"
                  >
                    <span>Open Web Dashboard</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

                {/* 02 Telegram */}
                <div className="p-8 rounded-2xl bg-[#1B0E09] border border-[#E08A3E]/40 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#E08A3E] uppercase tracking-wider mb-2">
                      02 — Telegram
                    </div>
                    <h3 className="font-bold text-lg text-[#FFF8F0] mb-3">
                      For operators who want quick verification status and alerts.
                    </h3>
                    <p className="text-sm text-[#B9A99B] leading-relaxed mb-6">
                      Run verifications on the go, receive instant deficit alerts, and dispatch worker remediation directives with 1 tap.
                    </p>
                    <ul className="space-y-2 text-xs text-[#B9A99B] mb-6">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Instant verdict cards with deficit diffs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Commands: /verify, /status, /evidence</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Direct 1-tap resubmission workflow</span>
                      </li>
                    </ul>
                  </div>
                  <a
                    href={TELEGRAM_BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#E08A3E] hover:text-[#FFF8F0] transition-colors"
                  >
                    <span>Launch Telegram Bot</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </a>
                </div>

                {/* 03 API */}
                <div className="p-8 rounded-2xl bg-[#1B0E09] border border-[#4A2B1D] flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#E08A3E] uppercase tracking-wider mb-2">
                      03 — API
                    </div>
                    <h3 className="font-bold text-lg text-[#FFF8F0] mb-3">
                      For developers and AI agents integrating VeraOS programmatically.
                    </h3>
                    <p className="text-sm text-[#B9A99B] leading-relaxed mb-6">
                      Integrate deterministic proof evaluation directly into agent swarms, CI/CD jobs, and automated payment triggers.
                    </p>
                    <ul className="space-y-2 text-xs text-[#B9A99B] mb-6">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>REST API: POST /v1/verify</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Structured verdicts, checks & remediation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>Zero-trust cryptographic witness</span>
                      </li>
                    </ul>
                  </div>
                  <a
                    href="#developers"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#E08A3E] hover:text-[#FFF8F0] transition-colors"
                  >
                    <span>View Developer Docs</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 6. THE PROBLEM (Why Independent Verification Matters) */}
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

          {/* 7. INTERACTIVE BENCHMARK CONSOLE */}
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
                          TxHash: 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759
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
                          Stellar Horizon transaction receipt shows only <strong className="text-red-400">0.50 USDC</strong> was transferred.
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

          {/* 8. DEVELOPER PRIMITIVES (Simple API) */}
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
    "output": "1. Blend — $14M TVL\\n2. YieldBlox — $11M TVL\\n3. Aqua — $18M TVL\\nSent 5.0 USDC TxHash: 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759"
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

          {/* 9. FINAL CALL TO ACTION */}
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
                  Start verifying AI agents today with Stellar-native truth. Check claims, detect errors, and guarantee real outcomes across Web, Telegram, and API.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <a
                    href="#interactive-verify"
                    className="px-8 py-3.5 rounded-lg bg-[#C96A2B] text-white font-headline-sm text-headline-sm font-semibold shadow-[0_0_24px_rgba(201,106,43,0.4)] hover:bg-[#E08A3E] transition-all cursor-pointer"
                  >
                    Verify a Task
                  </a>
                  <a
                    href={TELEGRAM_BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[#E08A3E] font-headline-sm text-headline-sm hover:bg-[#2C1710] hover:border-[#C96A2B]/60 transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    <span>Open Telegram Bot</span>
                  </a>
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

      {/* 10. FOOTER */}
      <footer className="w-full bg-[#120906] py-12 shadow-[0_-1px_12px_rgba(0,0,0,0.5)] border-t border-[#4A2B1D]/50">
        <div className="max-w-7xl mx-auto px-gutter flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2C1710] flex items-center justify-center border border-[#4A2B1D]">
                  <span className="material-symbols-outlined text-[#E08A3E] text-[18px]">verified</span>
                </div>
                <span className="font-bold text-lg text-[#FFF8F0] tracking-tight">
                  Vera<span className="text-[#E08A3E]">OS</span>
                </span>
              </Link>
              <p className="text-xs text-[#B9A99B] max-w-sm mt-1">
                The verification layer for AI agents.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#B9A99B]">
              <a href="#verify-anywhere" className="hover:text-[#FFF8F0] transition-colors">Product</a>
              <a href="#how-it-works" className="hover:text-[#FFF8F0] transition-colors">How it works</a>
              <Link to="/dashboard" className="hover:text-[#FFF8F0] transition-colors">Dashboard</Link>
              <a href="#developers" className="hover:text-[#FFF8F0] transition-colors">API</a>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E08A3E] transition-colors flex items-center gap-1"
              >
                <span>Telegram</span>
                <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
              </a>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FFF8F0] transition-colors flex items-center gap-1"
              >
                <span>GitHub</span>
                <span className="material-symbols-outlined text-[13px]">arrow_outward</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#4A2B1D]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#63361F]">
            <span>Verify before you trust.</span>
            <div className="flex items-center gap-4 text-[#B9A99B]/60">
              <span>Stellar Horizon Testnet</span>
              <span>•</span>
              <span>Stellar Soroban RPC</span>
              <span>•</span>
              <span>Non-Custodial</span>
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
