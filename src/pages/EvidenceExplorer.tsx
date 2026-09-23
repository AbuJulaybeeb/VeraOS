import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification, useVerificationsList } from "../hooks/useVerification";

export const EvidenceExplorer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { verification, loading: singleLoading } = useVerification(id);
  const { verifications, loading: listLoading } = useVerificationsList();

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
          <div className="flex items-center gap-2 text-xs text-[#6B635B] mb-1">
            <Link to="/dashboard" className="hover:text-[#191513]">Overview</Link>
            <span>/</span>
            <span className="text-[#D97736]">Evidence library</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
            Evidence library
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
            Trustworthy audit surface of independently corroborated witnesses and ledger receipts.
          </p>
        </div>

        {id && (
          <Link
            to={`/verify/${id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#181311] text-xs font-semibold text-[#191513] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Verification</span>
          </Link>
        )}
      </div>

      {/* Evidence Items List */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col items-center justify-center gap-3 text-[#6B635B]">
          <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs">Loading evidence records...</span>
        </div>
      ) : evidenceItems.length === 0 ? (
        <div className="p-12 sm:p-20 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF5EB] border border-[#FADCC4] flex items-center justify-center text-[#D97736]">
            <span className="material-symbols-outlined text-[24px]">fingerprint</span>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-[#191513]">
              No evidence records found
            </h3>
            <p className="text-xs sm:text-sm text-[#6B635B] max-w-sm mt-1.5 leading-relaxed">
              Run a verification to produce independently witnessed audit evidence.
            </p>
          </div>
          <Link
            to="/verify/new"
            className="px-5 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white text-xs font-heading font-semibold shadow-sm transition-all"
          >
            New Verification
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {evidenceItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E4DC] flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top row: Evidence type, source, status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E4DC]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#D97736]">
                    receipt_long
                  </span>
                  <span className="font-heading font-bold text-sm text-[#191513]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#6B635B]">
                    #{item.verificationId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#D97736] border border-[#E8E4DC]">
                    {item.proofType || "Grounded Proof"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] border border-[#CDE5D5] text-[#1D7A46] font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A46]" />
                    <span>VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Requirement context */}
              {item.taskPrompt && (
                <p className="text-xs text-[#6B635B] line-clamp-1">
                  Task: <span className="text-[#191513] font-medium">{item.taskPrompt}</span>
                </p>
              )}

              {/* Data attributes */}
              {item.data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs font-mono">
                  {Object.entries(item.data).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2 truncate">
                      <span className="text-[#6B635B] text-[11px]">{k}:</span>
                      <span className="text-[#191513] font-semibold truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Identifier / Hash */}
              {item.proofHash && (
                <div className="flex items-center justify-between gap-3 pt-2 text-xs font-mono">
                  <span className="text-[#6B635B] text-[11px] uppercase shrink-0">
                    Identifier:
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#D97736] truncate max-w-[260px] sm:max-w-md">
                      {item.proofHash}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(item.proofHash || "")}
                      className="p-1 rounded text-[#6B635B] hover:text-[#191513] transition-colors cursor-pointer"
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
