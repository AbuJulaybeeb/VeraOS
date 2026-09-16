export type AgentStatus = "CONNECTED" | "IDLE" | "NOT_CONNECTED";
export type GuardrailMode = "standard" | "strict";

export interface AgentPermission {
  id: string;
  name: string;
  description: string;
  scope: string;
  required: boolean;
}

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
  permissions?: string[];
  guardrailMode?: GuardrailMode;
  consentGiven?: boolean;
  connectedAt?: string;
  stellarAccount?: string;
}
