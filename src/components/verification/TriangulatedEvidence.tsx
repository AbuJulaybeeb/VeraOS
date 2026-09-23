import React, { useState } from "react";
import { VerificationRecord } from "../../types/verification";
import { IndependentEvidence } from "../../types/evidence";
import { cn } from "../../lib/utils";

interface TriangulatedEvidenceProps {
  record: VerificationRecord;
}

export const TriangulatedEvidence: React.FC<TriangulatedEvidenceProps> = ({ record }) => {
  const [modalContent, setModalContent] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const currentAttempt = record.attempts?.[record.attempts.length - 1];
  const evidenceList: IndependentEvidence[] = currentAttempt?.evidence || [];
  const stellarTx = currentAttempt?.stellarTxHash || record.stellarTxHash;

  const handleInspectPayload = (title: string, data: unknown) => {
    setModalContent({
      title,
      body: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    });
  };

  return (
    <div className="flex flex-col gap-space-sm mb-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            fingerprint
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Independent Evidence Artifacts
          </h2>
        </div>
        <span className="font-body-sm text-body-sm text-outline">
          Authoritative evidence witness records
        </span>
      </div>

      {evidenceList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {evidenceList.map((ev, idx) => {
            const isConfirmed = ev.status === "CONFIRMED";
            return (
              <div
                key={ev.id || idx}
                className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-white/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        {ev.type === "ONCHAIN"
                          ? "account_balance_wallet"
                          : ev.type === "WEB_ORACLE"
                          ? "public"
                          : "verified"}
                      </span>
                      <span className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">
                        {ev.title || ev.provider || "Witness Record"}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded font-label-caps text-label-caps font-semibold shrink-0",
                        isConfirmed
                          ? "bg-emerald-950/60 text-[#4ade80] border border-emerald-800/40"
                          : "bg-surface-container-high text-secondary border border-secondary/20"
                      )}
                    >
                      {ev.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 font-code-sm text-code-sm">
                    <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                      <span className="text-outline">Provider</span>
                      <span className="text-on-surface truncate ml-2 font-medium">{ev.provider}</span>
                    </div>
                    <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                      <span className="text-outline">Proof Type</span>
                      <span className="text-on-surface truncate ml-2">{ev.proofType}</span>
                    </div>

                    {ev.data &&
                      Object.entries(ev.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                          <span className="text-outline truncate mr-2">{key}</span>
                          <span className="text-on-surface truncate font-mono">{String(value)}</span>
                        </div>
                      ))}

                    {ev.proofHash && (
                      <div className="flex flex-col py-1 bg-surface-container/50 px-2 rounded">
                        <span className="text-outline text-[11px]">Proof Hash</span>
                        <span className="text-primary truncate font-mono text-[11px]">{ev.proofHash}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-space-md flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleInspectPayload(ev.title || "Proof Data", ev.data || ev)}
                    className="w-full py-1.5 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors flex items-center justify-center gap-1 border border-white/5"
                  >
                    <span>Inspect Evidence JSON</span>
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                  </button>

                  {ev.explorerUrl && (
                    <a
                      href={ev.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-space-sm rounded bg-[#21110B] hover:bg-[#2C1710] text-[#E08A3E] font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-1 border border-[#4A2B1D]"
                    >
                      <span>View on Explorer</span>
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-on-surface font-medium text-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
            <span>Deterministic Kernel Execution</span>
          </div>
          <p className="text-xs text-on-surface-variant font-mono">
            {currentAttempt?.detailedReason || "Independent verification executed against ledger consensus."}
          </p>
          {stellarTx && (
            <div className="pt-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${stellarTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-xs font-semibold text-[#E08A3E] hover:bg-[#2C1710]"
              >
                <span>View Onchain Transaction on Stellar Expert</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog for Raw Payloads */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container rounded-2xl max-w-2xl w-full p-6 border border-white/10 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {modalContent.title}
              </h3>
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto rounded-lg bg-surface-container-lowest p-4 font-mono text-xs text-on-surface-variant leading-relaxed">
              <pre>{modalContent.body}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalContent(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
