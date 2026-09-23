import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const navItems = [
    { label: "Overview", icon: "grid_view", path: "/dashboard" },
    { label: "Verifications", icon: "verified", path: "/verifications" },
    { label: "Agents", icon: "smart_toy", path: "/agents" },
    { label: "Evidence", icon: "fingerprint", path: "/evidence" },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] h-full bg-[#160C08] border-r border-[#4A2B1D] p-5 flex flex-col justify-between z-10 text-[#FFF8F0]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#4A2B1D]">
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-[#C96A2B] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">verified</span>
              </div>
              <span className="font-heading font-bold text-lg text-white">
                Vera<span className="text-[#E08A3E]">OS</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#B9A99B] hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Primary Action: New Verification */}
          <Link
            to="/verify/new"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-sm shadow-md mb-6"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>New Verification</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path === "/verifications" && location.pathname.startsWith("/verify"));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#2C1710] text-[#E08A3E] font-semibold border border-[#4A2B1D]"
                      : "text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Account Controls */}
        <div className="pt-4 border-t border-[#4A2B1D]">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#21110B] border border-[#4A2B1D]"
              >
                <div className="w-8 h-8 rounded-full bg-[#C96A2B] text-white flex items-center justify-center font-heading font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="truncate flex-1">
                  <p className="font-heading font-semibold text-xs text-white truncate">
                    {user.name}
                  </p>
                  <p className="font-mono text-[10px] text-[#B9A99B] truncate">
                    {user.email}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#f87171] hover:bg-[#2a1210] rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/welcome"
              onClick={onClose}
              className="w-full text-center py-2.5 rounded-xl bg-[#C96A2B] text-white font-heading font-semibold text-xs block"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
