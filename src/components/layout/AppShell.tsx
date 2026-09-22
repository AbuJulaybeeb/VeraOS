import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-72 z-50">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="w-full pt-16 bg-surface flex-1 px-4 sm:px-space-md lg:px-space-lg py-space-lg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
