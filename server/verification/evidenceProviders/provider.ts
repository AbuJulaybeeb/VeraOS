import type { Requirement, WorkerClaim, Evidence, CheckStatus } from "../../types/domain.ts";



export interface EvidenceResult {
  status: CheckStatus;
  expected?: unknown;
  observed?: unknown;
  evidence: Evidence[];
  explanation: string;
}

export interface VerificationContext {
  task: string;
  workerOutput: string;
  options?: {
    deterministicOverride?: {
      actualPaymentAmount?: number;
      actualPaymentToken?: string;
    };
  };
}

export interface EvidenceProvider {
  name: string;
  canHandle(requirement: Requirement): boolean;
  verify(
    requirement: Requirement,
    claims: WorkerClaim[],
    context: VerificationContext
  ): Promise<EvidenceResult>;
}
