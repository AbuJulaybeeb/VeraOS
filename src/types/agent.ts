export type AgentStatus = "CONNECTED" | "IDLE" | "NOT_CONNECTED";

export interface Agent {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  endpoint: string;
  runtime: string;
  model: string;
  totalVerifications: number;
  passRate: number;
  lastActive: string;
  verifiedTxCount: number;
  apiKeySnippet: string;
  attestationSchema: string;
  capabilities: string[];
}
