import test from "node:test";
import assert from "node:assert/strict";
import { verificationPipeline } from "../verification/pipeline.ts";
import { requirementExtractor } from "../verification/requirementExtractor.ts";
import { claimExtractor } from "../verification/claimExtractor.ts";

test("Trading Agent: RequirementExtractor parses swap, slippage, and price limit invariants", () => {
  const prompt = "Swap 50 USDC for XLM on Soroswap with slippage <= 1% when XLM price < $0.12";
  const reqs = requirementExtractor.extract(prompt);

  const tradeReq = reqs.find((r) => r.type === "trade");
  assert.ok(tradeReq, "Should extract trade requirement");
  assert.equal((tradeReq?.expected as Record<string, unknown>)?.action, "swap");
  assert.equal((tradeReq?.expected as Record<string, unknown>)?.inputAmount, 50);
  assert.equal((tradeReq?.expected as Record<string, unknown>)?.inputToken, "USDC");
  assert.equal((tradeReq?.expected as Record<string, unknown>)?.outputToken, "XLM");

  const slipReq = reqs.find((r) => r.type === "slippage");
  assert.ok(slipReq, "Should extract slippage requirement");
  assert.equal(slipReq?.expected, 1.0);

  const priceReq = reqs.find((r) => r.type === "threshold");
  assert.ok(priceReq, "Should extract price threshold requirement");
  assert.equal(priceReq?.expected, 0.12);
});

test("Trading Agent: ClaimExtractor parses trade execution, output amounts, and slippage", () => {
  const reqs = requirementExtractor.extract("Swap 50 USDC for XLM on Soroswap with slippage <= 1%");
  const output = "Swapped 50 USDC for 425 XLM on Soroswap at effective price $0.1176 (slippage 0.42%). TxHash: 0x9c4f1a28a4de99f2b1892f3900a41cd";
  const claims = claimExtractor.extract(output, reqs);

  const tradeClaim = claims.find((c) => (c.value as Record<string, unknown>)?.inputAmount === 50);
  assert.ok(tradeClaim, "Should extract trade execution claim");
  assert.equal((tradeClaim?.value as Record<string, unknown>)?.outputAmount, 425);
  assert.equal((tradeClaim?.value as Record<string, unknown>)?.outputToken, "XLM");
  assert.equal((tradeClaim?.value as Record<string, unknown>)?.slippage, 0.42);
  assert.equal((tradeClaim?.value as Record<string, unknown>)?.txHash, "0x9c4f1a28a4de99f2b1892f3900a41cd");
});

test("Trading Agent: Autonomous DEX swap verifies to VERIFIED when within slippage and price limit", async () => {
  const record = await verificationPipeline.run({
    task: "Swap 50 USDC for XLM on Soroswap with slippage <= 1% when XLM price < $0.50",
    worker: {
      id: "trader_agent_01",
      output: "Swapped 50 USDC for 425 XLM on Soroswap at effective price $0.1176 (slippage 0.42%). TxHash: 0x9c4f1a28a4de99f2b1892f3900a41cd",
    },
  });

  assert.equal(record.verdict.status, "VERIFIED");
  assert.equal(record.verdict.failed, 0);

  const tradeCheck = record.checks.find((c) => c.requirementId.includes("r") && String(c.expected).includes("50"));
  assert.ok(tradeCheck, "Trade check must exist");
  assert.equal(tradeCheck?.status, "passed");

  const slipCheck = record.checks.find((c) => String(c.expected).includes("1%"));
  assert.ok(slipCheck, "Slippage check must exist");
  assert.equal(slipCheck?.status, "passed");
});

test("Trading Agent: High slippage trade triggers FAILED verdict and CORRECT_SLIPPAGE directive", async () => {
  const record = await verificationPipeline.run({
    task: "Swap 50 USDC for XLM on Soroswap with slippage <= 1%",
    worker: {
      id: "reckless_trader",
      output: "Swapped 50 USDC for 380 XLM on Soroswap at effective price $0.1315 (slippage 2.4%). TxHash: 0xdeadbeef8888888888888888888888888888888888888888888888888888888888",
    },
  });

  assert.equal(record.verdict.status, "FAILED");
  assert.ok(record.remediation, "Remediation packet must be generated");

  const slipDirective = record.remediation?.directives.find((d) => d.type === "CORRECT_SLIPPAGE");
  assert.ok(slipDirective, "Should emit CORRECT_SLIPPAGE directive");
  assert.ok(slipDirective?.reason?.includes("Slippage breach"));
});
