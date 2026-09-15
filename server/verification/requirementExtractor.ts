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
    if (paymentMatch) {
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

    // 6. If no specific requirements matched, extract a general requirement
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
