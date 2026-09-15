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
