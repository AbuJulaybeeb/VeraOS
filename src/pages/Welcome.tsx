import React from "react";
import { Link } from "react-router-dom";

export const Welcome: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 font-sans">
      {/* 1. Page Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#191513]">
          Welcome to Vera
        </h1>
        <p className="text-sm sm:text-base text-[#6B635B] mt-1.5">
          The verification layer for AI agents.
        </p>
      </div>

      {/* 2. Connect Your First Agent Card (Image 3) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF5EB] border border-[#FADCC4] text-[#D97736] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">smart_toy</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[#191513]">
              Connect your first agent
            </h2>
            <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-xl leading-relaxed">
              Hook up your AI agent via API, Webhook, or Telegram bot to start verifying claims against independent ground-truth evidence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            to="/connect-agent"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <span>Connect an agent</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <Link
            to="/verify/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D5CEC5] text-[#191513] font-heading font-semibold text-xs sm:text-sm transition-all"
          >
            <span>Check manual work</span>
          </Link>
        </div>
      </div>

      {/* 3. Dark "What Vera Does" Banner (Image 3) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#181311] border border-[#2A2320] text-white shadow-md">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D97736] block mb-2">
          What Vera does
        </span>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2.5">
          Your agent does the work. Vera checks the result.
        </h2>
        <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
          Vera sits between your AI agent and the outside world. When your agent claims it completed an action, Vera independently verifies the claim before you trust it.
        </p>
      </div>

      {/* 4. Three Numbered Workflow Cards (Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Connect */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#181311] text-[#F3E8DC] font-heading font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-heading font-bold text-lg text-[#191513] mb-2">
              Connect
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
              Link your agent via API key, webhook endpoint, or Telegram integration in under 2 minutes.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E8E4DC]">
            <Link
              to="/connect-agent"
              className="text-xs font-semibold text-[#181311] hover:text-[#D97736] inline-flex items-center gap-1 transition-colors"
            >
              <span>Setup connection</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Submit */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#181311] text-[#F3E8DC] font-heading font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-heading font-bold text-lg text-[#191513] mb-2">
              Submit
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
              Your agent sends its execution claims, parameters, and receipts whenever a task finishes.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E8E4DC]">
            <Link
              to="/verify/new"
              className="text-xs font-semibold text-[#181311] hover:text-[#D97736] inline-flex items-center gap-1 transition-colors"
            >
              <span>Submit completed task</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Decide */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-full bg-[#181311] text-[#F3E8DC] font-heading font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-heading font-bold text-lg text-[#191513] mb-2">
              Decide
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
              Vera gathers independent evidence and renders a cryptographically attested PASS or FAIL verdict.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#E8E4DC]">
            <Link
              to="/verifications"
              className="text-xs font-semibold text-[#181311] hover:text-[#D97736] inline-flex items-center gap-1 transition-colors"
            >
              <span>View live runs</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
