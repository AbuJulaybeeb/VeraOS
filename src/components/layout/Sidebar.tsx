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
      icon: "dashboard",
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      label: "My agents",
      icon: "smart_toy",
      path: "/agents",
      active: location.pathname.startsWith("/agents"),
    },
    {
      label: "Verification runs",
      icon: "verified",
      path: "/verifications",
      active:
        location.pathname === "/verifications" ||
        (location.pathname.startsWith("/verify") && !location.pathname.includes("/evidence")),
    },
    {
      label: "Evidence library",
      icon: "folder_open",
      path: "/evidence",
      active: location.pathname === "/evidence" || location.pathname.includes("/evidence"),
    },
  ];

  return (
    <aside className="h-full w-64 bg-[#181311] z-40 flex flex-col justify-between border-r border-[#2A2320] text-[#FFF8F0] font-sans">
      <div className="flex flex-col w-full p-5">
        {/* Brand */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2A2320]">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            {/* Minimalist Logo dots/mark */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              Vera<span className="text-[#D97736]">OS</span>
            </span>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#9E948B] hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Primary Action: Check new work */}
        <Link
          to="/verify/new"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#F3E8DC] hover:bg-[#EAE0D3] text-[#181311] font-heading font-semibold text-sm transition-all cursor-pointer mb-6 group shadow-sm"
        >
          <span>Check new work</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform text-[#181311]">
            arrow_forward
          </span>
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
                  ? "bg-[#26201D] text-white font-semibold shadow-sm"
                  : "text-[#9E948B] hover:text-white hover:bg-[#201A18]"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[19px] ${
                  item.active ? "text-[#D97736]" : "text-[#9E948B]"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Account / Workspace Footer */}
      <div className="p-4 border-t border-[#2A2320]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201A18] border border-[#2A2320]">
          <Link
            to="/account"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2D2421] border border-[#3D322E] text-[#D97736] flex items-center justify-center font-heading font-bold text-xs shrink-0">
              AO
            </div>
            <div className="truncate">
              <p className="font-heading font-semibold text-xs text-white truncate">
                Acme Operations
              </p>
              <p className="font-mono text-[10px] text-[#9E948B] truncate">
                {user?.email || "maya@acme.ai"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => logout()}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#9E948B] hover:text-[#f87171] hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
