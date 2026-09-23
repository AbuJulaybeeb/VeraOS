import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useAgentContext } from "../../context/AgentContext";
import { ThemeToggle } from "../../context/ThemeContext";
import { InviteLinkModal } from "../invite/InviteLinkModal";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, openAuthModal, logout } = useAuth();
  const { activeAgent, openConnectModal } = useAgentContext();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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
      path: "/verifications",
      active:
        location.pathname === "/verifications" ||
        (location.pathname.startsWith("/verify") &&
          !location.pathname.includes("/evidence")),
    },
    {
      label: "Agents",
      icon: "smart_toy",
      path: "/agents",
      active: location.pathname.startsWith("/agents"),
    },
    {
      label: "Evidence",
      icon: "fingerprint",
      path: "/verify/v_test_89bf2e/evidence",
      active: location.pathname.includes("/evidence"),
    },
  ];

  return (
    <aside className="h-full lg:h-full max-h-[100dvh] w-72 max-w-[85vw] sm:w-72 bg-surface-container-lowest z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.3)] border-r border-white/5 overflow-y-auto pb-6 lg:pb-0">

      {/* ── Top: brand + CTA ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 border-b border-white/5">

        {/* Logo & Mobile Close */}
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2 group w-fit"
          >
            <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(255,87,8,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-on-primary-container text-[18px]">verified</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-on-surface font-headline-sm">
              Vera<span className="text-primary-container">OS</span>
            </span>
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Workspace / user line */}
        <button
          type="button"
          onClick={() => openAuthModal("signin")}
          className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0" />
            <div className="truncate text-left">
              <p className="text-[13px] font-medium text-on-surface truncate leading-tight">
                {user?.name ?? "My Workspace"}
              </p>
              <p className="text-[11px] text-outline uppercase tracking-wide truncate leading-tight">
                {user?.role ?? "Personal"}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0">unfold_more</span>
        </button>

        {/* New Verification CTA */}
        <Link
          to="/verify/new"
          onClick={onCloseMobile}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold shadow-[0_0_16px_rgba(255,87,8,0.25)] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>New Verification</span>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-0.5 px-3 py-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={onCloseMobile}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-[14px] font-medium",
              item.active
                ? "bg-primary-container/20 text-primary-container border border-primary-container/25"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Footer (compact) ── */}
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3 border-t border-white/5">

        {/* Agent status */}
        {activeAgent?.status === "CONNECTED" ? (
          <button
            type="button"
            onClick={() => openConnectModal(activeAgent)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-white/5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[13px] font-medium text-on-surface truncate">{activeAgent.name}</span>
            </div>
            <span className="text-[11px] text-emerald-400 shrink-0">Connected</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openConnectModal()}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-[#E08A3E]/30 text-[13px] text-[#E08A3E] font-medium hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>Connect Agent</span>
          </button>
        )}

        {/* Utility row: theme + telegram + docs */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => { if (onCloseMobile) onCloseMobile(); setInviteModalOpen(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#E08A3E] hover:bg-surface-container text-[12px] font-medium transition-colors cursor-pointer"
            title="Telegram Bot & Invites"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>Telegram</span>
          </button>

          <Link
            to="/docs"
            onClick={onCloseMobile}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container text-[12px] font-medium transition-colors ml-auto"
          >
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>Docs</span>
          </Link>
        </div>

        {/* User profile */}
        {user ? (
          <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-surface-container">
            <Link
              to="/account"
              onClick={onCloseMobile}
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/15" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[15px]">person</span>
                </div>
              )}
              <div className="truncate">
                <p className="text-[13px] font-medium text-on-surface truncate leading-tight">{user.name}</p>
                <p className="text-[11px] text-outline truncate leading-tight">{user.role}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
              className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-error transition-colors shrink-0 ml-2"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[17px]">logout</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-[13px] text-on-surface font-medium transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className="py-2 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      <InviteLinkModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </aside>
  );
};
