import test from "node:test";
import assert from "node:assert/strict";
import { verificationPipeline } from "../verification/pipeline.ts";
import { requirementExtractor } from "../verification/requirementExtractor.ts";
import { claimExtractor } from "../verification/claimExtractor.ts";
import { stellarProvider } from "../verification/evidenceProviders/stellarProvider.ts";
import { defaultRepository } from "../storage/memoryRepository.ts";

test("Stellar Suite 1: Requirement & Worker Claim Extraction on Stellar", async () => {
  const task =
    "Find 3 Soroban lending protocols on Stellar Testnet and send 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

  const reqs = requirementExtractor.extract(task);

  const countReq = reqs.find((r) => r.type === "count");
  assert.ok(countReq, "Count requirement must be extracted");
  assert.equal(countReq.expected, 3, "Expected protocol count is 3");

  const ecoReq = reqs.find((r) => r.type === "ecosystem");
  assert.ok(ecoReq, "Ecosystem requirement must be extracted");
  assert.equal(ecoReq.expected, "Stellar Testnet", "Ecosystem must be Stellar Testnet");

  const catReq = reqs.find((r) => r.type === "category");
  assert.ok(catReq, "Category requirement must be extracted");
  assert.equal(catReq.expected, "lending", "Category must be lending");

  const payReq = reqs.find((r) => r.type === "transaction");
  assert.ok(payReq, "Payment requirement must be extracted");
  const payExpected = payReq.expected as { amount: number; token: string; recipient?: string };
  assert.equal(payExpected.amount, 5.0, "Expected payment amount is 5.0");
  assert.equal(payExpected.token, "USDC", "Expected payment token is USDC");
  assert.equal(
    payExpected.recipient,
    "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    "Recipient address must match Stellar G-address"
  );

  const workerOutput = "I completed the task on Stellar Testnet:\n" +
    "1. Blend Capital — $18M TVL\n" +
    "2. Aquarius — $12M TVL\n" +
    "3. YieldBlox — $15M TVL\n" +
    "Sent 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd";

  const claims = claimExtractor.extract(workerOutput, reqs);
  const paymentClaim = claims.find((c) => c.value && typeof (c.value as { amount?: number }).amount === "number");
  assert.ok(paymentClaim, "Payment claim must be extracted");
  const claimVal = paymentClaim.value as {
    amount: number;
    token: string;
    recipient?: string;
    txHash?: string;
  };
  assert.equal(claimVal.amount, 5.0);
  assert.equal(claimVal.token, "USDC");
  assert.equal(claimVal.recipient, "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
  assert.equal(claimVal.txHash, "0x8a7b3c21a4de99f2b1892f3900a41cd");
});

test("Stellar Suite 2: Deceptive Worker Acceptance Test (5.0 USDC claimed, 0.5 USDC actual)", async () => {
  const task =
    "Verify 3 protocols on Stellar Testnet and send 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

  const deceptiveWorkerOutput = "I analyzed 3 protocols on Stellar:\n" +
    "1. Blend Capital — $18M TVL\n" +
    "2. Aquarius — $12M TVL\n" +
    "3. YieldBlox — $15M TVL\n" +
    "Sent 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd";

  const record = await verificationPipeline.run({
    task,
    worker: {
      id: "deceptive_worker_01",
      name: "Deceptive Worker Agent",
      output: deceptiveWorkerOutput,
    },
  });

  assert.equal(
    record.verdict.status,
    "FAILED",
    "Overall verdict MUST be FAILED when worker commits deceptive payment shortfall"
  );

  const txCheck = record.checks.find((c) => {
    const req = record.requirements.find((r) => r.id === c.requirementId);
    return req?.type === "transaction";
  });
  assert.ok(txCheck, "Transaction check must exist");
  assert.equal(txCheck.status, "failed", "Payment check must FAIL on deficit");

  assert.ok(
    txCheck.explanation.includes("Deficit: 4.50 USDC"),
    "Explanation must pinpoint exact 4.50 USDC deficit"
  );
  assert.ok(
    txCheck.explanation.includes("Expected 5 USDC, but observed receipt shows 0.5 USDC"),
    "Explanation must detail expected vs observed values"
  );

  assert.ok(record.remediation, "Remediation packet must be generated");
  assert.equal(record.remediation.status, "FAIL");
  assert.equal(record.remediation.retryable, true);
  const correctDirective = record.remediation.directives.find((d) => d.type === "CORRECT_TRANSACTION");
  assert.ok(correctDirective, "CORRECT_TRANSACTION directive must be present");
});

test("Stellar Suite 3: Missing Transaction Hash on Stellar", async () => {
  const task = "Send 5.0 USDC on Stellar testnet";
  const workerOutput = "I have successfully dispatched 5.0 USDC on Stellar testnet.";

  const record = await verificationPipeline.run({
    task,
    worker: {
      id: "worker_no_tx",
      name: "Worker Without Tx",
      output: workerOutput,
    },
  });

  const txCheck = record.checks.find((c) => {
    const req = record.requirements.find((r) => r.id === c.requirementId);
    return req?.type === "transaction";
  });
  assert.ok(txCheck, "Transaction check must exist");
  assert.equal(txCheck.status, "unverifiable", "Check must be unverifiable when tx hash is missing");
  assert.ok(
    txCheck.explanation.includes("omitted an onchain transaction hash"),
    "Explanation must explain that tx hash was omitted"
  );
});

test("Stellar Suite 4: Correction Loop (Resubmission from FAILED to VERIFIED)", async () => {
  const task =
    "Send 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 on Stellar testnet";

  const initialOutput =
    "Sent 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 TxHash: 0x8a7b3c21a4de99f2b1892f3900a41cd";

  const attempt1 = await verificationPipeline.run(
    {
      task,
      worker: {
        id: "worker_correction_test",
        name: "Correction Worker",
        output: initialOutput,
      },
    },
    1
  );

  assert.equal(attempt1.verdict.status, "FAILED", "Attempt 1 must be FAILED due to 0.5 USDC deficit");
  assert.equal(attempt1.attempt, 1);

  await defaultRepository.create(attempt1);

  const correctedOutput =
    "Sent 5.0 USDC to GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 TxHash: 0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de";

  const attempt2 = await verificationPipeline.run(
    {
      task,
      worker: {
        id: "worker_correction_test",
        name: "Correction Worker",
        output: correctedOutput,
      },
    },
    2
  );

  attempt2.id = attempt1.id;
  attempt2.attempts = [...(attempt1.attempts || []), ...(attempt2.attempts || [])];
  await defaultRepository.update(attempt2);

  assert.equal(attempt2.verdict.status, "VERIFIED", "Attempt 2 must be VERIFIED after corrected payment");
  assert.equal(attempt2.status, "PASSED", "Frontend UI status must be PASSED");
  assert.equal(attempt2.attempt, 2, "Attempt counter must be 2");

  const finalTxCheck = attempt2.checks.find((c) => {
    const req = attempt2.requirements.find((r) => r.id === c.requirementId);
    return req?.type === "transaction";
  });
  assert.ok(finalTxCheck);
  assert.equal(finalTxCheck.status, "passed", "Payment check must be passed");
  assert.ok(finalTxCheck.explanation.includes("Payment verified on Stellar"));
});

test("Stellar Suite 5: Direct StellarProvider Verification Matrix", async () => {
  const deceptive = await stellarProvider.verifyPayment(
    "0x8a7b3c21a4de99f2b1892f3900a41cd",
    5.0,
    "USDC",
    "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  );
  assert.equal(deceptive.exists, true);
  assert.equal(deceptive.amount, 0.5, "Deceptive fixture amount is 0.5");
  assert.ok(deceptive.explorerUrl.includes("stellar.expert/explorer/testnet/tx/"));

  const corrected = await stellarProvider.verifyPayment(
    "0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de",
    5.0,
    "USDC",
    "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  );
  assert.equal(corrected.exists, true);
  assert.equal(corrected.successful, true);
  assert.equal(corrected.amount, 5.0, "Corrected fixture amount is 5.0");

  const reverted = await stellarProvider.verifyPayment(
    "0xfailedtx99999999999999999999999999999999999999999999999999999999",
    5.0,
    "USDC"
  );
  assert.equal(reverted.exists, true);
  assert.equal(reverted.successful, false, "Reverted tx should have successful = false");
  assert.equal(reverted.failureReason, "tx_bad_auth");

  const mismatch = await stellarProvider.verifyPayment(
    "0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de",
    5.0,
    "USDC",
    "GWRONGRECIPIENTACCOUNT999999999999999999999999999999999999"
  );
  assert.equal(mismatch.successful, false, "Recipient mismatch should fail");
  assert.ok(mismatch.failureReason?.includes("Recipient mismatch on Stellar"));
});
