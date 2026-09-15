import type {
  Requirement,
  WorkerClaim,
  VerificationCheck,
  Evidence,
} from "../types/domain.ts";
import type { VerificationContext } from "./evidenceProviders/provider.ts";
import { deterministicProvider } from "./evidenceProviders/deterministicProvider.ts";
import { workerOutputProvider } from "./evidenceProviders/workerOutputProvider.ts";



export interface CheckEngineResult {
  requirements: Requirement[];
  checks: VerificationCheck[];
  evidence: Evidence[];
}

export class CheckEngine {
  async executeChecks(
    requirements: Requirement[],
    claims: WorkerClaim[],
    context: VerificationContext
  ): Promise<CheckEngineResult> {
    const checks: VerificationCheck[] = [];
    const allEvidence: Evidence[] = [];
    const updatedRequirements: Requirement[] = [];

    // First collect baseline worker output evidence
    for (const req of requirements) {
      const workerEvResult = await workerOutputProvider.verify(req, claims, context);
      allEvidence.push(...workerEvResult.evidence);
    }

    // Next perform deterministic structural verification on each requirement
    for (const req of requirements) {
      const detResult = await deterministicProvider.verify(req, claims, context);
      allEvidence.push(...detResult.evidence);

      const check: VerificationCheck = {
        id: `check_${req.id}`,
        requirementId: req.id,
        method: "deterministic",
        status: detResult.status,
        expected: detResult.expected,
        observed: detResult.observed,
        evidenceIds: detResult.evidence.map((e) => e.id),
        explanation: detResult.explanation,
      };

      checks.push(check);

      updatedRequirements.push({
        ...req,
        status: detResult.status,
      });
    }

    return {
      requirements: updatedRequirements,
      checks,
      evidence: allEvidence,
    };
  }
}

export const checkEngine = new CheckEngine();
