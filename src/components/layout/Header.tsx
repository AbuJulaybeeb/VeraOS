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
    if (p === "/verifications") return "Verifications";
    if (p.startsWith("/verify/new")) return "New Verification";
    if (p.startsWith("/verify/processing")) return "Verification Processing";
    if (p.startsWith("/verify/")) return "Verification Detail";
    if (p.startsWith("/agents")) return "Connected Agents";
    if (p === "/evidence") return "Independent Evidence";
    if (p === "/account") return "Account Settings";
    if (p === "/docs") return "Documentation";
    return "VeraOS";
  };

  return (
    <header className="h-16 bg-[#160C08] border-b border-[#4A2B1D] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 font-sans">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#21110B] border border-[#4A2B1D] text-[#B9A99B] hover:text-[#FFF8F0] cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}

        {/* Mobile brand (shown only on small screens) */}
        <Link to="/dashboard" className="lg:hidden flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-[#C96A2B] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]">verified</span>
          </div>
          <span className="font-heading font-bold text-base text-white">
            Vera<span className="text-[#E08A3E]">OS</span>
          </span>
        </Link>

        {/* Desktop Breadcrumb / Title */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-heading font-semibold text-base text-[#FFF8F0]">
            {getPageTitle()}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E08A3E]" />
          <span className="font-mono text-xs text-[#B9A99B]">Verification Layer</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick New Verification Action */}
        <Link
          to="/verify/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-xs shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>New Verification</span>
        </Link>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] transition-colors cursor-pointer"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#C96A2B] text-white flex items-center justify-center font-heading font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="font-heading text-xs font-medium text-[#FFF8F0] hidden sm:inline max-w-[100px] truncate">
                {user.name}
              </span>
              <span className="material-symbols-outlined text-[#B9A99B] text-[16px]">
                {accountMenuOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#21110B] border border-[#4A2B1D] shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
                <div className="px-3 py-2 border-b border-[#4A2B1D] mb-1">
                  <p className="font-heading font-semibold text-[#FFF8F0] truncate">
                    {user.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#B9A99B] truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#FFF8F0] hover:bg-[#2C1710] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#B9A99B]">
                    manage_accounts
                  </span>
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/docs"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#FFF8F0] hover:bg-[#2C1710] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#B9A99B]">
                    description
                  </span>
                  <span>Documentation</span>
                </Link>

                <div className="border-t border-[#4A2B1D] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#f87171] hover:bg-[#2a1210] transition-colors cursor-pointer text-left w-full"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
