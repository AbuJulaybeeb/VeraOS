import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAgentContext } from "../context/AgentContext";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CodeBlock } from "../components/ui/CodeBlock";

const RUNTIMES = [
  {
    id: "eliza",
    name: "ElizaOS (Stellar Agent)",
    badge: "POPULAR ON STELLAR",
    badgeColor: "bg-[#E08A3E]/20 text-[#E08A3E] border border-[#E08A3E]/40",
    description: "Autonomous DeFi, social & payment agents orchestrating Stellar accounts.",
    runtime: "ElizaOS Stellar Runtime v1.2",
    model: "gpt-4o",
    icon: "bolt",
  },
  {
    id: "langchain",
    name: "LangChain / LangGraph",
    description: "Stateful agentic workflows, multi-actor graphs, and tool execution loops.",
    runtime: "LangChain Agentic Runtime v0.3",
    model: "gpt-4o-mini",
    icon: "account_tree",
  },
  {
    id: "crewai",
    name: "CrewAI Swarm",
    description: "Multi-agent collaborative swarms with specialized roles and task handoffs.",
    runtime: "CrewAI Multi-Worker Swarm v2.0",
    model: "claude-3.5-sonnet",
    icon: "groups",
  },
  {
    id: "autogpt",
    name: "AutoGPT / AutoGen",
    description: "Goal-oriented autonomous loops with automated subtask planning.",
    runtime: "AutoGPT Execution Kernel v1.0",
    model: "gpt-4o",
    icon: "psychology",
  },
  {
    id: "python_sdk",
    name: "Python Agent SDK",
    description: "Direct integration for local or server-side agents using @veraos/python.",
    runtime: "VeraOS Python SDK Worker",
    model: "gpt-4o",
    icon: "terminal",
  },
  {
    id: "custom_rest",
    name: "Custom Webhook / REST",
    description: "Connect any autonomous agent exposing a standard JSON-RPC or HTTP webhook.",
    runtime: "Custom HTTP JSON-RPC Agent",
    model: "custom-llm",
    icon: "api",
  },
];

export const ConnectAgent: React.FC = () => {
  const { activeAgent, openConnectModal, testHandshake, disconnectAgent } = useAgentContext();

  const [copiedKey, setCopiedKey] = useState(false);
  const [activeLang, setActiveLang] = useState<"ts" | "py" | "curl">("ts");
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const liveApiKey = activeAgent?.apiKeySnippet || "vera_live_sec_89bf2e91a001";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(liveApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePing = async () => {
    if (!activeAgent) return;
    setIsPinging(true);
    setPingStatus("Pinging...");
    try {
      const res = await testHandshake(activeAgent.id);
      setPingStatus(`${res.latencyMs}ms ✓ Stellar RPC`);
      setTimeout(() => setPingStatus(null), 4000);
    } catch {
      setPingStatus("Ping Failed");
      setTimeout(() => setPingStatus(null), 4000);
    } finally {
      setIsPinging(false);
    }
  };

  const tsCode = `import { VeraOS } from '@veraos/sdk';

// Initialize VeraOS Verification Client
const vera = new VeraOS({
  apiKey: process.env.VERA_API_KEY, // ${liveApiKey}
  network: 'stellar-testnet'
});

// Submit autonomous agent task & execution trace for verification
const result = await vera.verify({
  taskId: 'task_001',
  taskPrompt: 'Find 3 Soroban lending protocols on Stellar with TVL > $10M and pay 5 USDC.',
  workerId: '${activeAgent?.name || "my-agent"}',
  invariants: [
    { metric: 'tvl_threshold', operator: '>=', value: 10000000 },
    { metric: 'exact_transfer', asset: 'USDC', amount: 5.0 }
  ],
  executionTrace: agentRun.trace
});

if (!result.valid) {
  // Autonomous Remediation Handler
  console.warn('VeraOS Breaches:', result.remediationDirectives);
  await myAgent.remediate(result.remediationDirectives);
} else {
  console.log('Verified on Stellar! Ledger TxHash:', result.txHash || result.id);
}`;

  const pyCode = `import os
from veraos import VeraOS

client = VeraOS(api_key=os.getenv("VERA_API_KEY"))

# Submit autonomous agent execution for independent Stellar verification
verification = client.verify(
    task_id="task_001",
    task_prompt="Find 3 Stellar lending protocols with TVL > $10M and pay 5 USDC.",
    worker_id="${activeAgent?.name || "my-agent"}",
    network="stellar-testnet",
    execution_output=agent_output.text
)

if not verification.is_valid:
    # Trigger self-correction loop
    agent.apply_remediation(verification.remediation_directives)
else:
    print(f"Verified on Stellar! Explorer: https://stellar.expert/explorer/testnet/tx/{verification.tx_hash}")`;

  const curlCode = `curl -X POST https://api.veraos.network/v1/verify \\
  -H "Authorization: Bearer ${liveApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Find 3 Stellar lending protocols with TVL > $10M and pay 5 USDC.",
    "network": "stellar-testnet",
    "worker": {
      "id": "${activeAgent?.id || "my-agent"}",
      "output": "..."
    }
  }'`;

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Breadcrumbs & Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
          <Link to="/agents" className="hover:text-on-surface transition-colors">
            Agents
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Connect Agent</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
              Connect AI Agent
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Connect your AI agent to VeraOS just like connecting a Web3 wallet. Instant consent authorization, cryptographic attestation, and deterministic verification on Stellar.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => openConnectModal()}
            icon={
              <span className="material-symbols-outlined text-[18px]">
                smart_toy
              </span>
            }
            className="shrink-0 shadow-[0_0_16px_rgba(201,106,43,0.3)]"
          >
            Connect Agent (1-Click)
          </Button>
        </div>
      </div>

      {/* Hero: 1-Click Consent Connection Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2C1710] via-[#21110B] to-[#160C08] p-space-md lg:p-space-lg border border-[#E08A3E]/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#E08A3E]/20 text-[#E08A3E] font-label-caps text-label-caps font-bold border border-[#E08A3E]/30 uppercase">
              AgentConnect Protocol
            </span>
            <span className="text-xs text-[#B9A99B]">Wallet-like AI Agent Handshake</span>
          </div>

          <h2 className="text-lg font-bold text-[#FFF8F0]">
            Connect Your Agent in Seconds With Explicit User Consent
          </h2>
          <p className="text-xs text-[#B9A99B] leading-relaxed">
            No tedious manual form filling. When connecting, VeraOS presents a transparent permission request asking for your consent to inspect task claims, corroborate against Stellar Horizon/Soroban RPC, and emit remediation directives without custody of keys or funds.
          </p>

          <div className="flex items-center gap-4 text-xs font-code-sm text-[#F3E5D5] pt-1">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#4ade80] text-[16px]">check_circle</span>
              Non-Custodial
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#4ade80] text-[16px]">check_circle</span>
              Stellar Testnet RPC
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#4ade80] text-[16px]">check_circle</span>
              Remediation Loop
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openConnectModal()}
          className="px-5 py-3 rounded-xl bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-bold text-sm shadow-[0_0_20px_rgba(201,106,43,0.4)] flex items-center gap-2 transition-all shrink-0 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
            hub
          </span>
          <span>Launch Agent Handshake</span>
        </button>
      </div>

      {/* Active Connected Agent Banner (if any) */}
      {activeAgent && activeAgent.status === "CONNECTED" && (
        <div className="rounded-2xl bg-[#14291e]/60 border border-[#22c55e]/30 p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80]">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{activeAgent.name}</span>
                <Badge variant="passed" dot>
                  CONNECTED
                </Badge>
              </div>
              <span className="text-xs text-[#86efac]/80 font-code-sm">
                {activeAgent.runtime} • Stellar Testnet Attestation Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePing}
              disabled={isPinging}
              className="px-3 py-1.5 rounded-lg bg-[#0d1c14] hover:bg-[#1a3828] border border-[#22c55e]/30 text-xs font-semibold text-[#4ade80] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isPinging ? "sync" : "bolt"}
              </span>
              <span>{pingStatus || "Test Handshake Ping"}</span>
            </button>

            <button
              type="button"
              onClick={() => disconnectAgent(activeAgent.id)}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Supported Agent Frameworks Grid */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Supported Agent Frameworks
          </h3>
          <span className="text-xs text-outline">Click any framework to connect with consent</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {RUNTIMES.map((fw) => (
            <div
              key={fw.id}
              className="p-space-md rounded-2xl bg-surface-container-low border border-white/10 hover:border-[#E08A3E]/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#2C1710] text-[#E08A3E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">{fw.icon}</span>
                  </div>
                  {fw.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${fw.badgeColor}`}>
                      {fw.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-on-surface group-hover:text-[#E08A3E] transition-colors">
                  {fw.name}
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {fw.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-outline font-code-sm">
                  {fw.model}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    openConnectModal({
                      name: fw.id === "eliza" ? "StellarEliza" : fw.name.split(" ")[0],
                      runtime: fw.runtime,
                      model: fw.model,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-[#C96A2B] hover:text-white text-xs font-semibold text-primary transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Connect</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer API Credentials Card */}
      <div className="rounded-2xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Developer Credentials & Endpoints
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-label-caps text-label-caps uppercase font-semibold">
            STELLAR TESTNET GATEWAY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {/* Endpoint */}
          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-white/5 flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Verification API Endpoint
            </span>
            <span className="font-code-sm text-code-sm text-primary font-mono select-all">
              https://api.veraos.network/v1/verify
            </span>
            <span className="text-[11px] text-outline">
              Live Soroban RPC & Horizon settlement gateway
            </span>
          </div>

          {/* API Key */}
          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps text-outline uppercase">
                Active Verification Key
              </span>
              <span className="font-code-sm text-code-sm text-secondary font-mono truncate">
                {liveApiKey}
              </span>
              <span className="text-[11px] text-outline">
                Scoped with user consent for Stellar verification
              </span>
            </div>

            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-code-sm text-code-sm flex items-center gap-1 shrink-0 transition-colors border border-white/5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedKey ? "check" : "content_copy"}
              </span>
              <span>{copiedKey ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Integration Examples */}
      <div className="rounded-2xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-xl flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-white/5 pb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Agent Runtime Integration Code
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Submit an agent assertion and receive a deterministic verdict with automated remediation directives.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-white/5 self-start sm:self-auto">
            {(["ts", "py", "curl"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase font-semibold transition-colors cursor-pointer ${
                  activeLang === lang
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {lang === "ts" ? "TypeScript" : lang === "py" ? "Python" : "cURL"}
              </button>
            ))}
          </div>
        </div>

        {activeLang === "ts" && (
          <CodeBlock
            code={tsCode}
            language="TypeScript SDK"
            filename="verify-agent.ts"
          />
        )}
        {activeLang === "py" && (
          <CodeBlock
            code={pyCode}
            language="Python SDK"
            filename="verify_agent.py"
          />
        )}
        {activeLang === "curl" && (
          <CodeBlock
            code={curlCode}
            language="cURL"
            filename="POST /v1/verify"
          />
        )}
      </div>
    </div>
  );
};
