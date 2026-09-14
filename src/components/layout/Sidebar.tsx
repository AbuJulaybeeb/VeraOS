import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../../context/ThemeContext";

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
                  {user?.role || "Demo Workspace"}
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
            <span className="truncate text-xs text-on-surface-variant">Base Mainnet</span>
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
