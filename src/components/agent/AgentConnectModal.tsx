import React, { useState, useEffect } from "react";
import { useAgentContext } from "../../context/AgentContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { GuardrailMode } from "../../types/agent";

interface FrameworkOption {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  defaultModel: string;
  runtime: string;
  icon: string;
  defaultEndpoint: string;
}

const FRAMEWORKS: FrameworkOption[] = [
  {
    id: "eliza",
    name: "ElizaOS (Stellar Agent)",
    badge: "POPULAR ON STELLAR",
    badgeColor: "bg-[#E08A3E]/20 text-[#E08A3E] border border-[#E08A3E]/40",
    description: "Autonomous DeFi, social & payment agents natively orchestrating Stellar accounts.",
    defaultModel: "gpt-4o",
    runtime: "ElizaOS Stellar Runtime v1.2",
    icon: "bolt",
    defaultEndpoint: "agent://stellar-eliza-runtime",
  },
  {
    id: "langchain",
    name: "LangChain / LangGraph",
    description: "Stateful agentic workflows, multi-actor graphs, and tool execution loops.",
    defaultModel: "gpt-4o-mini",
    runtime: "LangChain Agentic Runtime v0.3",
    icon: "account_tree",
    defaultEndpoint: "https://agent.acme.ai/langchain/rpc",
  },
  {
    id: "crewai",
    name: "CrewAI Swarm",
    description: "Multi-agent collaborative swarms with specialized roles and task handoffs.",
    defaultModel: "claude-3.5-sonnet",
    runtime: "CrewAI Multi-Worker Swarm v2.0",
    icon: "groups",
    defaultEndpoint: "https://agent.acme.ai/crew/rpc",
  },
  {
    id: "autogpt",
    name: "AutoGPT / AutoGen",
    description: "Goal-oriented autonomous loops with automated subtask planning.",
    defaultModel: "gpt-4o",
    runtime: "AutoGPT Execution Kernel v1.0",
    icon: "psychology",
    defaultEndpoint: "https://agent.acme.ai/autogpt/rpc",
  },
  {
    id: "python_sdk",
    name: "Python Agent SDK",
    description: "Direct integration for local or server-side agents using @veraos/python.",
    defaultModel: "gpt-4o",
    runtime: "VeraOS Python SDK Worker",
    icon: "terminal",
    defaultEndpoint: "agent://local-python-runtime",
  },
  {
    id: "custom_rest",
    name: "Custom Webhook / REST",
    description: "Connect any autonomous agent exposing a standard JSON-RPC or HTTP webhook.",
    defaultModel: "custom-llm",
    runtime: "Custom HTTP JSON-RPC Agent",
    icon: "api",
    defaultEndpoint: "https://agent.acme.ai/remediate",
  },
];

export const AgentConnectModal: React.FC = () => {
  const {
    isConnectModalOpen,
    closeConnectModal,
    preselectedAgent,
    connectAgentWithConsent,
    testHandshake,
  } = useAgentContext();

  const handleNavigate = (path: string) => {
    closeConnectModal();
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  const [step, setStep] = useState<"select" | "consent" | "handshake" | "connected">("select");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkOption>(FRAMEWORKS[0]);
  const [agentName, setAgentName] = useState("SentinelBot");
  const [endpoint, setEndpoint] = useState(FRAMEWORKS[0].defaultEndpoint);
  const [guardrailMode, setGuardrailMode] = useState<GuardrailMode>("strict");
  const [consentApproved, setConsentApproved] = useState(true);
  const [handshakePhase, setHandshakePhase] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latencyMs: number;
    network: string;
    message: string;
  } | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [connectedAgentData, setConnectedAgentData] = useState<{
    id: string;
    name: string;
    runtime: string;
    apiKey: string;
  } | null>(null);

  // Initialize from preselectedAgent if provided
  useEffect(() => {
    if (preselectedAgent) {
      if (preselectedAgent.name) setAgentName(preselectedAgent.name);
      if (preselectedAgent.endpoint) setEndpoint(preselectedAgent.endpoint);
      const matched = FRAMEWORKS.find(
        (f) =>
          f.name.toLowerCase().includes((preselectedAgent.runtime || "").toLowerCase()) ||
          f.id === preselectedAgent.id
      );
      if (matched) {
        setSelectedFramework(matched);
      }
      setStep("consent");
    } else {
      setStep("select");
    }
    setPingResult(null);
    setHandshakePhase(0);
  }, [preselectedAgent, isConnectModalOpen]);

  if (!isConnectModalOpen) return null;

  const handleSelectFramework = (framework: FrameworkOption) => {
    setSelectedFramework(framework);
    setEndpoint(framework.defaultEndpoint);
    if (!preselectedAgent) {
      setAgentName(
        framework.id === "eliza"
          ? "StellarEliza-01"
          : framework.id === "langchain"
          ? "LangAgent-Prime"
          : framework.id === "crewai"
          ? "CrewCommander"
          : "AutonomousWorker"
      );
    }
    setStep("consent");
  };

  const handleAuthorizeAndConnect = async () => {
    if (!consentApproved) return;
    setIsSubmitting(true);
    setStep("handshake");
    setHandshakePhase(1);

    try {
      setHandshakePhase(2);
      const agent = await connectAgentWithConsent({
        id: preselectedAgent?.id,
        name: agentName,
        endpoint,
        runtime: selectedFramework.runtime,
        model: selectedFramework.defaultModel,
        capabilities: ["task_execution", "stellar_payment", "remediation_loop"],
        permissions: [
          "read_tasks",
          "stellar_attestation",
          "remediation_dispatch",
        ],
        guardrailMode,
        stellarAccount: "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
      });

      setHandshakePhase(3);
      // Run live real-time Stellar RPC verification probe immediately
      const probeRes = await testHandshake(agent.id);
      setPingResult({
        latencyMs: probeRes.latencyMs,
        network: probeRes.network,
        message: probeRes.message,
      });

      setConnectedAgentData({
        id: agent.id,
        name: agent.name,
        runtime: agent.runtime,
        apiKey: agent.apiKeySnippet,
      });

      setHandshakePhase(4);
      setStep("connected");
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
      setStep("consent");
    }
  };

  const handlePingTest = async () => {
    if (!connectedAgentData) return;
    setIsPinging(true);
    try {
      const res = await testHandshake(connectedAgentData.id);
      setPingResult({
        latencyMs: res.latencyMs,
        network: res.network,
        message: res.message,
      });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeConnectModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#1D110B] border border-[#4A2B1D] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-space-md sm:p-space-lg flex flex-col gap-space-md z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2C1710] border border-[#E08A3E]/30 flex items-center justify-center text-[#E08A3E] shadow-[0_0_12px_rgba(224,138,62,0.25)]">
              <span className="material-symbols-outlined text-[20px]">
                {step === "connected" ? "verified" : "hub"}
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-[#FFF8F0]">
                {step === "select" && "Connect AI Agent"}
                {step === "consent" && "Agent Authorization Request"}
                {step === "handshake" && "Connecting to Agent..."}
                {step === "connected" && "Agent Connected"}
              </h2>
              <p className="text-xs text-[#B9A99B]">
                {step === "select" && "Connect your autonomous agent just like connecting a crypto wallet."}
                {step === "consent" && "VeraOS SaaS requests your consent before connecting."}
                {step === "handshake" && "Establishing cryptographic handshake on Stellar Testnet..."}
                {step === "connected" && "Agent is hooked into the VeraOS verification kernel."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeConnectModal}
            className="p-1.5 rounded-lg text-[#B9A99B] hover:text-[#FFF8F0] hover:bg-[#2C1710] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Step Progress Pill */}
        <div className="flex items-center justify-between text-[11px] font-code-sm text-[#B9A99B] bg-[#160C08] p-1.5 rounded-lg border border-white/5">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              step === "select"
                ? "bg-[#C96A2B] text-white font-semibold"
                : "text-[#B9A99B]"
            }`}
          >
            1. Select Runtime
          </span>
          <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              step === "consent" || step === "handshake"
                ? "bg-[#C96A2B] text-white font-semibold"
                : "text-[#B9A99B]"
            }`}
          >
            2. Consent & Scopes
          </span>
          <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              step === "connected"
                ? "bg-[#22c55e]/20 text-[#4ade80] font-semibold border border-[#22c55e]/40"
                : "text-[#B9A99B]"
            }`}
          >
            3. Connected
          </span>
        </div>

        {/* STEP 1: SELECT FRAMEWORK */}
        {step === "select" && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium text-[#F3E5D5] uppercase tracking-wider">
              Choose your Agent Framework:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => handleSelectFramework(fw)}
                  className="p-3 rounded-xl bg-[#160C08] hover:bg-[#2C1710] border border-white/5 hover:border-[#E08A3E]/40 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer shadow-sm hover:shadow-[0_4px_16px_rgba(201,106,43,0.15)]"
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#21110B] group-hover:bg-[#C96A2B] text-[#E08A3E] group-hover:text-white flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          {fw.icon}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-[#FFF8F0]">
                        {fw.name}
                      </span>
                    </div>
                  </div>

                  {fw.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase self-start ${fw.badgeColor}`}>
                      {fw.badge}
                    </span>
                  )}

                  <p className="text-[11px] text-[#B9A99B] line-clamp-2 leading-relaxed">
                    {fw.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: USER CONSENT & PERMISSIONS SCREEN */}
        {step === "consent" && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* SaaS Connection Card */}
            <div className="p-3.5 rounded-xl bg-[#160C08] border border-[#E08A3E]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2C1710] text-[#E08A3E] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedFramework.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-[#FFF8F0]">
                    {selectedFramework.name}
                  </h4>
                  <span className="text-[10px] text-[#B9A99B] font-code-sm">
                    {selectedFramework.runtime}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("select")}
                className="text-[11px] text-[#E08A3E] hover:underline font-medium"
              >
                Change
              </button>
            </div>

            {/* Agent Name Configuration */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#F3E5D5] font-medium flex items-center justify-between">
                <span>Agent Identifier:</span>
                <span className="text-[10px] text-[#B9A99B]">Editable label</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. SentinelBot"
                className="w-full p-2.5 rounded-lg bg-[#160C08] border border-white/10 text-xs text-[#FFF8F0] focus:outline-none focus:border-[#E08A3E]"
              />
            </div>

            {/* Explicit Consent & Permission Breakdown */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#160C08] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E08A3E]">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Permissions Requested by VeraOS SaaS:</span>
              </div>

              <div className="flex flex-col gap-2 text-[11px] text-[#B9A99B] mt-1">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4ade80] text-[15px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-medium text-[#FFF8F0]">Autonomous Task Verification: </span>
                    Inspect task claims, deliverables, and execution traces against defined invariants.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4ade80] text-[15px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-medium text-[#FFF8F0]">Stellar Settlement Auditing: </span>
                    Query Stellar Soroban RPC & Horizon to independently corroborate onchain transfers and asset amounts.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#4ade80] text-[15px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-medium text-[#FFF8F0]">Remediation Callbacks: </span>
                    Dispatch deterministic error envelopes and correction directives when verification fails.
                  </div>
                </div>
              </div>

              {/* Zero-Custody Guarantee */}
              <div className="mt-1 pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-[#A6998C]">
                <span className="material-symbols-outlined text-[14px] text-[#E08A3E]">lock</span>
                <span>Non-Custodial Guarantee: VeraOS never accesses private keys or funds.</span>
              </div>
            </div>

            {/* Verification Guardrail Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#160C08] border border-white/5 text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-[#FFF8F0]">Guardrail Policy:</span>
                <span className="text-[10px] text-[#B9A99B]">
                  {guardrailMode === "strict"
                    ? "Strict: Block execution until Stellar transaction verified"
                    : "Standard: Log verification receipts without blocking"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setGuardrailMode((prev) => (prev === "strict" ? "standard" : "strict"))}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  guardrailMode === "strict"
                    ? "bg-[#C96A2B] text-white"
                    : "bg-[#2C1710] text-[#B9A99B]"
                }`}
              >
                {guardrailMode === "strict" ? "Strict Guardrail" : "Standard"}
              </button>
            </div>

            {/* Explicit User Consent Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentApproved}
                onChange={(e) => setConsentApproved(e.target.checked)}
                className="mt-0.5 accent-[#C96A2B]"
              />
              <span className="text-[11px] text-[#F3E5D5] leading-relaxed">
                I consent to linking this agent to VeraOS SaaS and authorize deterministic verification on Stellar Testnet.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep("select")}
                className="flex-1"
              >
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!consentApproved || !agentName.trim() || isSubmitting}
                loading={isSubmitting}
                onClick={handleAuthorizeAndConnect}
                icon={
                  <span className="material-symbols-outlined text-[18px]">
                    verified_user
                  </span>
                }
                className="flex-[2]"
              >
                Authorize & Connect Agent
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: HANDSHAKE ANIMATION */}
        {step === "handshake" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-200">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-[#E08A3E]/20 animate-ping" />
              <span className="w-12 h-12 rounded-full border-2 border-[#C96A2B] border-t-transparent animate-spin" />
              <span className="material-symbols-outlined text-[#E08A3E] text-[24px]">
                sync
              </span>
            </div>

            <div className="flex flex-col gap-1 max-w-xs">
              <span className="font-semibold text-sm text-[#FFF8F0]">
                {handshakePhase === 1 && "1/3 Establishing agent handshake..."}
                {handshakePhase === 2 && "2/3 Registering permission authorization..."}
                {handshakePhase === 3 && "3/3 Linking Stellar attestation anchor..."}
                {handshakePhase === 4 && "Handshake verified!"}
              </span>
              <span className="text-xs text-[#B9A99B]">
                Connecting {agentName} to VeraOS verification engine
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: CONNECTED STATE */}
        {step === "connected" && connectedAgentData && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Success Card */}
            <div className="p-4 rounded-xl bg-[#14291e]/80 border border-[#22c55e]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="font-bold text-xs text-[#4ade80] uppercase tracking-wider">
                    Agent Connected & Secured
                  </span>
                </div>
                <Badge variant="passed" dot>
                  ACTIVE
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-code-sm bg-[#0d1c14]/70 p-2.5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#86efac]/70 uppercase">Agent Name</span>
                  <span className="font-bold text-white truncate">{connectedAgentData.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#86efac]/70 uppercase">Network</span>
                  <span className="font-bold text-white">Stellar Testnet</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#86efac]/70 uppercase">Runtime</span>
                  <span className="text-white truncate">{connectedAgentData.runtime}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#86efac]/70 uppercase">Credentials</span>
                  <span className="text-[#86efac] truncate">{connectedAgentData.apiKey}</span>
                </div>
              </div>
            </div>

            {/* Test Verification Ping Button */}
            <div className="p-3 rounded-xl bg-[#160C08] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F3E5D5]">
                  Test Live Verification Handshake:
                </span>
                <button
                  type="button"
                  onClick={handlePingTest}
                  disabled={isPinging}
                  className="px-3 py-1 rounded-lg bg-[#2C1710] hover:bg-[#C96A2B] text-[#E08A3E] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isPinging ? "sync" : "bolt"}
                  </span>
                  <span>{isPinging ? "Pinging..." : "Test Ping"}</span>
                </button>
              </div>

              {pingResult && (
                <div className="p-2.5 rounded-lg bg-[#1D110B] border border-[#22c55e]/30 text-[11px] font-code-sm text-[#4ade80] flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Live Stellar Invariant Verified
                    </span>
                    <span className="font-bold text-white bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {pingResult.latencyMs}ms
                    </span>
                  </div>
                  <span className="text-[10px] text-[#B9A99B] leading-tight">
                    {pingResult.message || "Live Stellar Testnet Horizon probe verified"}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleNavigate("/agents")}
                className="flex-1"
              >
                View in Registry
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleNavigate("/verify/new")}
                icon={
                  <span className="material-symbols-outlined text-[18px]">
                    add_circle
                  </span>
                }
                className="flex-1"
              >
                Verify a Task
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
