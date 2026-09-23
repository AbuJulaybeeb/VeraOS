import type { Requirement } from "../types/domain.ts";



export class RequirementExtractor {
  extract(taskPrompt: string): Requirement[] {
    const requirements: Requirement[] = [];
    let reqIndex = 1;

    const trimmed = taskPrompt.trim();
    if (!trimmed) {
      return [];
    }

    // 1. Cardinality / Count Extraction
    // Examples: "Find 3 ...", "Audit 3 ERC-20 ...", "4-gate", "3 protocols"
    const countMatch =
      trimmed.match(/\b(?:find|audit|identify|select|verify|execute|inspect|review)\s+(\d+)\s+([a-zA-Z0-9_\-\s]+?)(?:\s+with|\s+on|\s+for|\s+and|\.|$)/i) ||
      trimmed.match(/\b(\d+)-gate\b/i) ||
      trimmed.match(/\b(\d+)\s+(protocols|contracts|tokens|items|gates|steps)\b/i);

    if (countMatch) {
      const count = parseInt(countMatch[1], 10);
      let targetName = countMatch[2] ? countMatch[2].trim() : "items";
      // Clean up target name
      targetName = targetName.replace(/^(base|ethereum)\s+/i, "");
      targetName = targetName.replace(/\s+(protocols|contracts|tokens|gates|steps)$/i, " $1");
      if (!targetName.includes("protocol") && !targetName.includes("contract") && !targetName.includes("gate")) {
        targetName = `${targetName} items`;
      }

      requirements.push({
        id: `r${reqIndex++}`,
        description: `Find ${count} ${targetName.toLowerCase().trim()}`,
        type: "count",
        operator: "eq",
        expected: count,
        status: "pending",
      });
    }

    // 2. Ecosystem Extraction
    // Examples: "on Stellar", "Stellar testnet", "Soroban", "on Base"
    const ecosystemMatch =
      trimmed.match(/\b(Stellar\s+Testnet|Stellar\s+Mainnet|Stellar)\b/i) ||
      trimmed.match(/\b(Soroban|Base|Ethereum|Arbitrum|Optimism|Polygon|Solana)\b/i);
    if (ecosystemMatch) {
      const ecosystem = ecosystemMatch[1];
      requirements.push({
        id: `r${reqIndex++}`,
        description: `Protocols must be on ${ecosystem}`,
        type: "ecosystem",
        operator: "eq",
        expected: ecosystem,
        status: "pending",
      });
    }

    // 3. Category Extraction
    // Examples: "lending protocols", "ERC-20", "static analysis", "DEX"
    if (/\blending\b/i.test(trimmed)) {
      requirements.push({
        id: `r${reqIndex++}`,
        description: "Protocols must be lending protocols",
        type: "category",
        operator: "eq",
        expected: "lending",
        status: "pending",
      });
    } else if (/\bERC-20\b/i.test(trimmed)) {
      requirements.push({
        id: `r${reqIndex++}`,
        description: "Targets must be ERC-20 token contracts",
        type: "category",
        operator: "eq",
        expected: "ERC-20",
        status: "pending",
      });
    } else if (/\bstatic analysis\b/i.test(trimmed) || /\bsecurity checks?\b/i.test(trimmed)) {
      requirements.push({
        id: `r${reqIndex++}`,
        description: "Must execute static analysis security checks",
        type: "category",
        operator: "eq",
        expected: "security_analysis",
        status: "pending",
      });
    }

    // 4. Threshold Extraction
    // Examples: "TVL above $10M", "TVL > $10M", "TVL of at least $10M"
    const tvlMatch = trimmed.match(
      /\bTVL\s*(?:above|>|greater than|at least|>=)\s*\$?(\d+(?:\.\d+)?)\s*([KkMmBb])?\b/i
    );
    if (tvlMatch) {
      const rawNum = parseFloat(tvlMatch[1]);
      const multiplierChar = (tvlMatch[2] || "").toUpperCase();
      let multiplier = 1;
      if (multiplierChar === "K") multiplier = 1_000;
      if (multiplierChar === "M") multiplier = 1_000_000;
      if (multiplierChar === "B") multiplier = 1_000_000_000;

      const expectedVal = rawNum * multiplier;
      const formattedDisplay = multiplierChar ? `$${rawNum}${multiplierChar}` : `$${rawNum}`;

      requirements.push({
        id: `r${reqIndex++}`,
        description: `TVL must be above ${formattedDisplay}`,
        type: "threshold",
        operator: "gt",
        expected: expectedVal,
        status: "pending",
      });
    }

    // 5. Payment / Transaction Extraction
    // Examples: "pay yourself 5 USDC", "send 5 USDC", "pay exactly 5 USDC bounty"
    const paymentMatch = trimmed.match(
      /\b(?:pay(?:\s+yourself)?|send|transfer)\s+(?:exactly\s+)?(\d+(?:\.\d+)?)\s+([A-Za-z0-9]+)\b/i
    );
    if (paymentMatch && !/\b(?:swap|exchange)\b/i.test(trimmed)) {
      const amount = parseFloat(paymentMatch[1]);
      const token = paymentMatch[2].toUpperCase();

      const recipMatch =
        trimmed.match(/\b(?:recipient|to)\s+([G][A-Z0-9]{55}|0x[a-fA-F0-9]{40})\b/i) ||
        trimmed.match(/\b([G][A-Z0-9]{55})\b/);
      const recipient = recipMatch ? recipMatch[1] : undefined;

      requirements.push({
        id: `r${reqIndex++}`,
        description: recipient
          ? `Payment must equal ${amount} ${token} to ${recipient}`
          : `Payment must equal ${amount} ${token}`,
        type: "transaction",
        operator: "eq",
        expected: {
          amount,
          token,
          ...(recipient ? { recipient } : {}),
        },
        status: "pending",
      });
    }

    // 6. Web3 Autonomous Trading Extraction (DEX Swaps, Pairs & Limits)
    // Examples: "Swap 50 USDC for XLM on Soroswap", "Trade 100 USDC to XLM", "Buy XLM with 50 USDC"
    const tradeMatch =
      trimmed.match(/\b(?:swap|exchange)\s+(\d+(?:\.\d+)?)\s*([A-Za-z0-9]+)\s+(?:for|to)\s+([A-Za-z0-9]+)(?:\s+on\s+([A-Za-z0-9_\-]+))?/i) ||
      trimmed.match(/\b(?:trade|buy)\s+([A-Za-z0-9]+)\s+(?:with|using)\s+(\d+(?:\.\d+)?)\s*([A-Za-z0-9]+)(?:\s+on\s+([A-Za-z0-9_\-]+))?/i);

    if (tradeMatch) {
      const isReverse = /\b(?:trade|buy)\s+[A-Za-z0-9]+\s+(?:with|using)/i.test(tradeMatch[0]);
      const inputAmount = parseFloat(isReverse ? tradeMatch[2] : tradeMatch[1]);
      const inputToken = (isReverse ? tradeMatch[3] : tradeMatch[2]).toUpperCase();
      const outputToken = (isReverse ? tradeMatch[1] : tradeMatch[3]).toUpperCase();
      const dex = tradeMatch[4] || tradeMatch[5] || undefined;

      requirements.push({
        id: `r${reqIndex++}`,
        description: dex
          ? `Swap ${inputAmount} ${inputToken} for ${outputToken} on ${dex}`
          : `Swap ${inputAmount} ${inputToken} for ${outputToken}`,
        type: "trade",
        operator: "eq",
        expected: {
          action: "swap",
          inputAmount,
          inputToken,
          outputToken,
          ...(dex ? { dex } : {}),
        },
        status: "pending",
      });
    }

    // 7. Slippage Tolerance Extraction
    // Examples: "slippage <= 1%", "slippage under 0.5%", "max 1% slippage", "slippage not exceeding 1%"
    const slippageMatch = trimmed.match(
      /\b(?:max(?:imum)?\s+)?(?:slippage|price\s+impact)\s*(?:<=|<|under|not exceeding|below|of at most)?\s*(\d+(?:\.\d+)?)\s*%/i
    ) || trimmed.match(/\bmax\s+(\d+(?:\.\d+)?)\s*%\s*slippage\b/i);

    if (slippageMatch) {
      const maxSlippage = parseFloat(slippageMatch[1]);
      requirements.push({
        id: `r${reqIndex++}`,
        description: `Slippage must not exceed ${maxSlippage}%`,
        type: "slippage",
        operator: "lte",
        expected: maxSlippage,
        status: "pending",
      });
    }

    // 8. Price Limit Constraint Extraction
    // Examples: "when XLM price < $0.12", "price <= $0.12", "price under $0.12"
    const priceLimitMatch = trimmed.match(
      /\bprice\s*(?:<=|<|under|below|at most)\s*\$?(\d+(?:\.\d+)?)\b/i
    );
    if (priceLimitMatch) {
      const limit = parseFloat(priceLimitMatch[1]);
      requirements.push({
        id: `r${reqIndex++}`,
        description: `Execution price must be <= $${limit}`,
        type: "threshold",
        operator: "lte",
        expected: limit,
        status: "pending",
      });
    }

    // 9. Web2 Log Monitoring & Payment Flow Reconciliation Extraction
    // Examples: "reconcile payment logs for batch_2026_09_22", "audit transaction logs", "monitor payment flow"
    const isLogAuditOrRecon = /\b(?:reconcile|audit|monitor|scan)\s+(?:payment|transaction|webhook|access|charge|order)?\s*(?:logs?|flows?|batch|settlement)\b/i.test(trimmed);

    if (isLogAuditOrRecon) {
      // Check for expected volume in fiat ($148,200, $10,000, 10000 USD)
      const volumeMatch = trimmed.match(/\b(?:volume|total|sum)\s*(?:of\s*)?(?:[$€£])?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:USD|EUR|GBP)?\b/i);
      if (volumeMatch) {
        const cleanVol = parseFloat(volumeMatch[1].replace(/,/g, ""));
        requirements.push({
          id: `r${reqIndex++}`,
          description: `Total reconciled volume must match $${cleanVol.toLocaleString()}`,
          type: "reconciliation",
          operator: "eq",
          expected: { metric: "volume", value: cleanVol, currency: "USD" },
          status: "pending",
        });
      }

      // Check for failed charges / error threshold
      const failedCountMatch = trimmed.match(/\b(?:failed|error|rejected)\s*(?:charges?|payments?|requests?|transactions?)?\s*(?:<|<=|under|at most|below)?\s*(\d+)\b/i);
      if (failedCountMatch) {
        const maxFailures = parseInt(failedCountMatch[1], 10);
        requirements.push({
          id: `r${reqIndex++}`,
          description: `Failed charges must be <= ${maxFailures}`,
          type: "log_audit",
          operator: "lte",
          expected: { metric: "failed_count", max: maxFailures },
          status: "pending",
        });
      }

      // Check for duplicate detection
      if (/\b(?:0|zero|no)\s+duplicates?\b/i.test(trimmed) || /\bduplicates?\s*(?:must be\s*)?(?:0|zero)\b/i.test(trimmed)) {
        requirements.push({
          id: `r${reqIndex++}`,
          description: "Zero duplicate transaction or payout IDs allowed",
          type: "log_audit",
          operator: "eq",
          expected: { metric: "duplicate_count", max: 0 },
          status: "pending",
        });
      }
    }

    // 10. If no specific requirements matched, extract a general requirement
    if (requirements.length === 0) {
      requirements.push({
        id: `r${reqIndex++}`,
        description: trimmed.slice(0, 100),
        type: "general",
        operator: "contains",
        expected: trimmed,
        status: "pending",
      });
    }

    return requirements;
  }
}

export const requirementExtractor = new RequirementExtractor();
