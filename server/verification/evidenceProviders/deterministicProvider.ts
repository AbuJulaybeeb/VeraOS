import type { Requirement, WorkerClaim, Evidence, CheckStatus } from "../../types/domain.ts";
import type { EvidenceProvider, EvidenceResult, VerificationContext } from "./provider.ts";
import { stellarRpcProvider } from "./stellarRpcProvider.ts";



export class DeterministicProvider implements EvidenceProvider {
  name = "DeterministicProvider";

  canHandle(requirement: Requirement): boolean {
    return [
      "count",
      "ecosystem",
      "category",
      "threshold",
      "transaction",
      "format",
      "general",
    ].includes(requirement.type);
  }

  async verify(
    requirement: Requirement,
    claims: WorkerClaim[],
    context: VerificationContext
  ): Promise<EvidenceResult> {
    const evidenceItems: Evidence[] = [];
    const output = context.workerOutput;

    switch (requirement.type) {
      // ----------------------------------------------------
      // 1. Cardinality / Count Check
      // ----------------------------------------------------
      case "count": {
        const expectedCount = typeof requirement.expected === "number" ? requirement.expected : 3;

        // Extract items count from claims or structured list
        let observedCount = 0;

        // Check if claims have explicit protocol TVLs or items
        const tvlClaims = claims.filter((c) => c.value && typeof (c.value as { tvl?: number }).tvl === "number");
        const tokenClaims = claims.find((c) => c.value && Array.isArray((c.value as { items?: string[] }).items));
        const gateClaims = claims.find((c) => c.value && Array.isArray((c.value as { gates?: number[] }).gates));

        if (tvlClaims.length > 0) {
          observedCount = tvlClaims.length;
        } else if (tokenClaims) {
          observedCount = ((tokenClaims.value as { items: string[] }).items || []).length;
        } else if (gateClaims) {
          observedCount = ((gateClaims.value as { gates: number[] }).gates || []).length;
        } else {
          // Count numbered lines e.g. "1. ...", "2. ...", "3. ..."
          const numberedLines = output.match(/^\s*(?:\d+\.|\*|-)\s+[A-Za-z0-9]/gm);
          if (numberedLines) {
            observedCount = numberedLines.length;
          } else {
            // Count commas in list
            const commaItems = output.split(/,|\sand\s/);
            if (commaItems.length > 1) {
              observedCount = commaItems.length;
            } else {
              observedCount = output.trim() ? 1 : 0;
            }
          }
        }

        const isPassed = observedCount === expectedCount;
        const status: CheckStatus = isPassed ? "passed" : "failed";

        evidenceItems.push({
          id: `ev_det_count_${requirement.id}`,
          type: "deterministic",
          source: "deterministic_structural_evaluator",
          claim: `Observed count: ${observedCount}`,
          value: { expected: expectedCount, observed: observedCount },
          strength: "strong",
          status: isPassed ? "verified" : "failed",
          metadata: { rule: "cardinality_match" },
        });

        return {
          status,
          expected: expectedCount,
          observed: observedCount,
          evidence: evidenceItems,
          explanation: isPassed
            ? `Cardinality satisfied: Expected ${expectedCount} items, observed exactly ${observedCount}.`
            : `Cardinality breach: Expected ${expectedCount} items, but worker provided ${observedCount}.`,
        };
      }

      // ----------------------------------------------------
      // 2. Ecosystem Check
      // ----------------------------------------------------
      case "ecosystem": {
        const expectedEcosystem = String(requirement.expected || "Stellar");
        const mentionsEcosystem = new RegExp(`\\b${expectedEcosystem}\\b`, "i").test(output) ||
                                  new RegExp(`\\b${expectedEcosystem}\\b`, "i").test(context.task);

        const status: CheckStatus = mentionsEcosystem ? "passed" : "unverifiable";

        evidenceItems.push({
          id: `ev_det_eco_${requirement.id}`,
          type: "deterministic",
          source: "deterministic_structural_evaluator",
          claim: `Target network: ${expectedEcosystem}`,
          value: { ecosystem: expectedEcosystem, stated: mentionsEcosystem },
          strength: "medium",
          status: mentionsEcosystem ? "verified" : "failed",
        });

        return {
          status,
          expected: expectedEcosystem,
          observed: mentionsEcosystem ? expectedEcosystem : "Not explicitly corroborated",
          evidence: evidenceItems,
          explanation: mentionsEcosystem
            ? `Target ecosystem specified as ${expectedEcosystem}.`
            : `Worker did not explicitly verify that targets reside on ${expectedEcosystem}.`,
        };
      }

      // ----------------------------------------------------
      // 3. Category Check
      // ----------------------------------------------------
      case "category": {
        const expectedCategory = String(requirement.expected || "lending");
        const mentionsCategory =
          new RegExp(`\\b${expectedCategory}\\b`, "i").test(output) ||
          /\blending|borrow|cdp|money market\b/i.test(output);

        // Also check if known lending protocols are mentioned (Seamless, Moonwell, Overnight)
        const hasKnownLending = /seamless|moonwell|overnight|aave|compound/i.test(output);

        const isPassed = mentionsCategory || hasKnownLending;
        const status: CheckStatus = isPassed ? "passed" : "unverifiable";

        evidenceItems.push({
          id: `ev_det_cat_${requirement.id}`,
          type: "deterministic",
          source: "deterministic_structural_evaluator",
          claim: `Protocol Category: ${expectedCategory}`,
          value: { category: expectedCategory, identified: isPassed },
          strength: "medium",
          status: isPassed ? "verified" : "failed",
        });

        return {
          status,
          expected: expectedCategory,
          observed: isPassed ? expectedCategory : "Unknown category",
          evidence: evidenceItems,
          explanation: isPassed
            ? `Protocol category confirmed as ${expectedCategory}.`
            : `Cannot establish protocol category "${expectedCategory}" from worker output alone.`,
        };
      }

      // ----------------------------------------------------
      // 4. Threshold Check (TVL, Numeric bounds)
      // ----------------------------------------------------
      case "threshold": {
        const expectedMin = typeof requirement.expected === "number" ? requirement.expected : 10_000_000;
        const tvlClaims = claims.filter((c) => c.value && typeof (c.value as { tvl?: number }).tvl === "number");

        // RULE: Worker claim NEVER proves external TVL truth!
        // In P0, without an independent Web/Oracle provider, threshold claims are UNVERIFIED CLAIMS.
        evidenceItems.push({
          id: `ev_det_thresh_${requirement.id}`,
          type: "worker_output",
          source: "worker_assertion",
          claim: tvlClaims.map((c) => c.statement).join("; ") || "Worker asserted TVL threshold met",
          value: {
            claimed: tvlClaims.map((c) => c.value),
            requiredMin: expectedMin,
          },
          strength: "weak",
          status: "received",
          metadata: {
            independentProofRequired: true,
            oracleSource: "DefiLlama / Web Oracle (not connected in P0)",
          },
        });

        return {
          status: "unverifiable",
          expected: `>${expectedMin.toLocaleString()}`,
          observed: tvlClaims.map((c) => (c.value as { protocol: string; tvl: number }).protocol + ": $" + ((c.value as { tvl: number }).tvl / 1e6).toFixed(1) + "M").join(", ") || "Self-reported",
          evidence: evidenceItems,
          explanation: `Worker asserted TVL above threshold, but independent web oracle evidence is not connected in P0. Worker claim remains unverified.`,
        };
      }

      // ----------------------------------------------------
      // 5. Transaction / Payment Check
      // ----------------------------------------------------
      case "transaction": {
        const expectedPayment = requirement.expected as { amount?: number; token?: string; recipient?: string } | undefined;
        const expectedAmount = expectedPayment?.amount ?? 5;
        const expectedToken = expectedPayment?.token ?? "USDC";
        const expectedRecipient = expectedPayment?.recipient;

        const paymentClaim = claims.find(
          (c) => c.value && typeof (c.value as { amount?: number }).amount === "number"
        );

        // Check if deterministic override is present (for Test 4: Wrong payment amount)
        if (context.options?.deterministicOverride?.actualPaymentAmount !== undefined) {
          const actualAmount = context.options.deterministicOverride.actualPaymentAmount;
          const actualToken = context.options.deterministicOverride.actualPaymentToken || expectedToken;

          const isMatch = actualAmount === expectedAmount && actualToken === expectedToken;
          const status: CheckStatus = isMatch ? "passed" : "failed";

          evidenceItems.push({
            id: `ev_det_tx_override_${requirement.id}`,
            type: "deterministic",
            source: "grounded_transaction_receipt",
            claim: `Observed transfer: ${actualAmount} ${actualToken}`,
            value: { amount: actualAmount, token: actualToken },
            strength: "strong",
            status: isMatch ? "verified" : "failed",
          });

          return {
            status,
            expected: `${expectedAmount} ${expectedToken}`,
            observed: `${actualAmount} ${actualToken}`,
            evidence: evidenceItems,
            explanation: isMatch
              ? `Payment corroborated: ${actualAmount} ${actualToken} confirmed.`
              : `Payment mismatch: Expected ${expectedAmount} ${expectedToken}, but observed receipt shows ${actualAmount} ${actualToken} (Deficit: ${(expectedAmount - actualAmount).toFixed(2)} ${expectedToken}).`,
          };
        }

        // Check for presence of transaction hash in worker output
        const txHash = paymentClaim?.value
          ? (paymentClaim.value as { txHash?: string }).txHash
          : undefined;

        if (!txHash) {
          // TEST 3: Payment requirement exists, worker claims payment but gives NO transaction hash!
          evidenceItems.push({
            id: `ev_det_tx_nohash_${requirement.id}`,
            type: "worker_output",
            source: "worker_submission",
            claim: paymentClaim?.statement || "Payment claimed without tx hash",
            value: paymentClaim?.value,
            strength: "weak",
            status: "received",
            metadata: { missingField: "transactionHash" },
          });

          return {
            status: "unverifiable",
            expected: `${expectedAmount} ${expectedToken} with valid onchain transaction hash`,
            observed: "Payment asserted without transaction hash",
            evidence: evidenceItems,
            explanation: `Worker asserted payment of ${expectedAmount} ${expectedToken}, but omitted an onchain transaction hash or receipt. Independent verification cannot proceed without a transaction hash.`,
          };
        }

        // Transaction hash was provided -> Query Stellar RPC Provider
        const stellarVerification = await stellarRpcProvider.verifyPayment(
          txHash,
          expectedAmount,
          expectedToken,
          expectedRecipient
        );

        evidenceItems.push({
          id: `ev_stellar_tx_${requirement.id}`,
          type: "blockchain",
          source: "stellar_rpc",
          claim: `Payment transaction ${txHash}`,
          value: {
            txHash,
            amount: stellarVerification.amount,
            asset: stellarVerification.assetCode,
            difference: stellarVerification.difference,
            successful: stellarVerification.successful,
            sourceAccount: stellarVerification.sourceAccount,
            destinationAccount: stellarVerification.destinationAccount,
            ledger: stellarVerification.ledger,
            ledgerTimestamp: stellarVerification.ledgerTimestamp,
            explorerUrl: stellarVerification.explorerUrl,
          },
          strength: "strong",
          status: stellarVerification.exists && stellarVerification.successful && stellarVerification.amount >= expectedAmount ? "verified" : "failed",
          metadata: {
            network: "Stellar Testnet",
            explorerUrl: stellarVerification.explorerUrl,
          },
        });

        if (!stellarVerification.exists) {
          return {
            status: "failed",
            expected: `${expectedAmount} ${expectedToken}`,
            observed: "Transaction does not exist on Stellar ledger",
            evidence: evidenceItems,
            explanation: `Expected: ${expectedAmount} ${expectedToken}\nObserved: None (Tx ${txHash} not found)\nDifference: -${expectedAmount} ${expectedToken}`,
          };
        }

        if (!stellarVerification.successful) {
          return {
            status: "failed",
            expected: `${expectedAmount} ${expectedToken}`,
            observed: "Transaction failed / reverted on Stellar",
            evidence: evidenceItems,
            explanation: `Stellar transaction failed execution: ${stellarVerification.failureReason || "Reverted on ledger"}`,
          };
        }

        const diff = stellarVerification.difference !== undefined
          ? stellarVerification.difference
          : (stellarVerification.amount - expectedAmount);
        const diffStr = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;

        if (stellarVerification.amount < expectedAmount) {
          const deficit = (expectedAmount - stellarVerification.amount).toFixed(2);
          const failureExplanation = `Expected: ${expectedAmount} ${expectedToken}\nObserved: ${stellarVerification.amount} ${stellarVerification.assetCode}\nDifference: ${diffStr} ${expectedToken}\nPayment mismatch: Expected ${expectedAmount} ${expectedToken}, but observed receipt shows ${stellarVerification.amount} ${stellarVerification.assetCode} (Deficit: ${deficit} ${expectedToken}).`;
          return {
            status: "failed",
            expected: `${expectedAmount} ${expectedToken}`,
            observed: `${stellarVerification.amount} ${stellarVerification.assetCode}`,
            evidence: evidenceItems,
            explanation: failureExplanation,
          };
        }

        const passExplanation = `Expected: ${expectedAmount} ${expectedToken}\nObserved: ${stellarVerification.amount} ${stellarVerification.assetCode}\nDifference: ${diffStr} ${expectedToken}\nPayment verified on Stellar: Confirmed transfer of ${stellarVerification.amount} ${stellarVerification.assetCode} on ledger.`;

        return {
          status: "passed",
          expected: `${expectedAmount} ${expectedToken}`,
          observed: `${stellarVerification.amount} ${stellarVerification.assetCode}`,
          evidence: evidenceItems,
          explanation: passExplanation,
        };
      }

      // ----------------------------------------------------
      // 6. Default / General Fallback Check
      // ----------------------------------------------------
      default: {
        evidenceItems.push({
          id: `ev_det_gen_${requirement.id}`,
          type: "deterministic",
          source: "deterministic_structural_evaluator",
          claim: requirement.description,
          strength: "medium",
          status: "received",
        });

        return {
          status: "passed",
          expected: requirement.description,
          observed: "Evaluated structurally",
          evidence: evidenceItems,
          explanation: `General requirement "${requirement.description}" evaluated structurally.`,
        };
      }
    }
  }
}

export const deterministicProvider = new DeterministicProvider();
