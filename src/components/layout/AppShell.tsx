import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { useVerificationsList } from "../../hooks/useVerification";
import { useAgents } from "../../hooks/useAgents";

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { verifications } = useVerificationsList();
  const { agents } = useAgents();

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
      <div className="lg:pl-72 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="w-full pt-16 bg-surface flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
