import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export const RouteErrorFallback: React.FC = () => {
  const error = useRouteError();
  console.error("[VeraOS Router] Uncaught route exception:", error);

  let title = "Interface Notice";
  let message = "An unexpected error occurred while loading this view. You can reload the page or return home.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || error.statusText || "The requested interface could not be located.";
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0704] p-4 text-[#F3E5D5] font-body-md selection:bg-[#C96A2B] selection:text-white">
      <div className="max-w-md w-full rounded-2xl bg-[#1C0F0A] border border-[#E08A3E]/30 p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#2C1710] border border-[#E08A3E]/40 flex items-center justify-center text-[#E08A3E] shadow-lg">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>
        <div>
          <h2 className="text-xl font-bold font-headline tracking-tight text-[#FFF8F0]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#B9A99B] mt-1.5 font-body leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C96A2B] to-[#E08A3E] hover:from-[#E08A3E] hover:to-[#ff9b49] text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Reload Application</span>
          </button>
          <Link
            to="/"
            className="py-2.5 px-4 rounded-xl bg-[#21110B] border border-white/10 hover:border-white/20 text-[#FFF8F0] font-semibold text-xs hover:bg-[#2C1710] transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorFallback;
