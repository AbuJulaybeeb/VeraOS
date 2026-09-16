import { Agent } from "../types/agent";
import { initialAgents } from "../mocks/agentsData";
import {
  delay,
  STORAGE_KEYS,
  getFromStorage,
  saveToStorage,
} from "./api";

function getStoredAgents(): Agent[] {
  return getFromStorage<Agent[]>(STORAGE_KEYS.AGENTS, initialAgents);
}

function persistAgents(records: Agent[]): void {
  saveToStorage(STORAGE_KEYS.AGENTS, records);
}

export const agentsApi = {
  async list(): Promise<Agent[]> {
    await delay(150);
    return getStoredAgents();
  },

  async get(id: string): Promise<Agent | null> {
    await delay(120);
    const list = getStoredAgents();
    const found = list.find((item) => item.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async connect(data: {
    name: string;
    endpoint: string;
    runtime: string;
    model: string;
    capabilities: string[];
  }): Promise<Agent> {
    await delay(300);
    const list = getStoredAgents();
    const id = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "custom-agent";

    const newAgent: Agent = {
      id,
      name: data.name,
      version: "v1.0",
      status: "CONNECTED",
      endpoint: data.endpoint || "https://agent.acme.ai/rpc",
      runtime: data.runtime || "Custom AI Worker",
      model: data.model || "gpt-4o",
      totalVerifications: 0,
      passRate: 100,
      lastActive: "Just now",
      verifiedTxCount: 0,
      apiKeySnippet: `vera_live_${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      attestationSchema: "Stellar Horizon Testnet Receipt",
      capabilities: data.capabilities.length ? data.capabilities : ["custom_workflow"],
    };

    const updated = [newAgent, ...list.filter((a) => a.id !== id)];
    persistAgents(updated);
    return newAgent;
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
  }): Promise<Agent> {
    await delay(350);
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

    const updated = [connectedAgent, ...list.filter((a) => a.id !== id)];
    persistAgents(updated);
    return connectedAgent;
  },

  async disconnect(id: string): Promise<Agent | null> {
    await delay(200);
    const list = getStoredAgents();
    const target = list.find((a) => a.id === id);
    if (!target) return null;

    const disconnectedAgent: Agent = {
      ...target,
      status: "NOT_CONNECTED",
      lastActive: "Disconnected",
      consentGiven: false,
    };

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
  }> {
    const startTime = Date.now();
    await delay(280);
    const latencyMs = Math.max(12, Date.now() - startTime);

    return {
      success: true,
      latencyMs,
      network: "Stellar Testnet (Soroban RPC & Horizon)",
      txHash: "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
      message: `Agent ${id} responded to handshake verification ping. Cryptographic attestation active on Stellar Testnet.`,
    };
  },
};
