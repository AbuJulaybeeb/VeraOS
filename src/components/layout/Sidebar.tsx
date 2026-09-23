import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: "Overview",
      icon: "grid_view",
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      label: "Verifications",
      icon: "verified",
      path: "/verifications",
      active:
        location.pathname === "/verifications" ||
        (location.pathname.startsWith("/verify") && !location.pathname.includes("/evidence")),
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
      path: "/evidence",
      active: location.pathname === "/evidence" || location.pathname.includes("/evidence"),
    },
  ];

  return (
    <aside className="h-full w-64 bg-[#160C08] z-40 flex flex-col justify-between border-r border-[#4A2B1D] text-[#FFF8F0] font-sans">
      <div className="flex flex-col w-full p-4">
        {/* Brand */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#4A2B1D]">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#C96A2B] flex items-center justify-center shadow-[0_0_16px_rgba(201,106,43,0.35)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-[18px]">
                verified
              </span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-[#FFF8F0]">
              Vera<span className="text-[#E08A3E]">OS</span>
            </span>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B] cursor-pointer"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Primary Action: New Verification */}
        <Link
          to="/verify/new"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-heading font-semibold text-xs sm:text-sm shadow-[0_0_18px_rgba(201,106,43,0.3)] hover:shadow-[0_0_24px_rgba(201,106,43,0.45)] transition-all cursor-pointer mb-6"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Verification</span>
        </Link>

        {/* Core Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                item.active
                  ? "bg-[#2C1710] text-[#FFF8F0] font-semibold border border-[#4A2B1D] shadow-sm text-[#E08A3E]"
                  : "text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#21110B]"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  item.active ? "text-[#E08A3E]" : "text-[#B9A99B]"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Account Profile Footer */}
      <div className="p-4 border-t border-[#4A2B1D]">
        {user ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#21110B] border border-[#4A2B1D]">
            <Link
              to="/account"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C96A2B] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <div className="truncate">
                <p className="font-heading font-semibold text-xs text-[#FFF8F0] truncate">
                  {user.name}
                </p>
                <p className="font-mono text-[10px] text-[#B9A99B] truncate">
                  {user.email}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#B9A99B] hover:text-[#f87171] hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/welcome"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#21110B] hover:bg-[#2C1710] border border-[#4A2B1D] text-xs font-semibold text-[#FFF8F0] transition-colors"
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
