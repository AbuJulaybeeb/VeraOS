import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { useVerificationsList } from "../../hooks/useVerification";
import { useAgents } from "../../hooks/useAgents";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export const AppShell: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { verifications } = useVerificationsList();
  const { agents } = useAgents();

  // If user is not authenticated, prompt sign-in immediately
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal("signin");
    }
  }, [isAuthenticated, openAuthModal]);

  // If not authenticated, do NOT show verified tasks or telemetry. Block all app access!
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E0704] text-[#F3E5D5] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#1C0F0A] border border-[#E08A3E]/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C1710] to-[#1C0E09] border border-[#E08A3E]/60 flex items-center justify-center shadow-[0_0_25px_rgba(224,138,62,0.3)]">
            <span className="material-symbols-outlined text-[32px] text-[#E08A3E]">lock</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E08A3E] px-3 py-1 rounded-full bg-[#E08A3E]/10 border border-[#E08A3E]/30 w-fit mx-auto">
              Access Restricted • Sign In Required
            </span>
            <h1 className="text-2xl font-bold text-white">
              VeraOS Verified Tasks
            </h1>
            <p className="text-xs text-[#B9A99B] leading-relaxed">
              Access to verified task telemetry, agent execution logs, and cryptographic proofs is restricted to logged-in members. Please sign in to access the platform.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              onClick={() => openAuthModal("signin")}
              className="w-full py-3 shadow-lg flex items-center justify-center gap-2 font-bold text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In with Google or Email</span>
            </Button>

            <Link
              to="/"
              className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#B9A99B] hover:text-white hover:bg-white/5 transition-colors block"
            >
              Return to Landing Page
            </Link>
          </div>

          <div className="text-[11px] text-[#B9A99B]/60 flex items-center gap-2 border-t border-white/5 pt-4 w-full justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stellar Ledger Invariant Engine Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-72 z-50">
        <Sidebar
          verificationsCount={verifications.length}
          agentsCount={agents.length}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        verificationsCount={verifications.length}
        agentsCount={agents.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="w-full pt-16 bg-surface flex-1 px-space-md lg:px-space-lg py-space-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
