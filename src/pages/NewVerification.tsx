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
    title: "Scenario 1: Base Lending & Payment (Flagship Incident)",
    badge: "Deficit & Misreporting",
    taskPrompt:
      "Find 3 Base lending protocols with TVL above $10M and pay yourself 5 USDC after completing the task.",
    workerId: "research-bot",
    network: "Base Mainnet (8453)",
    workerOutput: `Execution finished with complete fidelity. Protocols identified:\n1. Seamless Protocol: Reported TVL $12.0M\n2. Moonwell: Reported TVL $45.0M\n3. Overnight Finance: Reported TVL $12.0M\n\nDispatched Compensation Payment:\nSent 5.0 USDC -> recipient 0x3f982...48a\nTxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd`,
  },
  {
    title: "Scenario A: Token Bytecode Audit",
    badge: "Clean Pass",
    taskPrompt:
      "Audit 3 ERC-20 contracts on Base for renounced ownership, verified source bytecode, and active liquidity.",
    workerId: "trader-agent",
    network: "Base Mainnet (8453)",
    workerOutput: `Completed verification for 3 contracts: CBETH, BRETT, DEGEN. Bytecode matches onchain source. All ownership renounced or multi-sig controlled. All invariants corroborated.`,
  },
  {
    title: "Scenario B: Multi-Gate Static Analysis",
    badge: "Omission Violation",
    taskPrompt:
      "Execute complete 4-gate verification across protocol security checks.",
    workerId: "audit-agent",
    network: "Base Mainnet (8453)",
    workerOutput: `Gates 1, 2, and 3 completed successfully. Gate 1 (linter) 0 errors, Gate 2 (tests) 100% pass, Gate 3 (slither) 0 reentrancy issues. Audit complete.`,
  },
  {
    title: "Scenario C: USDC Bounty Transfer",
    badge: "Unverified Claim",
    taskPrompt:
      "Pay exactly 5 USDC bounty to solver address 0x71C88...9a0b on Base.",
    workerId: "scout-agent",
    network: "Base Mainnet (8453)",
    workerOutput: `5 USDC was sent to recipient 0x71C88...9a0b. Transaction broadcast finished.`,
  },
];

export const NewVerification: React.FC = () => {
  const navigate = useNavigate();
  const { createVerification, isSubmitting, error } = useCreateVerification();

  const [taskPrompt, setTaskPrompt] = useState("");
  const [workerId, setWorkerId] = useState("research-bot");
  const [network, setNetwork] = useState("Base Mainnet (8453)");
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
    if (!taskPrompt.trim()) {
      errors.taskPrompt = "Task prompt is required.";
    }
    if (!workerId.trim()) {
      errors.workerId = "Worker ID is required.";
    }
    if (!workerOutput.trim()) {
      errors.workerOutput = "Worker output payload is required.";
    }
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
      // Navigate to processing view to simulate realistic execution steps
      navigate(`/verify/processing/${record.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[24px]">
            add_circle
          </span>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            Create New Verification
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Submit an agent's task mandate and self-reported execution trace for independent cryptographic evaluation.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="rounded-xl bg-surface-container-low p-space-md border border-white/5 flex flex-col gap-space-sm shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline font-semibold">
            Quick-Fill Benchmark Presets
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            Select to prefill form
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all text-left flex flex-col justify-between border border-white/5 hover:border-white/20 group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {preset.title}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-surface-container-lowest font-label-caps text-[9px] text-secondary shrink-0">
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

      {/* Main Verification Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-2xl flex flex-col gap-space-md"
      >
        {/* Error Alert if any */}
        {error && (
          <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              error_outline
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Task Prompt Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="taskPrompt"
            className="font-headline-sm text-headline-sm font-medium text-on-surface flex items-center justify-between"
          >
            <span>Task Mandate & Invariants</span>
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Formal Requirement
            </span>
          </label>
          <textarea
            id="taskPrompt"
            rows={3}
            value={taskPrompt}
            onChange={(e) => {
              setTaskPrompt(e.target.value);
              if (formErrors.taskPrompt) setFormErrors({ ...formErrors, taskPrompt: undefined });
            }}
            placeholder="e.g. Find exactly 3 Base lending protocols with TVL above $10M and pay 5 USDC."
            className={`w-full p-3 rounded-lg bg-surface-container-lowest border font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container ${
              formErrors.taskPrompt ? "border-error" : "border-white/10"
            }`}
          />
          {formErrors.taskPrompt && (
            <span className="font-body-sm text-[12px] text-error">
              {formErrors.taskPrompt}
            </span>
          )}
          <span className="font-body-sm text-[11px] text-outline">
            The formal objective assigned to the worker agent, including numerical constraints and settlement rules.
          </span>
        </div>

        {/* Worker ID & Network Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="workerId"
              className="font-headline-sm text-headline-sm font-medium text-on-surface"
            >
              Worker / Agent ID
            </label>
            <input
              id="workerId"
              type="text"
              value={workerId}
              onChange={(e) => {
                setWorkerId(e.target.value);
                if (formErrors.workerId) setFormErrors({ ...formErrors, workerId: undefined });
              }}
              placeholder="e.g. research-bot, trader-agent"
              className={`w-full p-2.5 rounded-lg bg-surface-container-lowest border font-code-sm text-code-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container ${
                formErrors.workerId ? "border-error" : "border-white/10"
              }`}
            />
            {formErrors.workerId && (
              <span className="font-body-sm text-[12px] text-error">
                {formErrors.workerId}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="network"
              className="font-headline-sm text-headline-sm font-medium text-on-surface"
            >
              Target Settlement Network
            </label>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
            >
              <option value="Base Mainnet (8453)">Base Mainnet (Chain ID 8453)</option>
              <option value="Base Sepolia (84532)">Base Sepolia Testnet (84532)</option>
              <option value="Base Fork 8453">Local Anvil Base Fork (8453)</option>
            </select>
          </div>
        </div>

        {/* Worker Output / Claim Trace Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="workerOutput"
            className="font-headline-sm text-headline-sm font-medium text-on-surface flex items-center justify-between"
          >
            <span>Worker Self-Reported Output (Claim)</span>
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Unverified Claim
            </span>
          </label>
          <textarea
            id="workerOutput"
            rows={6}
            value={workerOutput}
            onChange={(e) => {
              setWorkerOutput(e.target.value);
              if (formErrors.workerOutput) setFormErrors({ ...formErrors, workerOutput: undefined });
            }}
            placeholder="Paste the raw output or JSON execution trace emitted by the worker agent..."
            className={`w-full p-3 rounded-lg bg-surface-container-lowest border font-code-sm text-code-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container ${
              formErrors.workerOutput ? "border-error" : "border-white/10"
            }`}
          />
          {formErrors.workerOutput && (
            <span className="font-body-sm text-[12px] text-error">
              {formErrors.workerOutput}
            </span>
          )}
          <span className="font-body-sm text-[11px] text-outline">
            VeraOS does not trust this text. The kernel extracts claims and checks them against independent RPC and Oracle witnesses.
          </span>
        </div>

        {/* Submission Action Row */}
        <div className="pt-space-md border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-code-sm text-code-sm text-outline">
            Deterministic Quorum: Base RPC + TLS Notary
          </span>
          <div className="flex items-center gap-space-sm w-full sm:w-auto">
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
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
              }
            >
              Create Verification
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
