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
      attestationSchema: "EAS Base (0x9a4f...10cc)",
      capabilities: data.capabilities.length ? data.capabilities : ["custom_workflow"],
    };

    const updated = [newAgent, ...list.filter((a) => a.id !== id)];
    persistAgents(updated);
    return newAgent;
  },
};
