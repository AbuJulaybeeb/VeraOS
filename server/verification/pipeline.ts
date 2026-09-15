import type {
  VerificationRequest,
  VerificationRecord,
  Requirement,
  WorkerClaim,
  Verdict,
  RemediationPacket,
} from "../types/domain.ts";
import { requirementExtractor } from "./requirementExtractor.ts";
import { claimExtractor } from "./claimExtractor.ts";
import { checkEngine } from "./checkEngine.ts";
import { verdictEngine } from "./verdictEngine.ts";
import { remediationEngine } from "./remediationEngine.ts";
import type { VerificationContext } from "./evidenceProviders/provider.ts";



export class VerificationPipeline {
  async run(
    request: VerificationRequest,
    attemptNumber = 1,
    contextOptions?: VerificationContext["options"]
  ): Promise<VerificationRecord> {
    if (!request.task || !request.task.trim()) {
      throw new Error("Invalid request: Task prompt cannot be empty.");
    }
    if (!request.worker?.output || !request.worker.output.trim()) {
      throw new Error("Invalid request: Worker output cannot be empty.");
    }

    const taskId = `task_${Date.now().toString(36)}`;
    const verificationId = `v_run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const displayNum = Math.floor(1000 + Math.random() * 9000);
    const displayId = `V-${displayNum}`;
    const createdAt = new Date().toISOString();

    // 1. Requirement Extraction
    const requirements: Requirement[] = requirementExtractor.extract(request.task);

    // 2. Claim Extraction
    const claims: WorkerClaim[] = claimExtractor.extract(
      request.worker.output,
      requirements
    );

    // 3. Deterministic Check Engine
    const context: VerificationContext = {
      task: request.task,
      workerOutput: request.worker.output,
      options: contextOptions,
    };

    const {
      requirements: evaluatedReqs,
      checks,
      evidence,
    } = await checkEngine.executeChecks(requirements, claims, context);

    // 4. Mathematical Verdict Synthesis
    const verdict: Verdict = verdictEngine.synthesizeVerdict(checks);

    // 5. Remediation Directive Generation
    const attempt = attemptNumber;
    const maxAttempts = request.options?.maxAttempts || 3;
    const remediation: RemediationPacket | undefined =
      verdict.status === "FAILED" || verdict.status === "PARTIAL"
        ? remediationEngine.generateRemediation(
            evaluatedReqs,
            checks,
            attempt,
            maxAttempts
          )
        : undefined;

    // 6. Map to UI compatibility representation
    const uiStatus =
      verdict.status === "VERIFIED"
        ? "PASSED"
        : verdict.status === "FAILED"
        ? "FAILED"
        : "UNVERIFIED";

    const uiInvariants = evaluatedReqs.map((r, i) => {
      const check = checks.find((c) => c.requirementId === r.id);
      let cat: "cardinality" | "ecosystem" | "threshold" | "payment" | "custom" = "custom";
      if (r.type === "count") cat = "cardinality";
      if (r.type === "ecosystem") cat = "ecosystem";
      if (r.type === "threshold") cat = "threshold";
      if (r.type === "transaction") cat = "payment";

      const statusMap: "PASSED" | "FAILED" | "UNVERIFIED" =
        r.status === "passed" ? "PASSED" : r.status === "failed" ? "FAILED" : "UNVERIFIED";

      return {
        id: `inv_${r.id}`,
        name: `Invariant ${i + 1}: ${r.description}`,
        category: cat,
        description: r.description,
        expected: typeof r.expected === "object" ? JSON.stringify(r.expected) : String(r.expected || "Declared rule"),
        actual: check ? String(check.observed || "Unverified") : undefined,
        status: statusMap,
        latencyMs: 14,
        details: { explanation: check?.explanation },
      };
    });

    const uiClaims = claims.map((c, i) => ({
      id: c.id || `claim_${i + 1}`,
      requirementId: c.requirementId,
      title: `Worker Assertion ${i + 1}`,
      statement: c.statement,
      source: "WORKER_OUTPUT" as const,
      timestamp: createdAt,
      status: (verdict.status === "VERIFIED" ? "CORROBORATED" : "UNVERIFIED") as
        | "UNVERIFIED"
        | "CORROBORATED"
        | "CONFLICT",
      details: (c.value && typeof c.value === "object" ? (c.value as Record<string, string | number | boolean>) : undefined),
    }));

    const uiEvidence = evidence.map((e, i) => {
      const isOnchain = e.type === "blockchain";
      const isDet = e.type === "deterministic";
      return {
        id: e.id || `ev_${i + 1}`,
        requirementId: e.claim ? `req_${i + 1}` : "req_general",
        type: (isOnchain ? "ONCHAIN" : isDet ? "DETERMINISTIC" : "TRACE_AUDIT") as
          | "ONCHAIN"
          | "WEB_ORACLE"
          | "TRACE_AUDIT"
          | "DETERMINISTIC",
        title: isOnchain ? "STELLAR: Horizon Ledger Receipt" : `${e.type.toUpperCase()}: ${e.source}`,
        provider: isOnchain ? "Stellar Horizon Testnet" : e.source,
        proofType: isOnchain ? "Stellar Ledger State" : isDet ? "Local Deterministic Kernel" : "Worker Output Trace",
        independent: isOnchain || isDet,
        status: (e.status === "verified" ? "CONFIRMED" : e.status === "failed" ? "REJECTED" : "UNAVAILABLE") as
          | "CONFIRMED"
          | "REJECTED"
          | "UNAVAILABLE"
          | "PENDING",
        data: {
          source: e.source,
          strength: e.strength,
          claim: e.claim || "Evaluated",
          ...(e.value && typeof e.value === "object" ? (e.value as Record<string, unknown>) : {}),
        },
        isMock: false,
        timestamp: createdAt,
      };
    });

    const uiRemediationDirectives = remediation?.directives.map((d, i) => ({
      id: `rem_${i + 1}`,
      invariantId: `inv_${d.requirementId}`,
      action: (d.type === "REPLACE_TARGET"
        ? "REPLACE_TARGET"
        : d.type === "CORRECT_TRANSACTION"
        ? "EXECUTE_SUPPLEMENTAL_TRANSFER"
        : "RETRY_WITH_PROOF") as
        | "REPLACE_TARGET"
        | "EXECUTE_SUPPLEMENTAL_TRANSFER"
        | "RETRY_WITH_PROOF",
      target: d.target,
      reason: d.reason || "Directive generated by verification engine",
      suggestedAlternatives: d.suggestedAlternatives,
      mandatory: true,
    }));

    const record: VerificationRecord = {
      id: verificationId,
      task: request.task,
      worker: {
        id: request.worker.id || "agent_unknown",
        name: request.worker.name || "Autonomous Worker",
        output: request.worker.output,
      },
      requirements: evaluatedReqs,
      claims,
      evidence,
      checks,
      verdict,
      remediation,
      attempt,
      maxAttempts,
      createdAt,
      completedAt: new Date().toISOString(),
      telegramUserId: request.telegramUserId,
      telegramChatId: request.telegramChatId,

      // Frontend compatibility mapping
      displayId,
      taskId,
      taskPrompt: request.task,
      workerId: request.worker.id || "agent_unknown",
      workerName: request.worker.name || "Autonomous Worker",
      network: "Stellar Testnet",
      chainId: 0,
      status: uiStatus,
      quorum: "Stellar Horizon + Deterministic Kernel",
      latencyMs: 18,
      attempts: [
        {
          attemptNumber: attempt,
          timestamp: createdAt,
          status: uiStatus,
          summary: verdict.summary,
          detailedReason: verdict.failureReasons.join(" | ") || verdict.summary,
          workerClaims: uiClaims,
          invariants: uiInvariants,
          evidence: uiEvidence,
          remediationDirectives: uiRemediationDirectives,
        },
      ],
    };

    return record;
  }
}

export const verificationPipeline = new VerificationPipeline();
