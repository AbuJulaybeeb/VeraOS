import test from "node:test";
import assert from "node:assert/strict";
import { verificationPipeline } from "../verification/pipeline.ts";
import { requirementExtractor } from "../verification/requirementExtractor.ts";
import { claimExtractor } from "../verification/claimExtractor.ts";
import { logEvidenceProvider } from "../verification/evidenceProviders/logEvidenceProvider.ts";

test("Log Audit Agent: RequirementExtractor parses payment log volume, failed charges, and duplicate invariants", () => {
  const prompt = "Reconcile payment logs for batch_2026_09_22: verify total volume of $12,450, failed charges <= 2, and 0 duplicate payout IDs.";
  const reqs = requirementExtractor.extract(prompt);

  const reconReq = reqs.find((r) => r.type === "reconciliation");
  assert.ok(reconReq, "Should extract volume reconciliation requirement");
  assert.equal((reconReq?.expected as Record<string, unknown>)?.value, 12450);

  const failReq = reqs.find((r) => r.type === "log_audit" && (r.expected as Record<string, unknown>)?.metric === "failed_count");
  assert.ok(failReq, "Should extract failed charges limit requirement");
  assert.equal((failReq?.expected as Record<string, unknown>)?.max, 2);

  const dupReq = reqs.find((r) => r.type === "log_audit" && (r.expected as Record<string, unknown>)?.metric === "duplicate_count");
  assert.ok(dupReq, "Should extract zero duplicates requirement");
  assert.equal((dupReq?.expected as Record<string, unknown>)?.max, 0);
});

test("Log Audit Agent: ClaimExtractor parses processed count, volume, and failure claims", () => {
  const reqs = requirementExtractor.extract("Reconcile payment logs for batch_2026_09_22: verify volume $12,450");
  const output = "Reconciled 100 charges. Total volume: $12,450.00 USD. Found 2 failed charges ($235.00 total). 0 duplicates detected.";
  const claims = claimExtractor.extract(output, reqs);

  const logClaim = claims.find((c) => (c.value as Record<string, unknown>)?.processedCount === 100);
  assert.ok(logClaim, "Should extract log audit summary claim");
  assert.equal((logClaim?.value as Record<string, unknown>)?.volume, 12450);
  assert.equal((logClaim?.value as Record<string, unknown>)?.failedCount, 2);
  assert.equal((logClaim?.value as Record<string, unknown>)?.duplicateCount, 0);
});

test("Log Audit Agent: Accurate reconciliation verifies to VERIFIED deterministically", async () => {
  const record = await verificationPipeline.run({
    task: "Reconcile payment logs for batch_2026_09_22: verify total volume of $12,450, failed charges <= 2, and 0 duplicate payout IDs.",
    worker: {
      id: "payment_reconciler_bot",
      output: "Reconciled 100 charges. Total volume: $12,450.00 USD. Found 2 failed charges ($235.00 total). 0 duplicates detected. Settlement balanced.",
    },
  });

  assert.equal(record.verdict.status, "VERIFIED");
  assert.equal(record.verdict.failed, 0);

  const logEvidence = record.evidence.find((e) => e.type === "log_artifact");
  assert.ok(logEvidence, "Evidence must include log_artifact");
});

test("Log Audit Agent: Deceptive worker hiding failed charges is rejected with RECONCILE_DISCREPANCY directive", async () => {
  const record = await verificationPipeline.run({
    task: "Reconcile payment logs for batch_2026_09_22: verify total volume of $12,450, failed charges <= 2, and 0 duplicate payout IDs.",
    worker: {
      id: "dishonest_monitor",
      output: "Reconciled 100 charges. Total volume: $12,450.00 USD. Found 0 failed charges ($0.00). 0 duplicates detected.",
    },
  });

  assert.equal(record.verdict.status, "FAILED");
  assert.ok(record.remediation, "Must emit remediation packet");

  const reconDirective = record.remediation?.directives.find((d) => d.type === "RECONCILE_DISCREPANCY");
  assert.ok(reconDirective, "Should emit RECONCILE_DISCREPANCY directive");
  assert.ok(reconDirective?.reason?.includes("ch_fail_0099") || reconDirective?.reason?.includes("detected 2 failed charges"));
});

test("Log Audit Agent: Duplicate transaction ID detection triggers invariant breach", () => {
  const logsWithDuplicate = [
    { id: "ch_001", amount: 100, status: "succeeded" as const },
    { id: "ch_002", amount: 200, status: "succeeded" as const },
    { id: "ch_001", amount: 100, status: "succeeded" as const }, // duplicate
  ];
  const truth = logEvidenceProvider.evaluateLogs(logsWithDuplicate);
  assert.equal(truth.duplicateCount, 1);
  assert.deepEqual(truth.duplicateIds, ["ch_001"]);
});
