// Canonical VeraOS Core Domain Model (P0)
export const DOMAIN_VERSION = "1.0.0";

export type RequirementType =

  | "count"
  | "threshold"
  | "category"
  | "ecosystem"
  | "transaction"
  | "format"
  | "general";

export type RequirementOperator = "eq" | "gt" | "gte" | "lt" | "lte" | "contains";

export type RequirementStatus = "pending" | "passed" | "failed" | "unverifiable";

export interface Requirement {
  id: string;
  description: string;
  type: RequirementType;
  operator?: RequirementOperator;
  expected?: unknown;
  status: RequirementStatus;
}

export interface WorkerClaim {
  id: string;
  requirementId?: string;
  statement: string;
  value?: unknown;
  source: "worker";
}

export type EvidenceType = "worker_output" | "deterministic" | "blockchain" | "web";
export type EvidenceStrength = "weak" | "medium" | "strong";
export type EvidenceStatus = "received" | "verified" | "failed";

export interface Evidence {
  id: string;
  type: EvidenceType;
  source: string;
  claim?: string;
  value?: unknown;
  strength: EvidenceStrength;
  status: EvidenceStatus;
  metadata?: Record<string, unknown>;
}

export type CheckMethod = "worker_output" | "deterministic" | "blockchain" | "web";
export type CheckStatus = "passed" | "failed" | "unverifiable";

export interface VerificationCheck {
  id: string;
  requirementId: string;
  method: CheckMethod;
  status: CheckStatus;
  expected?: unknown;
  observed?: unknown;
  evidenceIds: string[];
  explanation: string;
}

export type VerdictStatus = "VERIFIED" | "FAILED" | "PARTIAL" | "UNVERIFIABLE";

export interface Verdict {
  status: VerdictStatus;
  passed: number;
  failed: number;
  unverifiable: number;
  total: number;
  summary: string;
  failureReasons: string[];
}

export interface RemediationDirective {
  id?: string;
  type:
    | "REPLACE_TARGET"
    | "CORRECT_TRANSACTION"
    | "PROVIDE_TRANSACTION_HASH"
    | "SUPPLY_MISSING_RESULTS"
    | "RETRY_WITH_PROOF";
  requirementId: string;
  target?: string;
  reason?: string;
  required?: unknown;
  suggestedAlternatives?: string[];
}

export interface RemediationPacket {
  status: "FAIL";
  retryable: boolean;
  attempt: number;
  maxAttempts: number;
  directives: RemediationDirective[];
}

export interface VerificationRequest {
  task: string;
  worker: {
    id?: string;
    name?: string;
    output: string;
  };
  telegramUserId?: number | string;
  telegramChatId?: number | string;
  options?: {
    evidenceSources?: string[];
    maxAttempts?: number;
  };
}

export interface VerificationRecord {
  id: string;
  task: string;
  worker: {
    id?: string;
    name?: string;
    output: string;
  };
  requirements: Requirement[];
  claims: WorkerClaim[];
  evidence: Evidence[];
  checks: VerificationCheck[];
  verdict: Verdict;
  remediation?: RemediationPacket;
  attempt: number;
  maxAttempts: number;
  createdAt: string;
  completedAt?: string;
  telegramUserId?: number | string;
  telegramChatId?: number | string;

  // Frontend compatibility fields (adapted for existing UI views)
  displayId?: string;
  taskId?: string;
  taskPrompt?: string;
  workerId?: string;
  workerName?: string;
  network?: string;
  chainId?: number;
  status?: "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "UNVERIFIED" | "ERROR";
  quorum?: string;
  latencyMs?: number;
  attempts?: Array<{
    attemptNumber: number;
    timestamp: string;
    status: "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "UNVERIFIED" | "ERROR";
    summary: string;
    detailedReason: string;
    workerClaims: Array<{
      id: string;
      requirementId?: string;
      title: string;
      statement: string;
      source: "WORKER_OUTPUT";
      timestamp: string;
      status: "UNVERIFIED" | "CORROBORATED" | "CONFLICT";
      details?: Record<string, string | number | boolean>;
    }>;
    invariants: Array<{
      id: string;
      name: string;
      category: "cardinality" | "ecosystem" | "threshold" | "payment" | "custom";
      description: string;
      expected: string;
      actual?: string;
      delta?: string;
      status: "PASSED" | "FAILED" | "UNVERIFIED";
      latencyMs?: number;
      oracleProof?: {
        source: string;
        proofId: string;
        verified: boolean;
      };
      details?: Record<string, unknown>;
    }>;
    evidence: Array<{
      id: string;
      requirementId: string;
      type: "ONCHAIN" | "WEB_ORACLE" | "TRACE_AUDIT" | "DETERMINISTIC";
      title: string;
      provider: string;
      proofType: string;
      independent: boolean;
      status: "CONFIRMED" | "REJECTED" | "UNAVAILABLE" | "PENDING";
      data: Record<string, string | number | boolean>;
      proofHash?: string;
      explorerUrl?: string;
      isMock: boolean;
      timestamp: string;
    }>;
    remediationDirectives?: Array<{
      id: string;
      invariantId: string;
      action: "REPLACE_TARGET" | "EXECUTE_SUPPLEMENTAL_TRANSFER" | "RETRY_WITH_PROOF";
      target?: string;
      reason: string;
      suggestedAlternatives?: string[];
      requiredDelta?: number | string;
      tokenContract?: string;
      mandatory: boolean;
    }>;
    rawTraceJson?: string;
    easUid?: string;
    blockNumber?: number;
  }>;
}
