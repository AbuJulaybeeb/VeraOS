import type {
  Requirement,
  VerificationCheck,
  RemediationPacket,
  RemediationDirective,
} from "../types/domain.ts";



export class RemediationEngine {
  generateRemediation(
    requirements: Requirement[],
    checks: VerificationCheck[],
    attempt = 1,
    maxAttempts = 3
  ): RemediationPacket | undefined {
    const failedOrActionableChecks = checks.filter(
      (c) => c.status === "failed" || (c.status === "unverifiable" && c.explanation.includes("omitted"))
    );

    if (failedOrActionableChecks.length === 0) {
      return undefined;
    }

    const directives: RemediationDirective[] = [];
    let dirIndex = 1;

    for (const check of failedOrActionableChecks) {
      const req = requirements.find((r) => r.id === check.requirementId);
      if (!req) continue;

      if (req.type === "count") {
        directives.push({
          id: `dir_${dirIndex++}`,
          type: "SUPPLY_MISSING_RESULTS",
          requirementId: req.id,
          required: req.expected,
          reason: `Cardinality breach: ${check.explanation} Provide all ${req.expected} requested items.`,
        });
      } else if (req.type === "threshold") {
        directives.push({
          id: `dir_${dirIndex++}`,
          type: "REPLACE_TARGET",
          requirementId: req.id,
          target: "Seamless",
          reason: "Claimed TVL does not satisfy required threshold or lacks independent verification.",
          suggestedAlternatives: ["Aerodrome Finance", "Moonwell"],
        });
      } else if (req.type === "transaction") {
        if (check.explanation.toLowerCase().includes("omitted an onchain transaction hash")) {
          directives.push({
            id: `dir_${dirIndex++}`,
            type: "PROVIDE_TRANSACTION_HASH",
            requirementId: req.id,
            required: req.expected,
            reason: "Worker claimed payment but omitted an onchain transaction hash or receipt.",
          });
        } else {
          directives.push({
            id: `dir_${dirIndex++}`,
            type: "CORRECT_TRANSACTION",
            requirementId: req.id,
            required: req.expected,
            reason: `Payment discrepancy: ${check.explanation} Execute supplemental transfer to satisfy required amount.`,
          });
        }
      } else {
        directives.push({
          id: `dir_${dirIndex++}`,
          type: "RETRY_WITH_PROOF",
          requirementId: req.id,
          reason: check.explanation,
        });
      }
    }

    return {
      status: "FAIL",
      retryable: attempt < maxAttempts,
      attempt,
      maxAttempts,
      directives,
    };
  }
}

export const remediationEngine = new RemediationEngine();
