import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useAgentContext } from "../../context/AgentContext";
import { ThemeToggle } from "../../context/ThemeContext";
import { TELEGRAM_BOT_URL } from "../../config/env";

interface SidebarProps {
  verificationsCount?: number;
  agentsCount?: number;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  verificationsCount = 5,
  agentsCount = 4,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { user, openAuthModal, logout } = useAuth();
  const { activeAgent, openConnectModal } = useAgentContext();

  const navItems = [
    {
      label: "Overview",
      icon: "grid_view",
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      label: "Verifications",
      icon: "verified_user",
      path: "/dashboard",
      active:
        location.pathname.startsWith("/verify") &&
        !location.pathname.includes("/evidence"),
      badge: verificationsCount,
    },
    {
      label: "Agents",
      icon: "smart_toy",
      path: "/agents",
      active: location.pathname.startsWith("/agents"),
      badge: agentsCount,
    },
    {
      label: "Evidence Explorer",
      icon: "fingerprint",
      path: "/verify/v_test_89bf2e/evidence",
      active: location.pathname.includes("/evidence"),
    },
    {
      label: "API & Integrations",
      icon: "terminal",
      path: "/agents/connect",
      active: location.pathname === "/agents/connect",
    },
  ];

  return (
    <aside className="h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.3)] border-r border-white/5">
      <div className="flex flex-col w-full">
        {/* Brand & Workspace */}
        <div className="p-space-md flex flex-col gap-space-sm border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="flex items-center gap-space-sm group"
            >
              <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(255,87,8,0.35)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                  verified
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                Vera<span className="text-primary-container">OS</span>
              </span>
            </Link>
            <div className="flex items-center gap-space-xs px-2 py-0.5 rounded-full bg-surface-container">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-caps text-label-caps uppercase text-secondary font-medium">
                Live
              </span>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div
            onClick={() => openAuthModal("signin")}
            className="mt-space-xs flex items-center justify-between p-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group"
            title="Switch Workspace / Account"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0" />
              <div className="truncate">
                <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                  Acme AI Corp
                </p>
                <p className="font-label-caps text-label-caps text-outline uppercase tracking-wider truncate">
                  {user?.role || "Production Workspace"}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-[18px] transition-colors">
              unfold_more
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-space-md pt-space-sm pb-1">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline px-space-sm">
            Platform Core
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-space-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-space-sm py-2 rounded-lg transition-all text-body-md font-medium",
                item.active
                  ? "bg-primary-container text-on-primary font-semibold shadow-[0_0_16px_rgba(255,87,8,0.2)]"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-md font-code-sm text-code-sm",
                    item.active
                      ? "bg-black/30 text-on-primary"
                      : "bg-surface-container-high text-on-surface"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Info & User */}
      <div className="flex flex-col p-space-md gap-space-sm border-t border-white/5">
        <Link
          to="/docs"
          onClick={onCloseMobile}
          className="flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px]">
              menu_book
            </span>
            <span className="font-body-sm text-body-sm font-medium">
              Documentation
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-outline">
            arrow_outward
          </span>
        </Link>

        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px]">
              public
            </span>
            <span className="font-body-sm text-body-sm font-medium">
              Landing Page
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-outline">
            arrow_outward
          </span>
        </Link>

        {/* Telegram Bot Interface Link */}
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCloseMobile}
          className="flex items-center justify-between px-space-sm py-2 rounded-lg text-[#E08A3E] hover:bg-surface-container hover:text-white transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span className="font-body-sm text-body-sm font-medium">
              Telegram Bot
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] opacity-75">
            arrow_outward
          </span>
        </a>

        {/* Connected AI Agent Status (Wallet-Style) */}
        {activeAgent && activeAgent.status === "CONNECTED" ? (
          <div
            onClick={() => openConnectModal(activeAgent)}
            className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5 hover:border-[#E08A3E]/30 transition-colors cursor-pointer group"
            title="Click to manage agent connection"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Agent
              </span>
              <span className="font-code-sm text-[10px] text-[#4ade80]">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface">
              <span className="truncate text-xs font-semibold text-white">{activeAgent.name}</span>
              <span className="text-[10px] text-outline truncate max-w-[80px]">{activeAgent.runtime.split(" ")[0]}</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openConnectModal()}
            className="p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container border border-dashed border-[#E08A3E]/30 flex items-center justify-between gap-2 text-xs text-[#E08A3E] font-medium transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span>Connect Agent</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E08A3E]/20 text-[#E08A3E]">
              1-Click
            </span>
          </button>
        )}

        {/* Network status indicator */}
        <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Network
            </span>
            <span className="font-code-sm text-code-sm text-secondary">
              14ms
            </span>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface">
            <span className="truncate text-xs text-on-surface-variant">Stellar Testnet</span>
            <span className="text-[10px] text-outline">Operational</span>
          </div>
        </div>

        {/* Appearance Theme Switcher */}
        <div className="flex items-center justify-between px-space-sm py-1.5 rounded-xl bg-surface-container-low border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-[16px]">palette</span>
            <span>Theme Mode</span>
          </div>
          <ThemeToggle />
        </div>

        {/* User profile & Auth button */}
        {user ? (
          <div
            onClick={() => openAuthModal("signin")}
            className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group"
            title="Click to switch or manage account"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
              <div className="truncate">
                <p className="font-body-sm text-body-sm font-medium text-on-surface truncate">
                  {user.name}
                </p>
                <p className="font-label-caps text-label-caps text-outline truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="p-1 rounded hover:bg-surface-container-highest text-outline group-hover:text-error transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
            </button>
          </div>
        ) : (
          <div className="p-space-sm rounded-xl bg-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">Account Access</span>
              <span className="text-[10px] font-code-sm text-outline">Guest</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-medium transition-colors text-center cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="py-1.5 px-2 rounded-lg bg-primary-container text-on-primary hover:bg-secondary-container text-xs font-semibold transition-colors text-center cursor-pointer shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
