import test from "node:test";
import assert from "node:assert/strict";
import { verificationPipeline } from "../verification/pipeline.ts";
import { requirementExtractor } from "../verification/requirementExtractor.ts";
import { claimExtractor } from "../verification/claimExtractor.ts";
import { checkEngine } from "../verification/checkEngine.ts";
import { verdictEngine } from "../verification/verdictEngine.ts";
import { remediationEngine } from "../verification/remediationEngine.ts";


test("Test 1 — Basic successful structure: Task requires 3 items, worker provides 3 items", async () => {
  const task = "Find 3 Base lending protocols with TVL above $10M and pay yourself 5 USDC after completing the task.";
  const workerOutput = `I found three protocols:
1. Seamless — $12M TVL
2. Moonwell — $45M TVL
3. Overnight — $12M TVL`;

  const reqs = requirementExtractor.extract(task);
  const countReq = reqs.find((r) => r.type === "count");
  assert.ok(countReq, "Count requirement must be extracted");
  assert.equal(countReq.expected, 3, "Expected count should be 3");

  const claims = claimExtractor.extract(workerOutput, reqs);
  const { checks } = await checkEngine.executeChecks(reqs, claims, {
    task,
    workerOutput,
  });

  const countCheck = checks.find((c) => c.requirementId === countReq.id);
  assert.ok(countCheck, "Count check must exist");
  assert.equal(countCheck.status, "passed", "Count check must pass when 3 items are provided");
  assert.equal(countCheck.observed, 3, "Observed count must be 3");
});

test("Test 2 — Missing result: Task requires 3, worker provides 2", async () => {
  const task = "Find 3 Base lending protocols with TVL above $10M";
  const workerOutput = `I found two protocols:
1. Seamless — $12M TVL
2. Moonwell — $45M TVL`;

  const reqs = requirementExtractor.extract(task);
  const countReq = reqs.find((r) => r.type === "count");
  assert.ok(countReq, "Count requirement must be extracted");

  const claims = claimExtractor.extract(workerOutput, reqs);
  const { checks } = await checkEngine.executeChecks(reqs, claims, {
    task,
    workerOutput,
  });

  const countCheck = checks.find((c) => c.requirementId === countReq.id);
  assert.ok(countCheck, "Count check must exist");
  assert.equal(countCheck.status, "failed", "Count check must fail when only 2 items are provided");
  assert.equal(countCheck.observed, 2, "Observed count should be 2");
});

test("Test 3 — Missing transaction hash: Payment required, worker claims payment but gives no tx hash", async () => {
  const task = "Pay yourself 5 USDC after completing the task.";
  const workerOutput = "I completed the payment and sent 5 USDC.";

  const reqs = requirementExtractor.extract(task);
  const txReq = reqs.find((r) => r.type === "transaction");
  assert.ok(txReq, "Transaction requirement must be extracted");

  const claims = claimExtractor.extract(workerOutput, reqs);
  const { checks } = await checkEngine.executeChecks(reqs, claims, {
    task,
    workerOutput,
  });

  const txCheck = checks.find((c) => c.requirementId === txReq.id);
  assert.ok(txCheck, "Transaction check must exist");
  assert.equal(
    txCheck.status,
    "unverifiable",
    "Transaction check must be unverifiable when worker omits transaction hash"
  );
  assert.ok(
    txCheck.explanation.includes("omitted an onchain transaction hash"),
    "Explanation must detail that transaction hash was omitted"
  );
});

test("Test 4 — Wrong payment amount: Worker claims 5 USDC, deterministic evidence says 0.5 USDC", async () => {
  const task = "Pay yourself 5 USDC after completing the task.";
  const workerOutput = "Sent 5.0 USDC -> recipient 0x3f982...48a TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd";

  const reqs = requirementExtractor.extract(task);
  const txReq = reqs.find((r) => r.type === "transaction");
  assert.ok(txReq, "Transaction requirement must be extracted");

  const claims = claimExtractor.extract(workerOutput, reqs);
  // Pass deterministic override simulating verified receipt of 0.5 USDC (e.g. from Base provider)
  const { checks } = await checkEngine.executeChecks(reqs, claims, {
    task,
    workerOutput,
    options: {
      deterministicOverride: {
        actualPaymentAmount: 0.5,
        actualPaymentToken: "USDC",
      },
    },
  });

  const txCheck = checks.find((c) => c.requirementId === txReq.id);
  assert.ok(txCheck, "Transaction check must exist");
  assert.equal(txCheck.status, "failed", "Transaction check must fail when amount is deficient");
  assert.ok(
    txCheck.explanation.includes("Payment mismatch"),
    "Explanation must state payment mismatch"
  );

  // Check that verdict reflects failure
  const verdict = verdictEngine.synthesizeVerdict(checks);
  assert.equal(verdict.status, "FAILED", "Overall verdict must be FAILED when payment is deficient");
});

test("Test 5 — Remediation: Failed requirement generates a specific remediation directive", async () => {
  const task = "Find 3 Base lending protocols with TVL above $10M and pay yourself 5 USDC.";
  const workerOutput = `I found two protocols:
Seamless — $12M TVL
Moonwell — $45M TVL
Sent 5.0 USDC TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd`;

  const reqs = requirementExtractor.extract(task);
  const claims = claimExtractor.extract(workerOutput, reqs);
  const { checks, requirements: updatedReqs } = await checkEngine.executeChecks(reqs, claims, {
    task,
    workerOutput,
    options: {
      deterministicOverride: {
        actualPaymentAmount: 0.5,
        actualPaymentToken: "USDC",
      },
    },
  });

  const remediation = remediationEngine.generateRemediation(updatedReqs, checks, 1, 3);
  assert.ok(remediation, "Remediation packet must be generated for failed requirements");
  assert.equal(remediation.status, "FAIL");
  assert.equal(remediation.retryable, true);
  assert.ok(remediation.directives.length > 0, "Directives must be non-empty");

  const countDirective = remediation.directives.find((d) => d.type === "SUPPLY_MISSING_RESULTS");
  assert.ok(countDirective, "Must generate SUPPLY_MISSING_RESULTS directive for missing protocol");

  const paymentDirective = remediation.directives.find((d) => d.type === "CORRECT_TRANSACTION");
  assert.ok(paymentDirective, "Must generate CORRECT_TRANSACTION directive for deficient payment");
});

test("Test 6 — Final Acceptance Scenario (Section 22 Benchmark)", async () => {
  const task = "Find 3 Base lending protocols with TVL above $10M and pay yourself 5 USDC after completing the task.";
  const workerOutput = `I found three protocols:

Seamless — $12M TVL
Moonwell — $45M TVL
Overnight — $12M TVL

I completed the payment and sent 5 USDC.`;

  const record = await verificationPipeline.run({
    task,
    worker: {
      id: "researchbot",
      name: "ResearchBot",
      output: workerOutput,
    },
  });

  // P0 must NOT blindly return VERIFIED
  assert.notEqual(record.verdict.status, "VERIFIED", "P0 must not declare VERIFIED without independent proofs");

  // It should identify:
  // - 3 results -> structurally satisfied
  // - Base -> claim detected
  // - lending -> claim detected
  // - TVL -> requires independent evidence
  // - payment -> requires independent evidence
  assert.ok(
    record.verdict.status === "PARTIAL" || record.verdict.status === "UNVERIFIABLE",
    `Status must be PARTIAL or UNVERIFIABLE, observed: ${record.verdict.status}`
  );

  const countCheck = record.checks.find((c) => c.requirementId === "r1");
  assert.equal(countCheck?.status, "passed", "Count of 3 protocols must be passed");

  const ecoCheck = record.checks.find((c) => c.requirementId === "r2");
  assert.equal(ecoCheck?.status, "passed", "Base ecosystem must be passed");

  const catCheck = record.checks.find((c) => c.requirementId === "r3");
  assert.equal(catCheck?.status, "passed", "Lending category must be passed");

  const threshCheck = record.checks.find((c) => c.requirementId === "r4");
  assert.equal(threshCheck?.status, "unverifiable", "TVL threshold must be unverifiable without web oracle");

  const txCheck = record.checks.find((c) => c.requirementId === "r5");
  assert.equal(txCheck?.status, "unverifiable", "Payment must be unverifiable without tx hash or onchain proof");

  assert.equal(record.verdict.passed, 3, "3 structural requirements must be passed");
  assert.equal(record.verdict.unverifiable, 2, "2 requirements must be unverifiable");

  assert.ok(
    record.verdict.summary.includes("3 structural requirements satisfied"),
    "Summary must state 3 structural requirements satisfied"
  );
});
