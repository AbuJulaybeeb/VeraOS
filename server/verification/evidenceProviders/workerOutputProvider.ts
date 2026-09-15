import type { Requirement, WorkerClaim, Evidence } from "../../types/domain.ts";
import type { EvidenceProvider, EvidenceResult, VerificationContext } from "./provider.ts";



/**
 * WorkerOutputProvider captures worker assertions.
 * RULE: Worker output is NEVER independent evidence.
 * Strength is strictly marked as "weak" and status as "received".
 */
export class WorkerOutputProvider implements EvidenceProvider {
  name = "WorkerOutputProvider";

  canHandle(_requirement: Requirement): boolean {
    return true;
  }

  async verify(
    requirement: Requirement,
    claims: WorkerClaim[],
    _context: VerificationContext
  ): Promise<EvidenceResult> {
    const matchingClaims = claims.filter(
      (c) => c.requirementId === requirement.id || !c.requirementId
    );

    const evidenceItems: Evidence[] = matchingClaims.map((claim, idx) => ({
      id: `ev_worker_${requirement.id}_${idx + 1}`,
      type: "worker_output",
      source: "worker_submission",
      claim: claim.statement,
      value: claim.value,
      strength: "weak",
      status: "received",
      metadata: {
        rawStatement: claim.statement,
        selfReported: true,
      },
    }));

    return {
      status: "unverifiable",
      expected: requirement.expected,
      observed: matchingClaims.map((c) => c.statement).join("; "),
      evidence: evidenceItems,
      explanation: `Worker asserted: "${matchingClaims.map((c) => c.statement).join(", ") || "No specific claim"}". Worker output alone is unverified evidence.`,
    };
  }
}

export const workerOutputProvider = new WorkerOutputProvider();
