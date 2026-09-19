import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../../context/ThemeContext";
import { NotificationsPopover, NotificationItem } from "../notifications/NotificationsPopover";
import { CommandPalette } from "../search/CommandPalette";
import { AgentHeaderWidget } from "../agent/AgentHeaderWidget";
import { StellarWalletModal } from "../wallet/StellarWalletModal";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "critical",
    title: "Verification #V-1048: Invariant Breaches",
    message: "Seamless Protocol TVL deficit (-$1.75M) and 90% compensation payout deficit.",
    time: "2m ago",
    path: "/verify/v_test_89bf2e",
    read: false,
  },
  {
    id: "notif_2",
    type: "success",
    title: "Stellar Ledger Confirmed",
    message: "Transaction verified on Stellar Testnet. 5.00 USDC transfer confirmed on ledger.",
    time: "14m ago",
    path: "/verify/v_test_pass_001",
    read: false,
  },
  {
    id: "notif_3",
    type: "warning",
    title: "Unverified Settlement Claim",
    message: "Worker ScoutAgent reported 5 USDC payment without independent Stellar receipt.",
    time: "32m ago",
    path: "/verify/v_test_unver_003",
    read: false,
  },
];

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  breadcrumbs = [{ label: "Platform" }, { label: "Verification Engine" }],
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Listen for global Ctrl+K / Cmd+K
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

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-72 h-16 bg-surface/85 backdrop-blur-xl z-40 flex items-center justify-between px-space-md lg:px-space-lg border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-space-sm">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Open mobile navigation"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div className="lg:hidden flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                verified
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Vera<span className="text-primary-container">OS</span>
            </span>
          </div>

          <nav
            className="hidden sm:flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant ml-2"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && (
                  <span className="material-symbols-outlined text-[14px] text-outline">
                    chevron_right
                  </span>
                )}
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-on-surface transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-on-surface font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm relative">
          {/* Functional Search Bar */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-left cursor-pointer"
            title="Search telemetry and traces (⌘K)"
            aria-label="Search telemetry and traces (⌘K)"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="hidden md:inline font-body-sm text-body-sm">Search telemetry, traces...</span>
            <span className="hidden md:inline font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-outline">
              ⌘K
            </span>
          </button>

          {/* Functional Notifications Button */}
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
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(255,87,8,0.7)] animate-pulse" />
              )}
            </button>

            {/* Notifications Popover */}
            <NotificationsPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>

          {/* Theme Mode Toggle (Dark / White Theme) */}
          <ThemeToggle />

          {/* Connect AI Agent Widget (Wallet-style) */}
          <AgentHeaderWidget />

          {/* Connect Stellar Wallet (Freighter, Albedo, Lobstr) */}
          {user?.walletAddress ? (
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs font-mono text-[#00E5FF] transition-all cursor-pointer"
              title={`Stellar Wallet Connected: ${user.walletAddress}`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#00E5FF]">
                account_balance_wallet
              </span>
              <span className="hidden xl:inline">
                {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer border border-white/5"
              title="Connect Stellar Wallet (Freighter, Albedo, Lobstr)"
            >
              <span className="material-symbols-outlined text-[15px] text-[#00E5FF]">
                account_balance_wallet
              </span>
              <span className="hidden md:inline">Stellar</span>
            </button>
          )}

          {/* New Verification Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/verify/new")}
            icon={
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
            }
          >
            <span className="hidden sm:inline">New Verification</span>
            <span className="sm:hidden">Verify</span>
          </Button>

          {/* Functional Profile / Auth Avatar */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 py-1 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-white/5"
                  title={`${user?.name} (${user?.role})`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary text-[15px]">
                      person
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-on-surface max-w-[100px] truncate">
                    {user?.name.split(" ")[0]}
                  </span>
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    arrow_drop_down
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ffb95f] hover:text-white bg-primary-container/25 hover:bg-primary-container border border-[#ffb95f]/40 transition-all shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            {profileDropdownOpen && isAuthenticated && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-12 w-64 rounded-2xl bg-surface-container border border-white/10 shadow-2xl z-50 p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 rounded-lg bg-surface-container-low flex flex-col">
                    <span className="font-semibold text-on-surface text-sm">
                      {user?.name}
                    </span>
                    <span className="text-xs text-outline font-code-sm truncate">
                      {user?.email}
                    </span>
                    <span className="text-[10px] text-secondary font-code-sm mt-1">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openAuthModal("signup");
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      person_add
                    </span>
                    <span>Switch or Create Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Stellar Multi-Wallet Modal */}
      <StellarWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
};
