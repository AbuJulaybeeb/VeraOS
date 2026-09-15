import type { Requirement, WorkerClaim } from "../../types/domain.ts";
import type { EvidenceProvider, EvidenceResult, VerificationContext } from "./provider.ts";


/**
 * WebProvider (Extension Point for Milestone 2)
 * Will perform TLS-Notary session proofs and authoritative web oracle lookups.
 * NOT implemented in P0 in accordance with instructions.
 */
export class WebProvider implements EvidenceProvider {
  name = "WebProvider";

  canHandle(requirement: Requirement): boolean {
    return requirement.type === "threshold" || requirement.type === "category";
  }

  async verify(
    requirement: Requirement,
    _claims: WorkerClaim[],
    _context: VerificationContext
  ): Promise<EvidenceResult> {
    return {
      status: "unverifiable",
      expected: requirement.expected,
      observed: "Web Oracle / TLS-Notary provider not connected in P0",
      evidence: [],
      explanation: "Independent Web Oracle / TLS-Notary verification is scheduled for Milestone 2. Currently unconnected.",
    };
  }
}

export const webProvider = new WebProvider();
