import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-[28px]">
          search_off
        </span>
      </div>
      <h1 className="font-headline-lg font-bold text-on-surface">
        404 — Route Invariant Unmet
      </h1>
      <p className="font-body-md text-on-surface-variant max-w-md">
        The requested path does not exist in the VeraOS verification routing map.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Telemetry Dashboard</Button>
      </Link>
    </div>
  );
};
