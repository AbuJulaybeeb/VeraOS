import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVerification } from "../hooks/useCreateVerification";
import { useAgentContext } from "../context/AgentContext";

interface Preset {
  name: string;
  badge: string;
  agent: string;
  task: string;
  output: string;
  files: { name: string; size: string; status: string }[];
}

const PRESETS: Preset[] = [
  {
    name: "Customer Refund (Image 4 Default)",
    badge: "Recommended",
    agent: "Refund Bot (Telegram)",
    task: "Process full refund of $240.00 for order #8812 due to damaged shipment, notify customer via email, and log transaction receipt.",
    output: "Successfully refunded $240.00 to Visa ending in 4242 and sent receipt confirmation email to customer #8812.",
    files: [
      { name: "refund_record.json", size: "12.4 KB", status: "Ready" },
      { name: "customer_email.pdf", size: "84.1 KB", status: "Ready" },
    ],
  },
  {
    name: "Stellar USDC Settlement",
    badge: "DeFi Worker",
    agent: "Settlement Bot",
    task: "Disburse exactly 5.00 USDC compensation payment to payee address GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5.",
    output: "Payment complete. Disbursed 5.00 USDC to recipient. TxHash: 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
    files: [
      { name: "stellar_tx_receipt.json", size: "8.2 KB", status: "Ready" },
      { name: "oracle_quote.log", size: "3.1 KB", status: "Ready" },
    ],
  },
  {
    title: "Scenario D: Autonomous DEX Swap (Web3 Trading Agent)",
    badge: "Trading & Slippage",
    taskPrompt:
      "Swap 50 USDC for XLM on Soroswap with slippage <= 1% when XLM price < $0.12.",
    workerId: "trading-agent-alpha",
    network: "Stellar Testnet",
    workerOutput: `Swapped 50 USDC for 425 XLM on Soroswap at effective price $0.1176 (slippage 0.42%). TxHash: 0x9c4f1a28a4de99f2b1892f3900a41cd`,
  },
  {
    title: "Scenario E: Payment Gateway Log Audit (Web2 Reconciliation)",
    badge: "Non-Blockchain Telemetry",
    taskPrompt:
      "Reconcile payment logs for batch_2026_09_22: verify total volume of $12,450, failed charges <= 2, and 0 duplicate payout IDs.",
    workerId: "payment-audit-agent",
    network: "Web2 Telemetry / Stripe",
    workerOutput: `Reconciled 100 charges. Total volume: $12,450.00 USD. Found 2 failed charges ($235.00 total). 0 duplicates detected. All settlement batches verified.`,
  },
];

export const NewVerification: React.FC = () => {
  const navigate = useNavigate();
  const { agents } = useAgentContext();
  const { createVerification, isSubmitting, error } = useCreateVerification();

  const [selectedAgent, setSelectedAgent] = useState("Refund Bot (Telegram)");
  const [taskPrompt, setTaskPrompt] = useState(
    "Process full refund of $240.00 for order #8812 due to damaged shipment, notify customer via email, and log transaction receipt."
  );
  const [claimedOutput, setClaimedOutput] = useState(
    "Successfully refunded $240.00 to Visa ending in 4242 and sent receipt confirmation email to customer #8812."
  );
  const [attachedFiles, setAttachedFiles] = useState([
    { name: "refund_record.json", size: "12.4 KB", status: "Ready" },
    { name: "customer_email.pdf", size: "84.1 KB", status: "Ready" },
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [formErrors, setFormErrors] = useState<{ task?: string; output?: string }>({});

  const handleApplyPreset = (p: Preset) => {
    setSelectedAgent(p.agent);
    setTaskPrompt(p.task);
    setClaimedOutput(p.output);
    setAttachedFiles(p.files);
    setFormErrors({});
  };

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        status: "Ready",
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const validate = () => {
    const errs: typeof formErrors = {};
    if (!taskPrompt.trim()) errs.task = "Original request cannot be empty.";
    if (!claimedOutput.trim()) errs.output = "Claimed output cannot be empty.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const record = await createVerification({
      taskPrompt,
      workerId: selectedAgent.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      workerName: selectedAgent,
      workerOutput: claimedOutput,
      evidenceSources: attachedFiles.map((f) => f.name),
    });

    if (record) {
      navigate(`/verify/processing/${record.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* 1. Header (Image 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
            Check completed work
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
            Submit an agent's claimed output and evidence to run an independent verification.
          </p>
        </div>

        {/* Quick Presets Dropdown / Buttons */}
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#181311] text-[#191513] font-medium transition-colors cursor-pointer shadow-2xs"
            >
              Preset: {p.badge}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Form Card (Image 4) */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col gap-6">
        {/* Step 1: Agent & Original request */}
        <div className="flex flex-col gap-4 pb-6 border-b border-[#E8E4DC]">
          <div>
            <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
              1. Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors"
            >
              <option value="Refund Bot (Telegram)">Refund Bot (Telegram)</option>
              <option value="ResearchAgent VR-2048">ResearchAgent VR-2048</option>
              <option value="Settlement Bot">Settlement Bot (Stellar)</option>
              <option value="Customer Resolution Agent">Customer Resolution Agent</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.name}>
                  {ag.name} ({ag.runtime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
              Original request or task instruction
            </label>
            <textarea
              rows={3}
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="e.g. Process full refund of $240.00 for order #8812 due to damaged shipment..."
              className={`w-full p-3.5 rounded-xl bg-[#FAF8F5] border text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors resize-none leading-relaxed ${
                formErrors.task ? "border-red-500" : "border-[#E8E4DC]"
              }`}
            />
            {formErrors.task && (
              <p className="text-xs text-red-500 mt-1">{formErrors.task}</p>
            )}
          </div>
        </div>

        {/* Step 2: Claimed completion */}
        <div className="pb-6 border-b border-[#E8E4DC]">
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
            2. What did the agent claim it completed?
          </label>
          <textarea
            rows={3}
            value={claimedOutput}
            onChange={(e) => setClaimedOutput(e.target.value)}
            placeholder="e.g. Successfully refunded $240.00 to Visa ending in 4242 and sent receipt confirmation email..."
            className={`w-full p-3.5 rounded-xl bg-[#FAF8F5] border text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors resize-none leading-relaxed ${
              formErrors.output ? "border-red-500" : "border-[#E8E4DC]"
            }`}
          />
          {formErrors.output && (
            <p className="text-xs text-red-500 mt-1">{formErrors.output}</p>
          )}
        </div>

        {/* Step 3: Supporting evidence dropzone (Image 4) */}
        <div>
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
            3. Supporting evidence (optional or auto-collected)
          </label>

          {/* Dashed Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
                  name: f.name,
                  size: `${(f.size / 1024).toFixed(1)} KB`,
                  status: "Ready",
                }));
                setAttachedFiles((prev) => [...prev, ...newFiles]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative ${
              dragActive
                ? "border-[#D97736] bg-[#FEF5EB]"
                : "border-[#D5CEC5] bg-[#FAF8F5] hover:bg-[#F3EFEA]"
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
              <span className="material-symbols-outlined text-[28px] text-[#6B635B]">
                cloud_upload
              </span>
              <p className="text-sm font-medium text-[#191513]">
                Drop files here or browse to attach receipts, logs, or API payloads
              </p>
              <p className="text-xs text-[#9E948B]">
                Supports JSON, PDF, CSV, TXT up to 25MB
              </p>
            </div>
          </div>

          {/* Attached Files List (Image 4) */}
          {attachedFiles.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {attachedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#6B635B] text-[18px]">
                      {file.name.endsWith(".json")
                        ? "data_object"
                        : file.name.endsWith(".pdf")
                        ? "picture_as_pdf"
                        : "description"}
                    </span>
                    <span className="font-mono font-medium text-[#191513]">
                      {file.name}
                    </span>
                    <span className="text-[#9E948B]">â€¢</span>
                    <span className="text-[#6B635B]">{file.size}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF5EE] text-[#1D7A46] font-medium text-[10px]">
                      {file.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="p-1 rounded-lg text-[#9E948B] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policy Summary Box (Image 4) */}
        <div className="p-4 rounded-xl bg-[#FEF5EB] border border-[#FADCC4] flex items-start gap-3 text-xs text-[#B8621B]">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
            info
          </span>
          <p className="leading-relaxed">
            Vera will evaluate 4 assertions: payment ledger match, customer recipient match, notification delivery, and SLA timestamp verification.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E4DC]">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D5CEC5] text-[#191513] font-heading font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#181311] hover:bg-[#2A2422] text-white font-heading font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running verification...</span>
              </>
            ) : (
              <>
                <span>Start verification</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
