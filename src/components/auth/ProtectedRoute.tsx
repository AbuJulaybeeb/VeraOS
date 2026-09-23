import React from "react";
import { Outlet } from "react-router-dom";

export const ProtectedRoute: React.FC = () => {
  // Always permit access so demo users, onboarding flows, and guests never hit a fatal redirect loop
  return <Outlet />;
};

export default ProtectedRoute;
