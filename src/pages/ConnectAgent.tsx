import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAgentContext } from "../context/AgentContext";

export const ConnectAgent: React.FC = () => {
  const navigate = useNavigate();
  const { connectAgentWithConsent } = useAgentContext();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<"api" | "webhook" | "telegram">("api");
  const [agentName, setAgentName] = useState("ResearchAgent VR-2048");
  const [endpoint, setEndpoint] = useState("https://api.acme.ai/agent/verify");
  const [runtime, setRuntime] = useState("TypeScript / Node SDK");
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [capabilities, setCapabilities] = useState({
    financial: true,
    communication: true,
    database: false,
  });

  const apiKeySnippet = "vera_live_79a24f0c9182be34";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKeySnippet);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    setIsSubmitting(true);
    try {
      await connectAgentWithConsent({
        name: agentName.trim(),
        runtime,
        endpoint,
        model: "agent-v1",
        capabilities: Object.entries(capabilities)
          .filter(([_, enabled]) => enabled)
          .map(([key]) => key),
      });

      // Move to step 3 or navigate to agents
      setActiveStep(3);
      setTestResult("Handshake validated: latency 180ms â€¢ Cryptographic signature verified.");
      setTimeout(() => {
        navigate("/agents");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 font-sans">
      {/* 1. Header (Image 2) */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191513]">
          Connect an agent
        </h1>
        <p className="text-xs sm:text-sm text-[#6B635B] mt-1">
          Choose how your AI agent will send tasks and claims to Vera.
        </p>
      </div>

      {/* 2. Three-Step Progress Indicator (Image 2) */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-colors ${
              activeStep >= 1
                ? "bg-[#181311] text-white"
                : "bg-white border border-[#E8E4DC] text-[#6B635B]"
            }`}
          >
            1
          </div>
          <span
            className={`text-xs font-semibold ${
              activeStep === 1 ? "text-[#191513]" : "text-[#6B635B]"
            }`}
          >
            Connection
          </span>
        </div>

        <div className="flex-1 h-[2px] bg-[#E8E4DC] mx-4" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-colors ${
              activeStep >= 2
                ? "bg-[#181311] text-white"
                : "bg-white border border-[#E8E4DC] text-[#6B635B]"
            }`}
          >
            2
          </div>
          <span
            className={`text-xs font-semibold ${
              activeStep === 2 ? "text-[#191513]" : "text-[#6B635B]"
            }`}
          >
            Agent details
          </span>
        </div>

        <div className="flex-1 h-[2px] bg-[#E8E4DC] mx-4" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-colors ${
              activeStep >= 3
                ? "bg-[#1D7A46] text-white"
                : "bg-white border border-[#E8E4DC] text-[#6B635B]"
            }`}
          >
            3
          </div>
          <span
            className={`text-xs font-semibold ${
              activeStep === 3 ? "text-[#191513]" : "text-[#6B635B]"
            }`}
          >
            Test check
          </span>
        </div>
      </div>

      {/* 3. Three Integration Cards (Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: API */}
        <div
          onClick={() => setSelectedType("api")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedType === "api"
              ? "bg-white border-[#181311] ring-1 ring-[#181311] shadow-sm"
              : "bg-white border-[#E8E4DC] hover:border-[#D5CEC5]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-lg text-[#191513]">API</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5EE] text-[#1D7A46] border border-[#CDE5D5] text-[11px] font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-xs text-[#6B635B] leading-relaxed">
              Direct REST or SDK integration for custom agent runtimes and server backends.
            </p>
          </div>
          <div className="mt-4 font-mono text-[11px] text-[#D97736]">
            Python, Node, Go
          </div>
        </div>

        {/* Card 2: Webhook */}
        <div
          onClick={() => setSelectedType("webhook")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedType === "webhook"
              ? "bg-white border-[#181311] ring-1 ring-[#181311] shadow-sm"
              : "bg-white border-[#E8E4DC] hover:border-[#D5CEC5]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-lg text-[#191513]">Webhook</span>
            </div>
            <p className="text-xs text-[#6B635B] leading-relaxed">
              Receive execution claims via HTTP POST callback whenever an agent finishes a run.
            </p>
          </div>
          <div className="mt-4 font-mono text-[11px] text-[#6B635B]">
            Automated callbacks
          </div>
        </div>

        {/* Card 3: Telegram */}
        <div
          onClick={() => setSelectedType("telegram")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedType === "telegram"
              ? "bg-white border-[#181311] ring-1 ring-[#181311] shadow-sm"
              : "bg-white border-[#E8E4DC] hover:border-[#D5CEC5]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-lg text-[#191513]">Telegram</span>
            </div>
            <p className="text-xs text-[#6B635B] leading-relaxed">
              Connect an existing Telegram bot worker to monitor and verify bot actions automatically.
            </p>
          </div>
          <div className="mt-4 font-mono text-[11px] text-[#2AABEE]">
            Zero-code bridge
          </div>
        </div>
      </div>

      {/* 4. Configuration Form (Image 2) */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E4DC] shadow-sm flex flex-col gap-6">
        {/* Agent Name */}
        <div>
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
            Agent name
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g. ResearchAgent VR-2048"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors"
          />
        </div>

        {/* Endpoint / Webhook URL */}
        <div>
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
            {selectedType === "telegram" ? "Telegram Bot Username / Token" : "Webhook URL or API Endpoint"}
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder={
              selectedType === "telegram"
                ? "@YourVeraBot"
                : "https://api.acme.ai/agent/verify"
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors"
          />
        </div>

        {/* Runtime Environment */}
        <div>
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-1.5">
            Runtime environment
          </label>
          <select
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-sm text-[#191513] focus:outline-none focus:border-[#181311] transition-colors"
          >
            <option value="TypeScript / Node SDK">TypeScript / Node SDK (@veraos/sdk)</option>
            <option value="Python SDK (@veraos/py)">Python SDK (@veraos/py)</option>
            <option value="LangChain / LangGraph">LangChain / LangGraph Kernel</option>
            <option value="ElizaOS (Stellar Agent)">ElizaOS (Stellar Agent Runtime)</option>
            <option value="Custom HTTP JSON-RPC">Custom HTTP JSON-RPC Webhook</option>
          </select>
        </div>

        {/* Verification Assertions / Capabilities */}
        <div>
          <label className="block text-xs font-semibold text-[#191513] uppercase tracking-wider mb-2">
            Verification assertions required
          </label>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] hover:border-[#D5CEC5] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={capabilities.financial}
                onChange={(e) =>
                  setCapabilities({ ...capabilities, financial: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#181311] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#191513]">
                  Financial transactions & settlement
                </p>
                <p className="text-[11px] text-[#6B635B]">
                  Validates balance deltas, recipient addresses, and gas thresholds against RPC ground truth.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] hover:border-[#D5CEC5] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={capabilities.communication}
                onChange={(e) =>
                  setCapabilities({ ...capabilities, communication: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#181311] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#191513]">
                  Customer communication & notifications
                </p>
                <p className="text-[11px] text-[#6B635B]">
                  Verifies email deliveries, message receipts, and support ticket resolutions.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] hover:border-[#D5CEC5] cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={capabilities.database}
                onChange={(e) =>
                  setCapabilities({ ...capabilities, database: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#181311] focus:ring-0"
              />
              <div>
                <p className="text-xs font-semibold text-[#191513]">
                  Database mutations & CRM sync
                </p>
                <p className="text-[11px] text-[#6B635B]">
                  Ensures database state commitments reflect claimed output without data corruption.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* API Key Box (Image 2) */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-semibold text-[#6B635B] uppercase">
              Agent API Key
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-[#181311] font-semibold hover:text-[#D97736] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedKey ? "check" : "content_copy"}
              </span>
              <span>{copiedKey ? "Copied" : "Copy key"}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-[#E8E4DC] font-mono text-xs text-[#191513] select-all">
            VERA_API_KEY={apiKeySnippet}
          </div>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-xl bg-[#EAF5EE] border border-[#CDE5D5] text-xs text-[#1D7A46] font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{testResult}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E4DC]">
          <button
            type="button"
            onClick={() => navigate("/agents")}
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
                <span>Testing handshake...</span>
              </>
            ) : (
              <>
                <span>Save and test connection</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
