import test from "node:test";
import assert from "node:assert/strict";
import { VerificationPipeline } from "../verification/pipeline.ts";
import { stellarRpcProvider } from "../verification/evidenceProviders/stellarRpcProvider.ts";

const pipeline = new VerificationPipeline();

// Real live Stellar Testnet transaction artifacts confirmed on ledger
const RECIPIENT_ADDRESS = "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L";
const DECEPTIVE_TX_HASH = "108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759";
const CORRECT_TX_HASH = "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";

test("Live Stellar RPC Test 1: Direct Stellar RPC Provider queries live Testnet transaction", async () => {
  const txData = await stellarRpcProvider.getTransaction(DECEPTIVE_TX_HASH);

  assert.ok(txData, "Transaction must be found via Stellar RPC");
  assert.equal(txData.exists, true, "Transaction exists on Stellar Testnet");
  assert.equal(txData.successful, true, "Transaction succeeded on ledger");
  assert.equal(txData.destinationAccount, RECIPIENT_ADDRESS, "Destination matches recipient");
  assert.equal(txData.assetCode, "USDC", "Asset code matches USDC");
  assert.equal(txData.amount, 0.5, "Real transferred amount must be 0.5 USDC");
  assert.ok(txData.ledger && txData.ledger > 0, "Valid ledger number returned");
});

test("Live Stellar RPC Test 2: CRITICAL ACCEPTANCE TEST — Deceptive Worker (Claims 5 USDC, Actual 0.5 USDC)", async () => {
  const task = `Send 5 USDC to ${RECIPIENT_ADDRESS}.`;
  const workerOutput = `Payment completed. I sent 5 USDC to ${RECIPIENT_ADDRESS} via transaction ${DECEPTIVE_TX_HASH}.`;

  const record = await pipeline.run({
    task,
    worker: {
      id: "deceptive-agent-01",
      name: "Deceptive Settler",
      output: workerOutput,
    },
  });

  // 1. Overall verdict MUST be FAILED
  assert.equal(record.verdict.status, "FAILED", "Deceptive payment must result in FAILED verdict");

  // 2. Locate the transaction check
  const txCheck = record.checks.find((c) => {
    const req = record.requirements.find((r) => r.id === c.requirementId);
    return req?.type === "transaction";
  });

  assert.ok(txCheck, "Transaction check must be present");
  assert.equal(txCheck.status, "failed", "Deterministic payment check must fail");

  // 3. Check MUST include exact structured explanation:
  // Expected: 5 USDC
  // Observed: 0.5 USDC
  // Difference: -4.5 USDC
  assert.ok(
    txCheck.explanation.includes("Expected: 5 USDC"),
    "Explanation must state Expected: 5 USDC"
  );
  assert.ok(
    txCheck.explanation.includes("Observed: 0.5 USDC"),
    "Explanation must state Observed: 0.5 USDC"
  );
  assert.ok(
    txCheck.explanation.includes("Difference: -4.5 USDC"),
    "Explanation must state Difference: -4.5 USDC"
  );

  // 4. Evidence MUST be independent evidence from Stellar RPC
  const stellarEvidence = record.evidence.find((e) => e.source === "stellar_rpc");
  assert.ok(stellarEvidence, "Independent evidence from Stellar RPC must be captured");
  assert.equal((stellarEvidence.value as any).amount, 0.5, "Independent evidence captures real 0.5 USDC amount");
  assert.equal((stellarEvidence.value as any).destinationAccount, RECIPIENT_ADDRESS, "Independent evidence captures destination");
});

test("Live Stellar RPC Test 3: ACCEPTANCE TEST — Valid Worker (Claims 5 USDC, Actual 5 USDC) -> VERIFIED", async () => {
  const task = `Send 5 USDC to ${RECIPIENT_ADDRESS}.`;
  const workerOutput = `Payment completed. I sent 5 USDC to ${RECIPIENT_ADDRESS} via transaction ${CORRECT_TX_HASH}.`;

  const record = await pipeline.run({
    task,
    worker: {
      id: "honest-agent-01",
      name: "Honest Settler",
      output: workerOutput,
    },
  });

  // 1. Overall verdict MUST be VERIFIED
  assert.equal(record.verdict.status, "VERIFIED", "Accurate payment must result in VERIFIED verdict");

  // 2. Locate transaction check
  const txCheck = record.checks.find((c) => {
    const req = record.requirements.find((r) => r.id === c.requirementId);
    return req?.type === "transaction";
  });

  assert.ok(txCheck, "Transaction check must be present");
  assert.equal(txCheck.status, "passed", "Payment check must PASS");
  assert.ok(txCheck.explanation.includes("Observed: 5 USDC"), "Observed amount is 5 USDC");
  assert.ok(txCheck.explanation.includes("Difference: +0.0 USDC") || txCheck.explanation.includes("Difference: 0.0 USDC") || txCheck.explanation.includes("Payment verified"), "Zero deficit confirmed");

  // 3. Evidence verified
  const stellarEvidence = record.evidence.find((e) => e.source === "stellar_rpc");
  assert.ok(stellarEvidence, "Independent Stellar RPC evidence recorded");
  assert.equal((stellarEvidence.value as any).amount, 5.0, "Captured exactly 5.0 USDC");
});
