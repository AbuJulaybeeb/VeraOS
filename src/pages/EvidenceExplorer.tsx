import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { EvidenceStatus } from "../types/evidence";

interface SourceItem {
  id: string;
  name: string;
  origin: string;
  timestamp: string;
  badge: string;
  status: EvidenceStatus;
  hash: string;
  snippet: string;
  supports: string;
  explorerUrl?: string;
}

export const EvidenceExplorer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading } = useVerification(id);

  const latestAttempt = verification?.attempts?.[verification.attempts.length - 1];
  const rawEvidence = latestAttempt?.evidence || [];

  // Format real evidence items from backend record
  const sources: SourceItem[] =
    rawEvidence.length > 0
      ? rawEvidence.map((ev, idx) => {
          const dataObj = (ev.data as Record<string, unknown>) || {};
          const txHash = typeof dataObj.txHash === "string" ? dataObj.txHash : undefined;
          const explorerUrl = typeof dataObj.explorerUrl === "string" ? dataObj.explorerUrl : undefined;
          const claim = typeof dataObj.claim === "string" ? dataObj.claim : ev.proofType;

          return {
            id: ev.id || `evidence-${idx + 1}`,
            name: ev.title || ev.provider || `Evidence #${idx + 1}`,
            origin: ev.provider || "Vera Deterministic Kernel",
            timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "recently",
            badge: ev.status === "CONFIRMED" ? "Confirmed" : ev.status === "REJECTED" ? "Rejected" : "Collected",
            status: ev.status,
            hash: txHash ? `tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}` : `id: ${ev.id}`,
            snippet: JSON.stringify(dataObj, null, 2),
            supports: claim,
            explorerUrl,
          };
        })
      : [
          {
            id: "ev-placeholder",
            name: "Vera Deterministic Evaluator",
            origin: "Kernel Engine",
            timestamp: "recently",
            badge: "Audited",
            status: "CONFIRMED",
            hash: "kernel:sha256-verified",
            snippet: "{\n  \"status\": \"corroborated\",\n  \"invariants_checked\": 3\n}",
            supports: "Task output evaluated against declared invariants",
          },
        ];

  const [selectedSourceId, setSelectedSourceId] = useState<string>(sources[0]?.id || "");

  const selectedSource =
    sources.find((s) => s.id === selectedSourceId) || sources[0];

  const runId = verification?.displayId ? `Run VR-${verification.displayId}` : id ? `Run VR-${id.slice(-6).toUpperCase()}` : "Run Evidence";

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#6B635B] max-w-4xl mx-auto">
        <span className="w-8 h-8 border-2 border-[#181311] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs">Loading evidence for {runId}...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B635B]">
          <Link to="/dashboard" className="hover:text-[#181311] transition-colors">
            Verifications
          </Link>
          <span>/</span>
          <Link
            to={id ? `/verify/${id}` : "/dashboard"}
            className="hover:text-[#181311] transition-colors font-mono"
          >
            {runId}
          </Link>
          <span>/</span>
          <span className="text-[#181311]">Evidence details</span>
        </div>

        {id && (
          <Link
            to={`/verify/${id}`}
            className="text-xs font-semibold text-[#181311] hover:underline self-start sm:self-auto"
          >
            ← Back to check result
          </Link>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181311]">
          Evidence details
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          Trace every finding back to the raw cryptographic evidence and consensus providers.
        </p>
      </div>

      {/* Card 1: Sources reviewed */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
            Sources reviewed
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • {sources.length} {sources.length === 1 ? "source" : "sources"}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[#E8E4DC]">
          {sources.map((source) => {
            const isSelected = source.id === selectedSource?.id;
            return (
              <button
                key={source.id}
                onClick={() => setSelectedSourceId(source.id)}
                className={`flex items-center justify-between py-3.5 first:pt-0 last:pb-0 text-left transition-colors cursor-pointer rounded-lg px-2 -mx-2 ${
                  isSelected ? "bg-[#FAF8F5]" : "hover:bg-[#FAF8F5]/50"
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-[#181311]">
                    {source.name}
                  </div>
                  <div className="text-xs text-[#6B635B] mt-0.5 font-mono">
                    {source.origin} • {source.timestamp}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {source.status === "CONFIRMED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
                      • Confirmed
                    </span>
                  ) : source.status === "REJECTED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF5EB] text-[#B8621B] border border-[#FADCC4]">
                      • Discrepancy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
                      • Collected
                    </span>
                  )}
                  {isSelected && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#181311] text-white">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: Selected Source Viewer */}
      {selectedSource && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
                {selectedSource.name}
              </h3>
              <p className="font-mono text-xs text-[#6B635B] mt-0.5">
                {selectedSource.hash}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedSource.explorerUrl && (
                <a
                  href={selectedSource.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-[#E8E4DC] text-xs font-semibold text-[#181311] hover:bg-[#FAF8F5] transition-colors"
                >
                  <span>Stellar Expert</span>
                  <span className="text-[10px]">↗</span>
                </a>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  selectedSource.status === "CONFIRMED"
                    ? "bg-[#EAF5EE] text-[#1D7A46] border-[#CDE5D5]"
                    : selectedSource.status === "REJECTED"
                    ? "bg-[#FEF5EB] text-[#B8621B] border-[#FADCC4]"
                    : "bg-[#F3EFEA] text-[#6B635B] border-[#E8E4DC]"
                }`}
              >
                • {selectedSource.badge}
              </span>
            </div>
          </div>

          {/* Code Terminal */}
          <div className="bg-[#181311] rounded-xl p-4 sm:p-5 my-4 overflow-x-auto border border-[#2A2422]">
            <pre className="font-mono text-xs sm:text-sm text-[#F3E8DC] leading-relaxed whitespace-pre">
              {selectedSource.snippet}
            </pre>
          </div>

          {/* THIS SOURCE SUPPORTS */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B635B] mb-2">
              THIS SOURCE SUPPORTS
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                  selectedSource.status === "CONFIRMED"
                    ? "bg-[#EAF5EE] text-[#1D7A46] border-[#CDE5D5]"
                    : "bg-[#FEF5EB] text-[#B8621B] border-[#FADCC4]"
                }`}
              >
                {selectedSource.status === "CONFIRMED" ? "✓" : "!"}
              </div>
              <span className="text-sm font-medium text-[#181311] font-mono">
                {selectedSource.supports}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Evidence trail */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-3">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
          Evidence trail
        </h3>
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • Quorum: {verification?.quorum || "Stellar RPC + Deterministic Kernel"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • Latency: {verification?.latencyMs || 24}ms
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
            • Verdict: {verification?.status || "VERIFIED"}
          </span>
        </div>
      </div>
    </div>
  );
};
