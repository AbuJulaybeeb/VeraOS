import type { Requirement, WorkerClaim } from "../types/domain.ts";



export class ClaimExtractor {
  extract(workerOutput: string, requirements: Requirement[] = []): WorkerClaim[] {
    const claims: WorkerClaim[] = [];
    let claimIndex = 1;

    const trimmed = workerOutput.trim();
    if (!trimmed) {
      return [];
    }

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

    // 1. Extract Protocol TVL claims
    // Patterns:
    // "Seamless — $12M TVL", "Seamless with $12M TVL", "1. Seamless Protocol: Reported TVL $12.0M"
    // "Moonwell — $45M TVL", "Overnight — $12M TVL"
    const protocolTvlRegex =
      /(?:(?:\d+\.|\*|-)\s*)?([A-Za-z0-9\s]+?)\s*(?:—|–|-|:|\bwith\b|\bhas\b)\s*(?:Reported\s*)?\$?(\d+(?:\.\d+)?)\s*([KkMmBb])?(?:\s*TVL)?/gi;

    const foundProtocols = new Set<string>();

    for (const line of lines) {
      // If line is clearly a payment or transaction statement, do not match as protocol TVL
      if (/\b(?:sent|payment|txhash|tx:|transferred|recipient|bounty)\b/i.test(line)) {
        continue;
      }
      protocolTvlRegex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = protocolTvlRegex.exec(line)) !== null) {

        let name = match[1].trim();
        // Clean up prefixes
        name = name.replace(/^(?:I found\s+|found\s+)/i, "");
        name = name.replace(/\s+protocol$/i, "").trim();

        // Skip non-names like "dispatched" or "payment"
        if (
          !name ||
          /\b(dispatched|payment|sent|transaction|txhash|gate|gates|usdc|xlm|eth)\b/i.test(name) ||
          name.length > 30
        ) {
          continue;
        }

        const rawVal = parseFloat(match[2]);
        const multChar = (match[3] || "M").toUpperCase();
        let multiplier = 1_000_000;
        if (multChar === "K") multiplier = 1_000;
        if (multChar === "B") multiplier = 1_000_000_000;
        if (multChar === "M") multiplier = 1_000_000;

        const tvl = rawVal * multiplier;
        const key = `${name.toLowerCase()}_${tvl}`;

        if (!foundProtocols.has(key)) {
          foundProtocols.add(key);

          // Find threshold requirement if exists
          const thresholdReq = requirements.find((r) => r.type === "threshold");

          claims.push({
            id: `c${claimIndex++}`,
            requirementId: thresholdReq?.id,
            statement: `${name} has $${rawVal}${multChar} TVL`,
            value: {
              protocol: name,
              tvl,
            },
            source: "worker",
          });
        }
      }
    }

    // 2. Extract Payment / Transaction claims
    // Patterns:
    // "I completed the payment and sent 5 USDC."
    // "Sent 5.0 USDC -> recipient 0x3f982...48a"
    // "5 USDC was sent to recipient 0x71C88...9a0b"
    const paymentRegex =
      /\b(?:sent|transferred|paid|payment(?:\s+and\s+sent)?)\s+(?:exactly\s+)?(\d+(?:\.\d+)?)\s+([A-Za-z0-9]+)\b|\b(\d+(?:\.\d+)?)\s+([A-Za-z0-9]+)\s+(?:was\s+)?(?:sent|paid|transferred)\b/i;

    const paymentMatch = trimmed.match(paymentRegex);
    if (paymentMatch) {
      const amount = parseFloat(paymentMatch[1] || paymentMatch[3]);
      const token = (paymentMatch[2] || paymentMatch[4]).toUpperCase();

      // Check if tx hash is present (supports 0x-prefixed hex, bare 64-char hex, or Stellar tx hash)
      const txMatch =
        trimmed.match(/\b(?:txhash|tx|hash):\s*([0-9a-fA-F]{64}|0x[0-9a-fA-F]{16,66})\b/i) ||
        trimmed.match(/\b(0x[a-fA-F0-9]{16,66})\b/) ||
        trimmed.match(/\b([a-fA-F0-9]{64})\b/);
      const txHash = txMatch ? txMatch[1] : undefined;

      // Check recipient address (supports Stellar G-addresses or 0x-addresses)
      const recipMatch =
        trimmed.match(/\b(?:recipient|to)\s+([G][A-Z0-9]{55}|0x[a-fA-F0-9.]+)\b/i) ||
        trimmed.match(/\b([G][A-Z0-9]{55})\b/);
      const recipient = recipMatch ? recipMatch[1] : undefined;

      const txReq = requirements.find((r) => r.type === "transaction");

      claims.push({
        id: `c${claimIndex++}`,
        requirementId: txReq?.id,
        statement: `${amount} ${token} was sent${txHash ? ` (Tx: ${txHash})` : ""}`,
        value: {
          amount,
          token,
          txHash,
          recipient,
        },
        source: "worker",
      });
    } else {
      // Check if output is a direct transaction hash (e.g. pasted during /resubmit)
      const txMatch =
        trimmed.match(/\b(?:txhash|tx|hash):\s*([0-9a-fA-F]{64}|0x[0-9a-fA-F]{16,66})\b/i) ||
        trimmed.match(/\b(0x[a-fA-F0-9]{16,66})\b/) ||
        trimmed.match(/\b([a-fA-F0-9]{64})\b/);
      const txHash = txMatch ? txMatch[1] : undefined;

      const txReq = requirements.find((r) => r.type === "transaction");
      if (txHash && txReq) {
        const expectedReq = txReq.expected as { amount?: number; token?: string; recipient?: string } | undefined;
        const amount = expectedReq?.amount ?? 5;
        const token = expectedReq?.token ?? "USDC";
        const recipient = expectedReq?.recipient;

        claims.push({
          id: `c${claimIndex++}`,
          requirementId: txReq.id,
          statement: `Payment transaction submitted: ${txHash}`,
          value: {
            amount,
            token,
            txHash,
            recipient,
          },
          source: "worker",
        });
      }
    }

    // 3. Extract Token Audit item claims (e.g. "CBETH, BRETT, DEGEN")
    const tokenMatch = trimmed.match(/\b(?:contracts|tokens|audited):\s*([A-Za-z0-9\s,]+?)(?:\.|$)/i);
    if (tokenMatch && claims.length === 0) {
      const tokens = tokenMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const countReq = requirements.find((r) => r.type === "count");

      claims.push({
        id: `c${claimIndex++}`,
        requirementId: countReq?.id,
        statement: `Verified contracts: ${tokens.join(", ")}`,
        value: {
          items: tokens,
          count: tokens.length,
        },
        source: "worker",
      });
    }

    // 4. Extract Gate completions (e.g. "Gates 1, 2, and 3 completed")
    const gateMatch = trimmed.match(/\b(Gates?\s+[0-9,\sand]+)\s+(?:completed|passed)\b/i);
    if (gateMatch) {
      const gateStr = gateMatch[1];
      const numbers = gateStr.match(/\d+/g)?.map((n) => parseInt(n, 10)) || [];
      const countReq = requirements.find((r) => r.type === "count");

      claims.push({
        id: `c${claimIndex++}`,
        requirementId: countReq?.id,
        statement: `${gateStr} completed`,
        value: {
          gates: numbers,
          count: numbers.length,
        },
        source: "worker",
      });
    }

    // 5. Extract Web3 Autonomous Trade Execution Claims
    // Examples: "Swapped 50 USDC for 425 XLM on Soroswap at effective price $0.1176 (slippage 0.42%). TxHash: 46129d6b..."
    const tradeRegex =
      /\b(?:swapped|traded|exchanged|bought)\s+(\d+(?:\.\d+)?)\s*([A-Za-z0-9]+)\s+(?:for|to|with)\s+(\d+(?:\.\d+)?)\s*([A-Za-z0-9]+)(?:\s+on\s+([A-Za-z0-9_-]+))?/i;
    const tradeMatch = trimmed.match(tradeRegex);

    if (tradeMatch) {
      const inputAmount = parseFloat(tradeMatch[1]);
      const inputToken = tradeMatch[2].toUpperCase();
      const outputAmount = parseFloat(tradeMatch[3]);
      const outputToken = tradeMatch[4].toUpperCase();
      const dex = tradeMatch[5] || undefined;

      // Extract price if reported
      const priceMatch = trimmed.match(/\bprice(?:\s+of|:|\s+is|\s+at|\s+=\s*)?\s*\$?(\d+(?:\.\d+)?)\b/i);
      const reportedPrice = priceMatch ? parseFloat(priceMatch[1]) : (inputAmount / outputAmount);

      // Extract slippage if reported
      const slipMatch = trimmed.match(/\bslippage(?:\s+of|:|\s+is|\s+=\s*)?\s*(\d+(?:\.\d+)?)\s*%/i);
      const reportedSlippage = slipMatch ? parseFloat(slipMatch[1]) : 0;

      // Extract tx hash
      const txMatch =
        trimmed.match(/\b(?:txhash|tx|hash):\s*([0-9a-fA-F]{64}|0x[0-9a-fA-F]{16,66})\b/i) ||
        trimmed.match(/\b(0x[a-fA-F0-9]{16,66})\b/) ||
        trimmed.match(/\b([a-fA-F0-9]{64})\b/);
      const txHash = txMatch ? txMatch[1] : undefined;

      const tradeReq = requirements.find((r) => r.type === "trade");
      const slipReq = requirements.find((r) => r.type === "slippage");

      claims.push({
        id: `c${claimIndex++}`,
        requirementId: tradeReq?.id,
        statement: `Trade executed: ${inputAmount} ${inputToken} -> ${outputAmount} ${outputToken}${dex ? ` on ${dex}` : ""}${txHash ? ` (Tx: ${txHash})` : ""}`,
        value: {
          inputAmount,
          inputToken,
          outputAmount,
          outputToken,
          dex,
          price: reportedPrice,
          slippage: reportedSlippage,
          txHash,
        },
        source: "worker",
      });

      if (slipReq && reportedSlippage !== undefined) {
        claims.push({
          id: `c${claimIndex++}`,
          requirementId: slipReq.id,
          statement: `Reported slippage: ${reportedSlippage}%`,
          value: {
            slippage: reportedSlippage,
            txHash,
          },
          source: "worker",
        });
      }
    }

    // 6. Extract Web2 Log Monitoring & Payment Flow Reconciliation Claims
    // Examples: "Processed 1,250 charges. Total volume: $148,200.00. Found 3 failed charges ($320). 0 duplicates detected."
    const isLogClaim = /\b(?:reconciled|processed|scanned|audited)\s+(\d+(?:,\d+)*)\s*(?:charges?|payments?|transactions?|logs?|lines?)\b/i.test(trimmed);
    if (isLogClaim) {
      const procMatch = trimmed.match(/\b(?:reconciled|processed|scanned|audited)\s+(\d+(?:,\d+)*)\b/i);
      const processedCount = procMatch ? parseInt(procMatch[1].replace(/,/g, ""), 10) : 0;

      const volMatch = trimmed.match(/\b(?:volume|total|sum)\s*(?:of|:|\s+is|\s+=\s*)?\s*(?:[$€£])?\s*(\d+(?:,\d+)*(?:\.\d+)?)\b/i);
      const volume = volMatch ? parseFloat(volMatch[1].replace(/,/g, "")) : 0;

      const failMatch = trimmed.match(/\b(?:found|identified)?\s*(\d+)\s*(?:failed|error|rejected)\s*(?:charges?|payments?|transactions?)?\b/i);
      const failedCount = failMatch ? parseInt(failMatch[1], 10) : 0;

      const dupMatch = trimmed.match(/\b(\d+)\s*duplicates?\b/i) || (/\b(?:0|zero|no)\s+duplicates?\b/i.test(trimmed) ? [null, "0"] : null);
      const duplicateCount = dupMatch ? parseInt(dupMatch[1], 10) : 0;

      const reconReq = requirements.find((r) => r.type === "reconciliation");
      const logReq = requirements.find((r) => r.type === "log_audit");

      claims.push({
        id: `c${claimIndex++}`,
        requirementId: reconReq?.id || logReq?.id,
        statement: `Log audit completed: ${processedCount} entries processed, volume $${volume.toLocaleString()}, ${failedCount} failures, ${duplicateCount} duplicates`,
        value: {
          processedCount,
          volume,
          failedCount,
          duplicateCount,
        },
        source: "worker",
      });
    }

    // 5. Fallback general claim if nothing specific was isolated
    if (claims.length === 0) {
      claims.push({
        id: `c${claimIndex++}`,
        statement: trimmed.slice(0, 160),
        value: { raw: trimmed },
        source: "worker",
      });
    }

    return claims;
  }
}

export const claimExtractor = new ClaimExtractor();
