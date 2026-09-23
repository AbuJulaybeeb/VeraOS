import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification, useVerificationsList } from "../hooks/useVerification";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export const EvidenceExplorer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // If ID is provided, query specific verification. Otherwise list all verifications.
  const { verification, loading: singleLoading } = useVerification(id);
  const { verifications, loading: listLoading } = useVerificationsList();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Compile evidence items
  const evidenceItems = id && verification
    ? (verification.attempts?.[verification.attempts.length - 1]?.evidence || []).map((e) => ({
        ...e,
        verificationId: verification.displayId,
        taskPrompt: verification.taskPrompt,
        timestamp: verification.createdAt,
      }))
    : verifications.flatMap((v) => {
        const attempt = v.attempts?.[v.attempts.length - 1];
        return (attempt?.evidence || []).map((e) => ({
          ...e,
          verificationId: v.displayId,
          taskPrompt: v.taskPrompt,
          timestamp: v.createdAt,
        }));
      });

  const loading = id ? singleLoading : listLoading;

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#B9A99B] mb-1">
            <Link to="/dashboard" className="hover:text-[#FFF8F0]">Overview</Link>
            <span>/</span>
            <span className="text-[#E08A3E]">Evidence</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#FFF8F0]">
            Independent Evidence
          </h1>
          <p className="text-xs sm:text-sm text-[#B9A99B] mt-1">
            Trustworthy audit surface of independently corroborated witnesses and ledger receipts.
          </p>
        </div>

        {id && (
          <Link to={`/verify/${id}`}>
            <Button
              variant="outline"
              size="sm"
              icon={<span className="material-symbols-outlined text-[16px]">arrow_back</span>}
            >
              Back to Verification
            </Button>
          </Link>
        )}
      </div>

      {/* Evidence Items List */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center gap-3 text-[#B9A99B]">
          <span className="w-8 h-8 border-2 border-[#C96A2B] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs">Loading evidence records...</span>
        </div>
      ) : evidenceItems.length === 0 ? (
        <div className="p-12 sm:p-20 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E]">
            <span className="material-symbols-outlined text-[24px]">fingerprint</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#FFF8F0]">
              No evidence records found
            </h3>
            <p className="text-xs sm:text-sm text-[#B9A99B] max-w-sm mt-1.5 leading-relaxed">
              Run a verification to produce independently witnessed audit evidence.
            </p>
          </div>
          <Link to="/verify/new">
            <Button variant="primary" size="md">
              New Verification
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {evidenceItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 sm:p-6 rounded-3xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-3 shadow-sm"
            >
              {/* Top row: Evidence type, source, status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#4A2B1D]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#E08A3E]">
                    receipt_long
                  </span>
                  <span className="font-heading font-bold text-sm text-[#FFF8F0]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#B9A99B]">
                    #{item.verificationId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#160C08] text-[#E08A3E] border border-[#4A2B1D]">
                    {item.proofType || "Grounded Proof"}
                  </span>
                  <Badge variant="passed" dot>
                    VERIFIED
                  </Badge>
                </div>
              </div>

              {/* Requirement context */}
              {item.taskPrompt && (
                <p className="text-xs text-[#B9A99B] line-clamp-1">
                  Task: <span className="text-[#FFF8F0]">{item.taskPrompt}</span>
                </p>
              )}

              {/* Data attributes */}
              {item.data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-2xl bg-[#160C08] border border-[#4A2B1D]/60 text-xs font-mono">
                  {Object.entries(item.data).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2 truncate">
                      <span className="text-[#B9A99B] text-[11px]">{k}:</span>
                      <span className="text-[#FFF8F0] font-semibold truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Identifier / Hash (Monospace with copy button) */}
              {item.proofHash && (
                <div className="flex items-center justify-between gap-3 pt-2 text-xs font-mono">
                  <span className="text-[#B9A99B] text-[11px] uppercase shrink-0">
                    Identifier:
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#E08A3E] truncate max-w-[260px] sm:max-w-md">
                      {item.proofHash}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(item.proofHash || "")}
                      className="p-1 rounded text-[#B9A99B] hover:text-[#FFF8F0] transition-colors cursor-pointer"
                      title="Copy Identifier"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedHash === item.proofHash ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
