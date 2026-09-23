import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";

interface SourceItem {
  id: string;
  name: string;
  origin: string;
  timestamp: string;
  badge: string;
  hash: string;
  snippet: string;
  supports: string;
}

const SOURCES: SourceItem[] = [
  {
    id: "source-1",
    name: "Refund record RF-88124",
    origin: "Commerce API",
    timestamp: "Sep 23, 12:29 PM",
    badge: "Strong",
    hash: "sha256: 4fc2..99a1 • source unchanged",
    snippet: `refund_id: RF-88124
order_id: AC-19482
amount_refunded: 148.20 USD
status: settled
processor: stripe_live_core
verified_at: 2026-09-23T12:29:44Z`,
    supports: "Refund amount matches original transaction exactly ($148.20)",
  },
  {
    id: "source-2",
    name: "Customer email",
    origin: "Support inbox",
    timestamp: "Sep 23, 12:31 PM",
    badge: "Strong",
    hash: "sha256: 18b7..3e59 • source unchanged",
    snippet: `message_id: MSG-9812410
recipient: customer@example.org
subject: "Your refund of $148.20 has been processed"
delivered_at: 2026-09-23T12:31:02Z
template_id: refund_confirmation_v2`,
    supports: "Customer notification delivered with matching refund amount",
  },
  {
    id: "source-3",
    name: "Order note N-4821",
    origin: "Commerce API",
    timestamp: "Sep 23, 12:32 PM",
    badge: "Selected",
    hash: "sha256: 7ea9..41bd • source unchanged",
    snippet: `order_id: AC-19482
action: full_refund
amount: 148.20 USD
note: Duplicate shipment confirmed; refund approved
recorded_by: resolution-agent-prod`,
    supports: "Refund reason recorded as duplicate shipment",
  },
];

export const EvidenceExplorer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification } = useVerification(id);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("source-3");

  const selectedSource =
    SOURCES.find((s) => s.id === selectedSourceId) || SOURCES[2];

  const runId = verification?.displayId ? `VR-${verification.displayId}` : "VR-2984";

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#6B635B]">
          <Link to="/verifications" className="hover:text-[#181311] transition-colors">
            Verifications
          </Link>
          <span>/</span>
          <Link
            to={id ? `/verify/${id}` : "/verifications"}
            className="hover:text-[#181311] transition-colors"
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
          Trace every finding back to the source Vera reviewed.
        </p>
      </div>

      {/* Card 1: Sources reviewed */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
            Sources reviewed
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • 3 sources
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[#E8E4DC]">
          {SOURCES.map((source) => {
            const isSelected = source.id === selectedSourceId;
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
                  <div className="text-xs text-[#6B635B] mt-0.5">
                    {source.origin} • {source.timestamp}
                  </div>
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#181311] text-white">
                    • Selected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
                    • Strong
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: Selected Source Viewer */}
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] self-start sm:self-auto">
            • Verified source
          </span>
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
            <div className="w-5 h-5 rounded-full bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] flex items-center justify-center text-xs font-bold shrink-0">
              ✓
            </div>
            <span className="text-sm font-medium text-[#181311]">
              {selectedSource.supports}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Evidence trail */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm flex flex-col gap-3">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#181311]">
          Evidence trail
        </h3>
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • Collected 12:32:04
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • Integrity checked 12:32:05
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3EFEA] text-[#6B635B] border border-[#E8E4DC]">
            • Matched 12:32:18
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5]">
            • Verdict 12:32:41
          </span>
        </div>
      </div>
    </div>
  );
};
