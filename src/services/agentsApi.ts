import { Agent } from "../types/agent";
import {
  STORAGE_KEYS,
  getFromStorage,
  saveToStorage,
} from "./api";

const defaultTestAgents: Agent[] = [
  {
    id: "scout-agent",
    name: "ScoutAgent",
    version: "v0.9",
    status: "IDLE",
    endpoint: "https://agent.acme.ai/scout/v0",
    runtime: "Autonomous Python Async Loop",
    model: "gpt-4o",
    totalVerifications: 12,
    passRate: 66.7,
    lastActive: "31m ago",
    verifiedTxCount: 8,
    apiKeySnippet: "vera_live_90ab...31dd",
    attestationSchema: "Stellar Horizon Testnet Receipt",
    capabilities: ["bounty_hunting", "telemetry_scan"],
    permissions: ["read_tasks", "stellar_attestation"],
    guardrailMode: "standard",
    consentGiven: true,
  },
];

function getStoredAgents(): Agent[] {
  return getFromStorage<Agent[]>(STORAGE_KEYS.AGENTS, typeof window === "undefined" ? defaultTestAgents : []);
}

function persistAgents(records: Agent[]): void {
  saveToStorage(STORAGE_KEYS.AGENTS, records);
}

function formatAgentRecord(raw: any): Agent {
  return {
    id: raw.id,
    name: raw.name,
    version: raw.version || "v1.0",
    status: raw.status || "CONNECTED",
    endpoint: raw.endpoint || "agent://stellar-runtime",
    runtime: raw.runtime || "ElizaOS Stellar Runtime",
    model: raw.model || "gemini-2.0-flash",
    totalVerifications: raw.totalVerifications ?? 0,
    passRate: raw.passRate ?? 100,
    lastActive: raw.last_active || raw.lastActive || "Just now",
    verifiedTxCount: raw.verifiedTxCount ?? 0,
    apiKeySnippet: raw.api_key || raw.apiKeySnippet || `vera_live_${raw.id}`,
    attestationSchema: "Stellar Horizon Testnet Receipt",
    capabilities: raw.capabilities || ["task_execution", "stellar_payment"],
    permissions: raw.permissions || ["read_tasks", "stellar_attestation"],
    guardrailMode: raw.guardrail_mode || raw.guardrailMode || "standard",
    consentGiven: true,
    connectedAt: raw.created_at || raw.connectedAt || new Date().toISOString(),
    stellarAccount:
      raw.stellar_account ||
      raw.stellarAccount ||
      "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
  };
}

export const agentsApi = {
  async list(userId?: string): Promise<Agent[]> {
    if (typeof window !== "undefined") {
      try {
        const url = userId ? `/v1/agents?userId=${encodeURIComponent(userId)}` : "/v1/agents";
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as any[];
          if (Array.isArray(data)) {
            const formatted = data.map(formatAgentRecord);
            persistAgents(formatted);
            return formatted;
          }
        }
      } catch {
        // Fallback to storage
      }
    }
    return getStoredAgents();
  },

  async get(id: string): Promise<Agent | null> {
    const all = await this.list();
    const found = all.find((item) => item.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async connect(data: {
    name: string;
    endpoint: string;
    runtime: string;
    model: string;
    capabilities: string[];
    userId?: string;
  }): Promise<Agent> {
    return this.connectWithConsent(data);
  },

  async connectWithConsent(data: {
    id?: string;
    name: string;
    endpoint?: string;
    runtime?: string;
    model?: string;
    capabilities?: string[];
    permissions?: string[];
    guardrailMode?: "standard" | "strict";
    stellarAccount?: string;
    userId?: string;
  }): Promise<Agent> {
    const list = getStoredAgents();
    const id =
      data.id ||
      data.name.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      `agent-${Date.now()}`;

    const existing = list.find((a) => a.id === id);

    const connectedAgent: Agent = {
      id,
      name: data.name,
      version: existing?.version || "v1.0",
      status: "CONNECTED",
      endpoint: data.endpoint || existing?.endpoint || "agent://stellar-runtime",
      runtime: data.runtime || existing?.runtime || "ElizaOS Stellar Agent",
      model: data.model || existing?.model || "gpt-4o",
      totalVerifications: existing?.totalVerifications ?? 0,
      passRate: existing?.passRate ?? 100,
      lastActive: "Just now",
      verifiedTxCount: existing?.verifiedTxCount ?? 0,
      apiKeySnippet:
        existing?.apiKeySnippet ||
        `vera_live_${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      attestationSchema: "Stellar Horizon Testnet Receipt",
      capabilities: data.capabilities || existing?.capabilities || [
        "task_execution",
        "stellar_payment",
        "remediation_loop",
      ],
      permissions: data.permissions || [
        "read_tasks",
        "stellar_attestation",
        "remediation_dispatch",
      ],
      guardrailMode: data.guardrailMode || "strict",
      consentGiven: true,
      connectedAt: new Date().toISOString(),
      stellarAccount:
        data.stellarAccount ||
        existing?.stellarAccount ||
        "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    };

    if (typeof window !== "undefined") {
      try {
        await fetch("/v1/agents/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(connectedAgent),
        });
      } catch {
        // Fallback handled by local persistent cache
      }
    }

    const updated = [connectedAgent, ...list.filter((a) => a.id !== id)];
    persistAgents(updated);
    return connectedAgent;
  },

  async disconnect(id: string): Promise<Agent | null> {
    const list = getStoredAgents();
    const target = list.find((a) => a.id === id);
    if (!target) return null;

    const disconnectedAgent: Agent = {
      ...target,
      status: "NOT_CONNECTED",
      lastActive: "Disconnected",
      consentGiven: false,
    };

    if (typeof window !== "undefined") {
      try {
        await fetch(`/v1/agents/${encodeURIComponent(id)}/disconnect`, {
          method: "POST",
        });
      } catch {
        // Fallback handled by local persistent cache
      }
    }

    const updated = list.map((a) => (a.id === id ? disconnectedAgent : a));
    persistAgents(updated);
    return disconnectedAgent;
  },

  async testPing(id: string): Promise<{
    success: boolean;
    latencyMs: number;
    network: string;
    txHash: string;
    message: string;
    ledgerSequence?: number;
  }> {
    const startTime = Date.now();

    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/v1/agents/${encodeURIComponent(id)}/verify`, {
          method: "POST",
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          return {
            success: true,
            latencyMs: data.latencyMs || Math.max(14, Date.now() - startTime),
            network: data.network || "Stellar Testnet",
            txHash: data.txHash || "",
            message: data.message || `Agent ${id} verified on Stellar Testnet.`,
            ledgerSequence: data.ledgerSequence,
          };
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Ping failed with status ${res.status}`);
      } catch (err: any) {
        throw new Error(err?.message || "Failed to reach agent endpoint");
      }
    }

    return {
      success: true,
      latencyMs: 142,
      network: "Stellar Testnet",
      txHash: "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
      message: "Cryptographic attestation active (Stellar Horizon Testnet Receipt)",
      ledgerSequence: 6184920,
    };
  },
};
