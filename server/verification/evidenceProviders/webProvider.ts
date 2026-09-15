import type { Requirement, WorkerClaim } from "../../types/domain.ts";
import type { EvidenceProvider, EvidenceResult, VerificationContext } from "./provider.ts";


/**
 * WebProvider (Extension Point for future roadmap)
 * Will perform authoritative web oracle and external API lookups.
 * Scaffolded only; unconnected in current release.
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
      observed: "Web Oracle provider not connected in current release",
      evidence: [],
      explanation: "Independent Web Oracle verification is scheduled for future roadmap. Currently unconnected.",
    };
  }
}

export const webProvider = new WebProvider();
