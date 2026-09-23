import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVerification } from "../hooks/useCreateVerification";
import { useAgentContext } from "../context/AgentContext";
import { Button } from "../components/ui/Button";

interface Preset {
  name: string;
  badge: string;
  task: string;
  agent: string;
  output: string;
  evidence?: string;
}

const PRESETS: Preset[] = [
  {
    name: "Customer Refund & Resolution",
    badge: "Pass Case",
    agent: "Customer Resolution Agent",
    task: "Issue a full refund of $148.20 for order #AC-19482, notify the customer via email, and record the reason as duplicate shipment.",
    output: "Issued a $148.20 refund, emailed the customer, and added a duplicate-shipment note to the order.",
    evidence: "refund_record.json (RF-88124), customer_email.pdf",
  },
  {
    name: "Stellar USDC Settlement",
    badge: "Deficit Failure",
    agent: "Settlement Bot",
    task: "Disburse exactly 5.00 USDC compensation payment to payee address GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5.",
    output: "Payment complete. Disbursed 5.00 USDC to recipient. TxHash: 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
    evidence: "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
  },
];

export const NewVerification: React.FC = () => {
  const navigate = useNavigate();
  const { agents } = useAgentContext();
  const { createVerification, isSubmitting, error } = useCreateVerification();

  const [task, setTask] = useState("");
  const [agent, setAgent] = useState("Customer Resolution Agent");
  const [agentOutput, setAgentOutput] = useState("");
  const [evidence, setEvidence] = useState("");
  const [formErrors, setFormErrors] = useState<{
    task?: string;
    agent?: string;
    agentOutput?: string;
  }>({});

  const handleApplyPreset = (p: Preset) => {
    setTask(p.task);
    setAgent(p.agent);
    setAgentOutput(p.output);
    setEvidence(p.evidence || "");
    setFormErrors({});
  };

  const validate = () => {
    const errs: typeof formErrors = {};
    if (!task.trim()) errs.task = "Please specify what the agent was supposed to do.";
    if (!agent.trim()) errs.agent = "Please specify which agent performed the task.";
    if (!agentOutput.trim()) errs.agentOutput = "Please specify what the agent claimed it completed.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const record = await createVerification({
      taskPrompt: task,
      workerId: agent.toLowerCase().replace(/\s+/g, "-"),
      workerName: agent,
      workerOutput: agentOutput,
      evidenceSources: evidence ? [evidence] : undefined,
    });

    if (record) {
      navigate(`/verify/processing/${record.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#FFF8F0]">
          New Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#B9A99B] mt-1">
          Tell VeraOS what the agent was supposed to do and what it claimed to complete.
        </p>
      </div>

      {/* Benchmark Presets Bar */}
      <div className="p-4 rounded-2xl bg-[#21110B] border border-[#4A2B1D] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase font-bold text-[#E08A3E]">
            Quick Presets
          </span>
          <span className="text-[#B9A99B]">Click to pre-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 rounded-xl bg-[#160C08] hover:bg-[#2C1710] border border-[#4A2B1D] transition-colors text-left flex flex-col gap-1 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-xs text-[#FFF8F0]">
                  {p.name}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  p.badge.includes("Pass")
                    ? "bg-[#142818] text-[#4ade80] border border-[#1b4324]"
                    : "bg-[#2a1210] text-[#f87171] border border-[#5c1e19]"
                }`}>
                  {p.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#B9A99B] line-clamp-1">
                {p.task}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Verification Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-[#21110B] border border-[#4A2B1D] p-6 sm:p-8 flex flex-col gap-5 shadow-xl"
      >
        {error && (
          <div className="p-3.5 rounded-xl bg-[#2a1210] border border-[#5c1e19] text-xs text-[#fca5a5] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {/* Field 1: Task */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task" className="font-heading font-semibold text-sm text-[#FFF8F0]">
            Task
          </label>
          <span className="text-xs text-[#B9A99B]">
            What was the agent supposed to do?
          </span>
          <textarea
            id="task"
            rows={3}
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
              if (formErrors.task) setFormErrors({ ...formErrors, task: undefined });
            }}
            placeholder="e.g. Issue a full refund of $148.20 for order #AC-19482, notify the customer, and record the reason as duplicate shipment."
            className={`w-full p-3.5 rounded-xl bg-[#160C08] border text-xs sm:text-sm text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E] ${
              formErrors.task ? "border-[#f87171]" : "border-[#4A2B1D]"
            }`}
          />
          {formErrors.task && (
            <span className="text-xs text-[#f87171]">{formErrors.task}</span>
          )}
        </div>

        {/* Field 2: Agent */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="agent" className="font-heading font-semibold text-sm text-[#FFF8F0]">
            Agent
          </label>
          <span className="text-xs text-[#B9A99B]">
            Which agent performed the task?
          </span>
          <input
            id="agent"
            type="text"
            value={agent}
            onChange={(e) => {
              setAgent(e.target.value);
              if (formErrors.agent) setFormErrors({ ...formErrors, agent: undefined });
            }}
            placeholder="e.g. Customer Resolution Agent, Settlement Bot, Research Agent"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#160C08] border text-xs sm:text-sm text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E] ${
              formErrors.agent ? "border-[#f87171]" : "border-[#4A2B1D]"
            }`}
          />
          {agents.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-[#B9A99B] uppercase font-mono">Connected:</span>
              {agents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAgent(a.name);
                    if (formErrors.agent) setFormErrors({ ...formErrors, agent: undefined });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                    agent === a.name
                      ? "bg-[#C96A2B] text-white border-[#E08A3E]"
                      : "bg-[#160C08] text-[#B9A99B] border-[#4A2B1D] hover:text-[#FFF8F0]"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          )}
          {formErrors.agent && (
            <span className="text-xs text-[#f87171]">{formErrors.agent}</span>
          )}
        </div>

        {/* Field 3: Agent Output */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="agentOutput" className="font-heading font-semibold text-sm text-[#FFF8F0]">
            Agent output
          </label>
          <span className="text-xs text-[#B9A99B]">
            What did the agent say it completed?
          </span>
          <textarea
            id="agentOutput"
            rows={4}
            value={agentOutput}
            onChange={(e) => {
              setAgentOutput(e.target.value);
              if (formErrors.agentOutput) setFormErrors({ ...formErrors, agentOutput: undefined });
            }}
            placeholder="e.g. Issued a $148.20 refund, emailed the customer, and added a duplicate-shipment note to the order."
            className={`w-full p-3.5 rounded-xl bg-[#160C08] border text-xs sm:text-sm text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E] ${
              formErrors.agentOutput ? "border-[#f87171]" : "border-[#4A2B1D]"
            }`}
          />
          {formErrors.agentOutput && (
            <span className="text-xs text-[#f87171]">{formErrors.agentOutput}</span>
          )}
        </div>

        {/* Field 4: Optional Evidence */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="evidence" className="font-heading font-semibold text-sm text-[#FFF8F0]">
            Supporting evidence <span className="text-[#B9A99B] font-normal text-xs">(optional)</span>
          </label>
          <span className="text-xs text-[#B9A99B]">
            Add transaction hash, document link, or file reference if available.
          </span>
          <input
            id="evidence"
            type="text"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="e.g. refund_record.json, 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#160C08] border border-[#4A2B1D] font-mono text-xs text-[#FFF8F0] placeholder-[#B9A99B]/40 focus:outline-none focus:ring-1 focus:ring-[#E08A3E]"
          />
        </div>

        {/* Form Action Row */}
        <div className="pt-4 border-t border-[#4A2B1D] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-xs text-[#B9A99B] hover:text-[#FFF8F0] cursor-pointer"
          >
            Cancel
          </button>

          {/* Primary CTA: Verify work */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            icon={<span className="material-symbols-outlined text-[18px]">verified</span>}
            className="w-full sm:w-auto px-8"
          >
            Verify work
          </Button>
        </div>
      </form>
    </div>
  );
};
