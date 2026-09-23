import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Derive friendly page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/dashboard") return "Overview";
    if (p === "/verifications") return "Verification runs";
    if (p.startsWith("/verify/new")) return "Check completed work";
    if (p.startsWith("/verify/processing")) return "Verification Processing";
    if (p.startsWith("/verify/")) return "Verification Detail";
    if (p.startsWith("/agents")) return "My agents";
    if (p === "/evidence") return "Evidence library";
    if (p === "/account") return "Account Settings";
    if (p === "/docs") return "Documentation";
    return "VeraOS";
  };

  return (
    <header className="h-16 bg-[#F7F5F0] border-b border-[#E8E4DC] px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0 font-sans">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B635B] hover:text-[#191513] cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}

        {/* Mobile brand (shown only on small screens) */}
        <Link to="/dashboard" className="lg:hidden flex items-center gap-2 mr-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#181311]" />
          </div>
          <span className="font-heading font-bold text-base text-[#191513]">
            Vera<span className="text-[#D97736]">OS</span>
          </span>
        </Link>

        {/* Desktop Title */}
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="font-heading font-semibold text-base text-[#191513]">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Figma Status Pill: All systems operational */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#1D7A46] animate-pulse" />
          <span>All systems operational</span>
        </div>

        {/* User Account / Maya Chen Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full bg-white hover:bg-[#F3EFEA] border border-[#E8E4DC] transition-colors cursor-pointer"
            title="User Profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "Maya Chen"}
                className="w-8 h-8 rounded-full object-cover border border-[#E8E4DC]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#181311] text-[#F7F5F0] flex items-center justify-center font-heading font-medium text-xs">
                MC
              </div>
            )}
            <span className="sr-only">Toggle user menu</span>
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E8E4DC] shadow-lg p-2 z-50 flex flex-col gap-1 text-xs">
              <div className="px-3 py-2 border-b border-[#E8E4DC] mb-1">
                <p className="font-heading font-semibold text-[#191513] truncate">
                  {user?.name || "Maya Chen"}
                </p>
                <p className="font-mono text-[10px] text-[#6B635B] truncate">
                  {user?.email || "maya@acme.ai"}
                </p>
              </div>

              <Link
                to="/account"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#191513] hover:bg-[#F7F5F0] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B635B]">
                  manage_accounts
                </span>
                <span>Account Settings</span>
              </Link>

              <Link
                to="/docs"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#191513] hover:bg-[#F7F5F0] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B635B]">
                  description
                </span>
                <span>Documentation</span>
              </Link>

              <div className="border-t border-[#E8E4DC] my-1" />

              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left w-full"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
