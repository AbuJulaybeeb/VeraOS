import { RequirementInvariant } from "./requirement";
import { WorkerClaim, IndependentEvidence } from "./evidence";

export type VerificationStatus =
  | "PENDING"
  | "RUNNING"
  | "PASSED"
  | "FAILED"
  | "UNVERIFIED"
  | "ERROR";

export interface RemediationDirective {
  id: string;
  invariantId: string;
  action: "REPLACE_TARGET" | "EXECUTE_SUPPLEMENTAL_TRANSFER" | "RETRY_WITH_PROOF";
  target?: string;
  reason: string;
  suggestedAlternatives?: string[];
  requiredDelta?: number | string;
  tokenContract?: string;
  mandatory: boolean;
}

export interface VerificationAttempt {
  attemptNumber: number;
  timestamp: string;
  status: VerificationStatus;
  summary: string;
  detailedReason: string;
  workerClaims: WorkerClaim[];
  invariants: RequirementInvariant[];
  evidence: IndependentEvidence[];
  remediationDirectives?: RemediationDirective[];
  rawTraceJson?: string;
  stellarTxHash?: string;
  ledgerNumber?: number;
  easUid?: string;
  blockNumber?: number;
}

export interface VerificationRecord {
  id: string; // e.g. "v_test_89bf2e"
  displayId: string; // e.g. "V-1048", "V-00021"
  taskId: string;
  taskPrompt: string;
  workerId: string;
  workerName: string;
  network: string; // e.g. "Stellar Testnet", "Stellar Mainnet"
  chainId: number;
  createdAt: string;
  currentAttempt: number;
  maxAttempts: number;
  status: VerificationStatus;
  quorum: string;
  latencyMs: number;
  stellarTxHash?: string;
  ledgerNumber?: number;
  attempts: VerificationAttempt[];
}

export interface CreateVerificationInput {
  taskPrompt: string;
  workerId: string;
  workerName?: string;
  workerOutput: string;
  network?: string;
  maxAttempts?: number;
  evidenceSources?: string[];
  declaredInvariants?: Array<{
    name: string;
    expected: string;
    category: "cardinality" | "ecosystem" | "threshold" | "payment" | "custom";
  }>;
}
