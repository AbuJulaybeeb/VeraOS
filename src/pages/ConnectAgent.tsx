import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAgents } from "../hooks/useAgents";
import { Button } from "../components/ui/Button";
import { CodeBlock } from "../components/ui/CodeBlock";

export const ConnectAgent: React.FC = () => {
  const navigate = useNavigate();
  const { connectAgent } = useAgents();

  const [copiedKey, setCopiedKey] = useState(false);
  const [activeLang, setActiveLang] = useState<"ts" | "py" | "curl">("ts");

  // Registration form state
  const [agentName, setAgentName] = useState("");
  const [endpoint, setEndpoint] = useState("https://agent.acme.ai/rpc");
  const [runtime, setRuntime] = useState("LangChain Agent");
  const [model, setModel] = useState("gpt-4o");
  const [capabilities, setCapabilities] = useState("defi_research, onchain_payout");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const demoApiKey = "vera_live_demo_984f1a20b0849208a001";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(demoApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    setIsSubmitting(true);
    const created = await connectAgent({
      name: agentName,
      endpoint,
      runtime,
      model,
      capabilities: capabilities.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setIsSubmitting(false);

    if (created) {
      setSuccessMessage(`Agent "${agentName}" successfully connected to VeraOS.`);
      setTimeout(() => {
        navigate("/agents");
      }, 1500);
    }
  };

  const tsCode = `import { VeraOS } from '@veraos/sdk';

// Initialize VeraOS Verification Client
const vera = new VeraOS({
  apiKey: process.env.VERA_API_KEY, // vera_live_demo_984f...
  network: 'base-mainnet'
});

// Submit autonomous agent task & execution trace for verification
const result = await vera.verify({
  taskId: 'task_001',
  taskPrompt: 'Find 3 Base lending protocols with TVL > $10M and pay 5 USDC.',
  workerId: '${agentName || "my-agent"}',
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
  console.log('Verified on Stellar! TxHash:', result.easUid);
}`;

  const pyCode = `import os
from veraos import VeraOS

client = VeraOS(api_key=os.getenv("VERA_API_KEY"))

# Submit autonomous agent execution for independent Stellar verification
verification = client.verify(
    task_id="task_001",
    task_prompt="Find 3 Stellar lending protocols with TVL > $10M and pay 5 USDC.",
    worker_id="${agentName || "my-agent"}",
    network="stellar-testnet",
    execution_output=agent_output.text
)

if not verification.is_valid:
    # Trigger self-correction loop
    agent.apply_remediation(verification.remediation_directives)
else:
    print(f"Verified on Stellar! Explorer: https://stellar.expert/explorer/testnet/tx/{verification.tx_hash}")`;

  const curlCode = `curl -X POST https://api.veraos.network/v1/verify \\
  -H "Authorization: Bearer ${demoApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Find 3 Stellar lending protocols with TVL > $10M and pay 5 USDC.",
    "network": "stellar-testnet",
    "worker": {
      "id": "${agentName || "my-agent"}",
      "output": "..."
    }
  }'`;

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline">
          <Link to="/agents" className="hover:text-on-surface transition-colors">
            Agents
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">Connect Agent</span>
        </div>

        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
          Connect Agent to VeraOS
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Integrate the VeraOS verification layer into your autonomous agent pipelines using standard REST APIs or SDKs.
        </p>
      </div>

      {/* API Key & Endpoint Card */}
      <div className="rounded-2xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Developer Credentials & Endpoints
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-label-caps text-label-caps uppercase font-semibold">
            DEMO TESTNET CREDENTIALS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {/* Endpoint */}
          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-white/5 flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              API Base URL
            </span>
            <span className="font-code-sm text-code-sm text-primary font-mono select-all">
              https://api.veraos.network/v1
            </span>
            <span className="text-[11px] text-outline">
              Primary JSON-RPC & verification gateway
            </span>
          </div>

          {/* API Key */}
          <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps text-outline uppercase">
                Demo API Key
              </span>
              <span className="font-code-sm text-code-sm text-secondary font-mono truncate">
                {demoApiKey}
              </span>
              <span className="text-[11px] text-outline">
                Non-production developer mock key
              </span>
            </div>

            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-code-sm text-code-sm flex items-center gap-1 shrink-0 transition-colors border border-white/5"
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
                className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase font-semibold transition-colors ${
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

      {/* Register Agent Form */}
      <div className="rounded-2xl bg-surface-container p-space-md lg:p-space-lg border border-white/10 shadow-xl flex flex-col gap-space-md">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Register Agent Webhook
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Register a new autonomous agent to monitor its verifications and dispatch remediation envelopes.
          </p>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-lg bg-[#14291e]/80 border border-[#22c55e]/30 text-[#4ade80] font-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Agent Name:
              </label>
              <input
                type="text"
                required
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. SentinelBot"
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Webhook Endpoint:
              </label>
              <input
                type="url"
                required
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://agent.acme.ai/remediate"
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Framework Runtime:
              </label>
              <select
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              >
                <option value="LangChain Agent">LangChain Agent</option>
                <option value="CrewAI Swarm">CrewAI Swarm</option>
                <option value="AutoGPT Runtime">AutoGPT Runtime</option>
                <option value="Custom LLM Loop">Custom LLM Loop</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Base Model:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                <option value="deepseek-r1">deepseek-r1</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-body-sm text-body-sm text-on-surface font-medium">
                Task Capabilities:
              </label>
              <input
                type="text"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="comma, separated, scopes"
                className="p-2.5 rounded-lg bg-surface-container-lowest border border-white/10 font-code-sm text-code-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  link
                </span>
              }
            >
              Register & Connect Agent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
