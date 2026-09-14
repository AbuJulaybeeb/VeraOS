export type InvariantStatus = "PASSED" | "FAILED" | "UNVERIFIED";

export interface RequirementInvariant {
  id: string;
  name: string;
  category: "cardinality" | "ecosystem" | "threshold" | "payment" | "custom";
  description: string;
  expected: string;
  actual?: string;
  delta?: string;
  status: InvariantStatus;
  latencyMs?: number;
  oracleProof?: {
    source: string;
    proofId: string;
    verified: boolean;
  };
  details?: Record<string, unknown>;
}
