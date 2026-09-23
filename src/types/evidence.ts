export type EvidenceType = "ONCHAIN" | "WEB_ORACLE" | "TRACE_AUDIT" | "DETERMINISTIC";
export type EvidenceStatus = "CONFIRMED" | "REJECTED" | "UNAVAILABLE" | "PENDING";

export interface WorkerClaim {
  id: string;
  requirementId?: string;
  title: string;
  statement: string;
  source: "WORKER_OUTPUT";
  timestamp: string;
  status: "UNVERIFIED" | "CORROBORATED" | "CONFLICT";
  details?: Record<string, string | number | boolean>;
}

export interface IndependentEvidence {
  id: string;
  requirementId: string;
  type: EvidenceType;
  title: string;
  provider: string;
  proofType: string;
  independent: boolean; // Always true for VeraOS evidence
  status: EvidenceStatus;
  data: Record<string, string | number | boolean>;
  proofHash?: string;
  explorerUrl?: string;
  timestamp: string;
}
