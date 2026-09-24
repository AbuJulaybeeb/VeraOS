import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center gap-3 text-[#6B635B]">
        <div className="flex items-center gap-1 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97736]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#181311]" />
        </div>
        <span className="w-7 h-7 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-[#9E948B]">Verifying operator session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors back to the landing page with original destination saved
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  return <>{children}</>;
};
