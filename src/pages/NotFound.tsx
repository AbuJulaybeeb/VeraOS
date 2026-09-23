import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4 font-sans">
      <div className="w-14 h-14 rounded-2xl bg-[#21110B] border border-[#4A2819] flex items-center justify-center text-[#E08A3E]">
        <span className="material-symbols-outlined text-[32px]">
          search_off
        </span>
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#FFF8F0]">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-[#B9A99B] max-w-md">
        The requested path does not exist in the VeraOS verification routing map.
      </p>
      <Link to="/dashboard" className="pt-2">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};
