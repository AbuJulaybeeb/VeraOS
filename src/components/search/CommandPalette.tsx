import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: "Verifications" | "Actions" | "Agents" | "Evidence";
  title: string;
  subtitle: string;
  path: string;
  badge?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "v-1048",
    category: "Verifications",
    title: "Verification #V-1048 — Stellar Protocols & Payout",
    subtitle: "ResearchBot (v1.4) · 2 Critical Breaches · Deficit -$1.75M & -4.50 USDC",
    path: "/verify/v_test_89bf2e",
    badge: "FAILED",
  },
  {
    id: "v-00022",
    category: "Verifications",
    title: "Verification #V-00022 — Token Bytecode Audit",
    subtitle: "TraderAgent (v2.1) · 3 Contracts Verified · Stellar Ledger Confirmed",
    path: "/verify/v_test_pass_001",
    badge: "PASSED",
  },
  {
    id: "v-00020",
    category: "Verifications",
    title: "Verification #V-00020 — Multi-Gate Static Analysis",
    subtitle: "TraderAgent (v2.1) · Gate 4 dropped by agent due to truncation",
    path: "/verify/v_test_fail_002",
    badge: "FAILED",
  },
  {
    id: "v-00019",
    category: "Verifications",
    title: "Verification #V-00019 — Missing Onchain Receipt",
    subtitle: "ScoutAgent · 5 USDC Payment asserted without transaction hash",
    path: "/verify/v_test_unverif_003",
    badge: "UNVERIFIED",
  },
  {
    id: "v-00023",
    category: "Verifications",
    title: "Verification #V-00023 — Unverifiable TVL Threshold",
    subtitle: "AuditKernel · Unindexed protocol liquidity · Independent oracle needed",
    path: "/verify/v_test_unverif_004",
    badge: "UNVERIFIED",
  },
  {
    id: "agent-research",
    category: "Agents",
    title: "ResearchBot (v1.4) — Connected",
    subtitle: "Autonomous Research Agent · gpt-4o · 124 Verifications",
    path: "/agents",
  },
  {
    id: "agent-trader",
    category: "Agents",
    title: "TraderAgent (v2.1) — Connected",
    subtitle: "CrewAI Worker · claude-3.5-sonnet · 48 Verifications",
    path: "/agents",
  },
  {
    id: "evid-flagship",
    category: "Evidence",
    title: "Evidence Explorer — #V-1048 Triangulation",
    subtitle: "Stellar Horizon Receipt + Deterministic Invariant certificates",
    path: "/verify/v_test_89bf2e/evidence",
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

  const categories = Array.from(new Set(filtered.map((item) => item.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-container border border-white/10 shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 bg-surface-container-high border-b border-white/5 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verifications, agents, telemetry traces, pages..."
            className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-outline hover:text-on-surface text-xs px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-code-sm text-code-sm text-outline border border-white/5">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-outline text-xs">
              No matching records found for "{query}"
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat} className="flex flex-col gap-1">
                <span className="px-2 font-label-caps text-label-caps text-outline uppercase font-semibold">
                  {cat}
                </span>
                {filtered
                  .filter((item) => item.category === cat)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-2.5 rounded-xl text-left hover:bg-surface-container-high transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate">
                          {item.subtitle}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded font-label-caps text-[9px] uppercase font-bold shrink-0 ${
                            item.badge === "PASSED"
                              ? "bg-[#22c55e]/20 text-[#4ade80]"
                              : item.badge === "FAILED"
                              ? "bg-error-container text-error"
                              : "bg-surface-variant text-outline"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-container-lowest border-t border-white/5 flex items-center justify-between text-[11px] font-code-sm text-outline">
          <div className="flex items-center gap-2">
            <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-surface-container">↵</kbd></span>
            <span>Close: <kbd className="px-1 py-0.5 rounded bg-surface-container">ESC</kbd></span>
          </div>
          <span>VeraOS Global Telemetry Index</span>
        </div>
      </div>
    </div>
  );
};
