import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { AgentProvider } from "../context/AgentContext";
import { ErrorBoundary } from "../components/common/ErrorBoundary";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AgentProvider>
            {children}
          </AgentProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
