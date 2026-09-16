import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AgentProvider } from "../context/AgentContext";
import { AuthModal } from "../components/auth/AuthModal";
import { AgentConnectModal } from "../components/agent/AgentConnectModal";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AgentProvider>
          {children}
          <AuthModal />
          <AgentConnectModal />
        </AgentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
