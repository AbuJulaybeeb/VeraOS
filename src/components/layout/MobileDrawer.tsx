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
    { label: "Overview", icon: "dashboard", path: "/dashboard" },
    { label: "My agents", icon: "smart_toy", path: "/agents" },
    { label: "Verification runs", icon: "verified", path: "/verifications" },
    { label: "Evidence library", icon: "folder_open", path: "/evidence" },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] h-full bg-[#181311] border-r border-[#2A2320] p-5 flex flex-col justify-between z-10 text-[#FFF8F0]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#2A2320]">
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Vera<span className="text-[#D97736]">OS</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9E948B] hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Primary Action: Check new work */}
          <Link
            to="/verify/new"
            onClick={onClose}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#F3E8DC] hover:bg-[#EAE0D3] text-[#181311] font-heading font-semibold text-sm transition-all mb-6 group shadow-sm"
          >
            <span>Check new work</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform text-[#181311]">
              arrow_forward
            </span>
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
                      ? "bg-[#26201D] text-white font-semibold shadow-sm"
                      : "text-[#9E948B] hover:text-[#FFF8F0] hover:bg-[#201A18]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[19px] ${
                      active ? "text-[#D97736]" : "text-[#9E948B]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Account Controls */}
        <div className="pt-4 border-t border-[#2A2320]">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#201A18] border border-[#2A2320]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2D2421] border border-[#3D322E] text-[#D97736] flex items-center justify-center font-heading font-bold text-xs">
                  AO
                </div>
                <div className="truncate flex-1">
                  <p className="font-heading font-semibold text-xs text-white truncate">
                    Acme Operations
                  </p>
                  <p className="font-mono text-[10px] text-[#9E948B] truncate">
                    {user.email || "maya@acme.ai"}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#f87171] hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/welcome"
              onClick={onClose}
              className="w-full text-center py-2.5 rounded-xl bg-[#F3E8DC] text-[#181311] font-heading font-semibold text-xs block"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
