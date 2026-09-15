import type { VerificationCheck, Verdict, VerdictStatus } from "../types/domain.ts";



export class VerdictEngine {
  synthesizeVerdict(checks: VerificationCheck[]): Verdict {
    const passed = checks.filter((c) => c.status === "passed").length;
    const failed = checks.filter((c) => c.status === "failed").length;
    const unverifiable = checks.filter((c) => c.status === "unverifiable").length;
    const total = checks.length;

    let status: VerdictStatus = "UNVERIFIABLE";
    const failureReasons: string[] = [];

    for (const check of checks) {
      if (check.status === "failed") {
        failureReasons.push(`[FAILED] Requirement ${check.requirementId}: ${check.explanation}`);
      } else if (check.status === "unverifiable") {
        failureReasons.push(`[UNVERIFIED] Requirement ${check.requirementId}: ${check.explanation}`);
      }
    }

    if (failed > 0) {
      status = "FAILED";
    } else if (unverifiable > 0 && passed > 0) {
      status = "PARTIAL";
    } else if (unverifiable > 0 && passed === 0) {
      status = "UNVERIFIABLE";
    } else if (passed === total && total > 0) {
      status = "VERIFIED";
    }

    // Generate deterministic summary
    let summary = "";
    if (status === "VERIFIED") {
      summary = `ALL INVARIANTS SATISFIED — ${passed}/${total} requirements verified deterministically.`;
    } else if (status === "FAILED") {
      summary = `VERIFICATION REJECTED — ${failed} of ${total} requirements breached declared invariants.`;
    } else if (status === "PARTIAL") {
      summary = `PARTIAL / UNVERIFIABLE — ${passed} structural requirements satisfied; ${unverifiable} requirements require independent evidence (external providers not connected in P0).`;
    } else {
      summary = `UNVERIFIABLE — Independent verification sources are not yet connected in P0.`;
    }

    return {
      status,
      passed,
      failed,
      unverifiable,
      total,
      summary,
      failureReasons,
    };
  }
}

export const verdictEngine = new VerdictEngine();
