import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVerification } from "../hooks/useVerification";
import { StatusBanner } from "../components/verification/StatusBanner";
import { TaskSpecCard } from "../components/verification/TaskSpecCard";
import { VerdictBanner } from "../components/verification/VerdictBanner";
import { RemediationPanel } from "../components/verification/RemediationPanel";
import { Button } from "../components/ui/Button";
import { TELEGRAM_BOT_URL } from "../config/env";

export const VerificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { verification, loading, error, resubmit, isResubmitting } = useVerification(id);
  const [copiedId, setCopiedId] = useState(false);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant max-w-7xl mx-auto">
        <span className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center gap-4 bg-surface-container-low rounded-2xl border border-white/5">
        <span className="material-symbols-outlined text-error text-[32px]">error_outline</span>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Verification not found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {error ?? "This verification record could not be loaded."}
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(verification.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const scrollToRemediation = () => {
    document.getElementById("remediation-panel")?.scrollIntoView({ behavior: "smooth" });
  };

  const latestAttempt = verification.attempts[verification.attempts.length - 1];

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-space-lg pb-24 md:pb-0">

      {/* Breadcrumb + header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[13px] text-outline">
            <Link to="/dashboard" className="hover:text-on-surface transition-colors">Verifications</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary font-medium">{verification.displayId}</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[11px]">
              {verification.network}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {verification.displayId}
            </h1>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-all"
              title="Copy ID"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <Link to={`/verify/${verification.id}/evidence`}>
            <Button variant="secondary" size="md" icon={<span className="material-symbols-outlined text-[18px]">fingerprint</span>}>
              Evidence
            </Button>
          </Link>
          {verification.status !== "PASSED" ? (
            <Button variant="primary" size="md" onClick={scrollToRemediation}
              icon={<span className="material-symbols-outlined text-[18px]">build_circle</span>}>
              Fix & Resubmit
            </Button>
          ) : (
            <Button variant="secondary" size="md"
              onClick={() => {
                const tx = latestAttempt?.stellarTxHash ?? "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";
                window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
              }}
              icon={<span className="material-symbols-outlined text-[18px]">verified</span>}>
              View on Stellar
            </Button>
          )}
        </div>
      </div>

      {/* Status banner */}
      <StatusBanner record={verification} />

      {/* Task */}
      <TaskSpecCard record={verification} />

      {/* Requirements checklist */}
      {latestAttempt?.invariants && latestAttempt.invariants.length > 0 && (
        <div className="rounded-xl bg-surface-container-low border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Requirements</h2>
            <span className="font-body-sm text-body-sm text-outline">
              {latestAttempt.invariants.filter((i) => i.status === "PASSED").length} / {latestAttempt.invariants.length} passed
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {latestAttempt.invariants.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-start gap-3">
                <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${
                  inv.status === "PASSED" ? "text-[#4ade80]"
                  : inv.status === "FAILED" ? "text-error"
                  : "text-outline"
                }`}>
                  {inv.status === "PASSED" ? "check_circle" : inv.status === "FAILED" ? "cancel" : "help"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">{inv.name}</p>
                  {inv.description && (
                    <p className="font-body-sm text-body-sm text-outline mt-0.5">{inv.description}</p>
                  )}
                  {(inv.expected || inv.actual) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 font-code-sm text-code-sm">
                      {inv.expected && (
                        <span className="text-outline">Expected: <span className="text-on-surface">{inv.expected}</span></span>
                      )}
                      {inv.actual && (
                        <span className="text-outline">Observed: <span className={inv.status === "PASSED" ? "text-[#4ade80]" : "text-error"}>{inv.actual}</span></span>
                      )}
                      {inv.delta && (
                        <span className="text-error">{inv.delta}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded shrink-0 font-bold ${
                  inv.status === "PASSED" ? "bg-[#4ade80]/10 text-[#4ade80]"
                  : inv.status === "FAILED" ? "bg-error/10 text-error"
                  : "bg-surface-container text-outline"
                }`}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Independent evidence */}
      {latestAttempt?.evidence && latestAttempt.evidence.length > 0 && (
        <div className="rounded-xl bg-surface-container-low border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Independent Evidence</h2>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-caps text-label-caps text-outline uppercase text-[10px]">
              Not from the agent
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {latestAttempt.evidence.map((ev) => (
              <div key={ev.id} className="px-5 py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[17px]">
                      {ev.type === "ONCHAIN" ? "account_balance_wallet" : ev.type === "WEB_ORACLE" ? "public" : "receipt_long"}
                    </span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">{ev.title}</span>
                  </div>
                  <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    ev.status === "CONFIRMED" ? "bg-[#4ade80]/10 text-[#4ade80]"
                    : ev.status === "REJECTED" ? "bg-error/10 text-error"
                    : "bg-surface-container text-outline"
                  }`}>
                    {ev.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(ev.data).slice(0, 6).map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-0.5">
                      <span className="font-code-sm text-[10px] text-outline uppercase">{k}</span>
                      <span className="font-code-sm text-code-sm text-on-surface truncate font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
                {ev.explorerUrl && (
                  <a href={ev.explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="self-start flex items-center gap-1 text-[12px] text-[#E08A3E] hover:underline font-medium">
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    View on Stellar Explorer
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verdict */}
      <VerdictBanner record={verification} onSendForCorrection={scrollToRemediation} />

      {/* Telegram */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2C1710] border border-[#4A2B1D] flex items-center justify-center text-[#E08A3E] shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <p className="text-[13px] text-on-surface-variant">
            Monitor this verification in Telegram:{" "}
            <code className="text-[#E08A3E] font-mono">/status {verification.displayId}</code>
          </p>
        </div>
        <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#21110B] border border-[#4A2B1D] text-[13px] font-semibold text-[#E08A3E] hover:bg-[#2C1710] transition-colors flex items-center gap-1.5">
          Open Telegram
          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
      </div>

      {/* Remediation */}
      {verification.status !== "PASSED" && (
        <RemediationPanel
          record={verification}
          onResubmit={async (patch) => { await resubmit(patch); }}
          isResubmitting={isResubmitting}
        />
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-xl border-t border-white/10 z-30 flex items-center gap-2 shadow-2xl">
        <Link to={`/verify/${verification.id}/evidence`} className="flex-1">
          <Button variant="secondary" size="md" className="w-full justify-center min-h-[44px]" icon={<span className="material-symbols-outlined text-[18px]">fingerprint</span>}>
            Evidence
          </Button>
        </Link>
        {verification.status !== "PASSED" ? (
          <Button variant="primary" size="md" onClick={scrollToRemediation} className="flex-1 justify-center min-h-[44px]" icon={<span className="material-symbols-outlined text-[18px]">build_circle</span>}>
            Fix & Resubmit
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="md"
            className="flex-1 justify-center min-h-[44px]"
            onClick={() => {
              const tx = latestAttempt?.stellarTxHash ?? "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";
              window.open(`https://stellar.expert/explorer/testnet/tx/${tx}`, "_blank");
            }}
            icon={<span className="material-symbols-outlined text-[18px]">verified</span>}
          >
            On Stellar
          </Button>
        )}
      </div>
    </div>
  );
};
