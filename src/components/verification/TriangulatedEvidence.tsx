import React, { useState } from "react";
import { VerificationRecord } from "../../types/verification";

interface TriangulatedEvidenceProps {
  record: VerificationRecord;
}

export const TriangulatedEvidence: React.FC<TriangulatedEvidenceProps> = ({ record }) => {
  const [modalContent, setModalContent] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const currentAttempt = record.attempts[record.attempts.length - 1];
  const isRemediated = record.currentAttempt >= 2;

  const handleOpenOraclePayload = () => {
    setModalContent({
      title: "TLS-Notary Session Proof Payload",
      body: JSON.stringify(
        {
          session_id: "tls_notary_base_8453_98f1",
          verifier: "VeraOS TLS Witness Node #4",
          timestamp: new Date().toISOString(),
          endpoint: "https://api.llama.fi/protocol/seamless-protocol",
          server_signature: "0xfa399bf20199e8281023812903102381203",
          tls_version: "TLS 1.3",
          cipher_suite: "TLS_AES_256_GCM_SHA384",
          http_status: 200,
          extracted_body: {
            slug: "seamless-protocol",
            name: "Seamless Protocol",
            chainTvls: {
              Base: isRemediated ? 214200000 : 8241900,
            },
          },
        },
        null,
        2
      ),
    });
  };

  const handleOpenTrace = () => {
    setModalContent({
      title: "Raw Agent Execution Trace Log",
      body:
        currentAttempt?.rawTraceJson ||
        JSON.stringify(
          {
            agent: record.workerName,
            task: record.taskPrompt,
            attempt: record.currentAttempt,
            invocations: ["search_base_lending_protocols", "evaluate_tvl", "dispatch_payout"],
          },
          null,
          2
        ),
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
            Triangulated Evidence Artifacts
          </h2>
        </div>
        <span className="font-body-sm text-body-sm text-outline">
          Multi-source cryptographically signed audit trail
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Card 1: Base Blockchain Proof */}
        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  account_balance_wallet
                </span>
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Base RPC Receipt
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-[#4ade80] font-label-caps text-label-caps border border-[#22c55e]/20">
                VERIFIED ONCHAIN
              </span>
            </div>

            <div className="flex flex-col gap-2 font-code-sm text-code-sm">
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Chain</span>
                <span className="text-on-surface">{record.network}</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Block</span>
                <span className="text-on-surface">
                  #{currentAttempt?.blockNumber || 21849201}
                </span>
              </div>
              <div className="flex flex-col py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Tx Hash</span>
                <span className="text-primary truncate font-mono">
                  {isRemediated
                    ? "0x91cc4421b8fa012984fe9823901bca019"
                    : "0x8a7b3c21a4de99f2b1892f3900a41cd"}
                </span>
              </div>
              <div className="flex flex-col py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Asset</span>
                <span className="text-on-surface truncate font-mono">
                  USDC (Stellar Native Credit Asset)
                </span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Transferred</span>
                <span
                  className={
                    isRemediated
                      ? "text-[#4ade80] font-bold"
                      : "text-error font-bold"
                  }
                >
                  {isRemediated ? "5.000000 USDC" : "0.500000 USDC (Deficit: 4.50 USDC)"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const tx = isRemediated
                ? "5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"
                : "8a7b3c21a4de99f2b1892f3900a41cd";
              window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
            }}
            className="mt-space-md w-full py-1.5 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-[#E08A3E] font-body-sm text-body-sm font-medium transition-colors flex items-center justify-center gap-1 border border-[#4A2B1D]"
          >
            <span>View on Stellar Expert</span>
            <span className="material-symbols-outlined text-[16px]">
              open_in_new
            </span>
          </button>
        </div>

        {/* Card 2: DefiLlama Web Oracle */}
        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  public
                </span>
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Web Oracle Witness
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-label-caps text-label-caps border border-secondary/20">
                TLS-NOTARY SIGNED
              </span>
            </div>

            <div className="flex flex-col gap-2 font-code-sm text-code-sm">
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Provider</span>
                <span className="text-on-surface">DefiLlama REST API</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Timestamp</span>
                <span className="text-on-surface">14:32:01 UTC</span>
              </div>
              <div className="flex flex-col py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Endpoint</span>
                <span className="text-primary truncate font-mono">
                  api.llama.fi/protocol/{isRemediated ? "aerodrome" : "seamless-protocol"}
                </span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Chain Scope</span>
                <span className="text-on-surface">Base Only</span>
              </div>
              <div className="flex justify-between py-1 bg-surface-container/50 px-2 rounded">
                <span className="text-outline">Live TVL</span>
                <span
                  className={
                    isRemediated
                      ? "text-[#4ade80] font-bold"
                      : "text-error font-bold"
                  }
                >
                  {isRemediated ? "$214,200,000 USD" : "$8,241,900 USD"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenOraclePayload}
            className="mt-space-md w-full py-1.5 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors flex items-center justify-center gap-1 border border-white/5"
          >
            <span>Inspect Proof Payload</span>
            <span className="material-symbols-outlined text-[16px]">
              data_object
            </span>
          </button>
        </div>

        {/* Card 3: Worker Output Trace */}
        <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-[18px]">
                  smart_toy
                </span>
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Worker Telemetry Trace
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline font-label-caps text-label-caps border border-white/5">
                AGENT CLAIM ONLY
              </span>
            </div>

            <div className="rounded bg-surface-container-lowest p-2 font-code-sm text-code-sm text-on-surface-variant overflow-x-auto border border-white/5 max-h-36">
              <pre className="text-[11px] leading-relaxed">
                <code>
                  {isRemediated
                    ? `{\n  "agent": "${record.workerName}",\n  "remediated": true,\n  "selection": ["aerodrome", "moonwell", "overnight"],\n  "payout_total": 5000000\n}`
                    : `{\n  "agent": "ResearchBot_v1.4",\n  "selection": [\n    {"slug": "seamless", "tvl": 12000000},\n    {"slug": "moonwell", "tvl": 45000000},\n    {"slug": "overnight", "tvl": 12000000}\n  ],\n  "payout_tx": "0x8a7b...41cd",\n  "payout_units": "500000"\n}`}
                </code>
              </pre>
            </div>
          </div>

          <button
            onClick={handleOpenTrace}
            className="mt-space-md w-full py-1.5 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-medium transition-colors flex items-center justify-center gap-1 border border-white/5"
          >
            <span>Inspect Prompt Execution Trace</span>
            <span className="material-symbols-outlined text-[16px]">
              terminal
            </span>
          </button>
        </div>
      </div>

      {/* Proof Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface-container max-w-2xl w-full rounded-2xl border border-white/10 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {modalContent.title}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-surface-container-lowest font-code-sm text-code-sm text-primary-fixed-dim overflow-x-auto max-h-96 leading-relaxed border border-white/5">
              <code>{modalContent.body}</code>
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-md"
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
