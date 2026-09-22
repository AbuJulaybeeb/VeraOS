import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVerification } from "../hooks/useCreateVerification";
import { Button } from "../components/ui/Button";

interface PresetScenario {
  title: string;
  badge: string;
  taskPrompt: string;
  workerId: string;
  workerOutput: string;
  network: string;
}

const PRESETS: PresetScenario[] = [
  {
    title: "Stellar Protocol Research + Payment",
    badge: "Amount mismatch",
    taskPrompt:
      "Find 3 Soroban lending protocols on Stellar Testnet with TVL above $10M and pay yourself 5 USDC after completing the task.",
    workerId: "research-bot",
    network: "Stellar Testnet",
    workerOutput: `Execution finished. Protocols identified:\n1. Blend Capital: TVL $18.0M\n2. Aquarius: TVL $12.0M\n3. YieldBlox: TVL $15.0M\n\nCompensation sent:\n5.0 USDC -> GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5\nTxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd`,
  },
  {
    title: "Token Contract Audit",
    badge: "Clean pass",
    taskPrompt:
      "Audit 3 Soroban token contracts on Stellar Testnet for verified source bytecode and active liquidity.",
    workerId: "trader-agent",
    network: "Stellar Testnet",
    workerOutput: `Completed audit for 3 contracts: XLM, USDC, AQUA. Bytecode matches onchain source. All checks passed.`,
  },
  {
    title: "Multi-Gate Security Check",
    badge: "Step omitted",
    taskPrompt:
      "Execute a 4-gate verification across protocol security checks.",
    workerId: "audit-agent",
    network: "Stellar Testnet",
    workerOutput: `Gates 1, 2, and 3 completed. Gate 1 (linter) 0 errors. Gate 2 (tests) 100% pass. Gate 3 (static) 0 issues. Audit complete.`,
  },
  {
    title: "USDC Bounty Transfer",
    badge: "Unverified claim",
    taskPrompt:
      "Pay exactly 5 USDC bounty to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 on Stellar Testnet.",
    workerId: "scout-agent",
    network: "Stellar Testnet",
    workerOutput: `5 USDC was sent to recipient GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5. Transaction broadcast complete.`,
  },
];

export const NewVerification: React.FC = () => {
  const navigate = useNavigate();
  const { createVerification, isSubmitting, error } = useCreateVerification();

  const [taskPrompt, setTaskPrompt] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [network, setNetwork] = useState("Stellar Testnet");
  const [workerOutput, setWorkerOutput] = useState("");
  const [formErrors, setFormErrors] = useState<{
    taskPrompt?: string;
    workerId?: string;
    workerOutput?: string;
  }>({});

  const handleApplyPreset = (preset: PresetScenario) => {
    setTaskPrompt(preset.taskPrompt);
    setWorkerId(preset.workerId);
    setNetwork(preset.network);
    setWorkerOutput(preset.workerOutput);
    setFormErrors({});
  };

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!taskPrompt.trim()) errors.taskPrompt = "Task is required.";
    if (!workerId.trim()) errors.workerId = "Agent ID is required.";
    if (!workerOutput.trim()) errors.workerOutput = "Agent output is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const record = await createVerification({
      taskPrompt,
      workerId,
      workerOutput,
      network,
    });

    if (record) {
      navigate(`/verify/processing/${record.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          New Verification
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Submit an agent's task and its reported output. VeraOS will independently check whether the work was actually done.
        </p>
      </div>

      {/* Demo presets */}
      <div className="rounded-xl bg-surface-container-low p-space-md border border-white/5 flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-semibold">
            Demo scenarios
          </span>
          <span className="font-body-sm text-body-sm text-outline">Select to prefill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all text-left flex flex-col gap-1 border border-white/5 hover:border-white/20 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {preset.title}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest font-label-caps text-[9px] text-secondary shrink-0 uppercase">
                  {preset.badge}
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-outline line-clamp-1">
                {preset.taskPrompt}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-2xl flex flex-col gap-space-md"
      >
        {error && (
          <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {/* Task */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="taskPrompt"
            className="font-headline-sm text-headline-sm font-semibold text-on-surface"
          >
            Task
          </label>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
            What should the agent accomplish?
          </p>
          <textarea
            id="taskPrompt"
            rows={3}
            value={taskPrompt}
            onChange={(e) => {
              setTaskPrompt(e.target.value);
              if (formErrors.taskPrompt) setFormErrors({ ...formErrors, taskPrompt: undefined });
            }}
            placeholder='e.g. "Send 5 USDC to the specified Stellar address and provide proof of payment."'
            className={`w-full p-3 rounded-lg bg-surface-container-lowest border font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container resize-none ${
              formErrors.taskPrompt ? "border-error" : "border-white/10"
            }`}
          />
          {formErrors.taskPrompt && (
            <span className="font-body-sm text-[12px] text-error">{formErrors.taskPrompt}</span>
          )}
        </div>

        {/* Agent + Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="workerId"
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
            >
              Agent
            </label>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
              Worker ID or name
            </p>
            <input
              id="workerId"
              type="text"
              value={workerId}
              onChange={(e) => {
                setWorkerId(e.target.value);
                if (formErrors.workerId) setFormErrors({ ...formErrors, workerId: undefined });
              }}
              placeholder="e.g. research-bot"
              className={`w-full p-2.5 rounded-lg bg-surface-container-lowest border font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container ${
                formErrors.workerId ? "border-error" : "border-white/10"
              }`}
            />
            {formErrors.workerId && (
              <span className="font-body-sm text-[12px] text-error">{formErrors.workerId}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="network"
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
            >
              Network
            </label>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
              Evidence source
            </p>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            >
              <option value="Stellar Testnet">Stellar Testnet</option>
              <option value="Stellar Mainnet">Stellar Mainnet</option>
              <option value="Local Standalone Soroban">Local Soroban RPC</option>
            </select>
          </div>
        </div>

        {/* Agent output */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="workerOutput"
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
            >
              Agent output
            </label>
            <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps uppercase text-outline">
              Worker claim — unverified
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
            What did the agent report?
          </p>
          <textarea
            id="workerOutput"
            rows={6}
            value={workerOutput}
            onChange={(e) => {
              setWorkerOutput(e.target.value);
              if (formErrors.workerOutput) setFormErrors({ ...formErrors, workerOutput: undefined });
            }}
            placeholder="Paste the agent's output or execution report here..."
            className={`w-full p-3 rounded-lg bg-surface-container-lowest border font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container resize-none ${
              formErrors.workerOutput ? "border-error" : "border-white/10"
            }`}
          />
          {formErrors.workerOutput && (
            <span className="font-body-sm text-[12px] text-error">{formErrors.workerOutput}</span>
          )}
          <span className="font-body-sm text-[11px] text-outline">
            VeraOS does not trust this text. It extracts claims and checks them against independent on-chain and oracle evidence.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-space-md border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-space-sm">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={<span className="material-symbols-outlined text-[18px]">verified</span>}
          >
            Verify work
          </Button>
        </div>
      </form>
    </div>
  );
};
