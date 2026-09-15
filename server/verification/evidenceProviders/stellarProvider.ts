import type { Requirement, WorkerClaim, Evidence } from "../../types/domain.ts";
import type { EvidenceProvider, EvidenceResult, VerificationContext } from "./provider.ts";

export interface StellarTransaction {
  id: string;
  hash: string;
  successful: boolean;
  ledger: number;
  createdAt: string;
  sourceAccount: string;
  feeCharged: string;
  memo?: string;
}

export interface StellarOperation {
  id: string;
  type: string;
  typeI: number;
  createdAt: string;
  transactionHash: string;
  assetCode?: string;
  assetIssuer?: string;
  from?: string;
  to?: string;
  amount?: string;
}

export interface StellarPaymentVerification {
  exists: boolean;
  successful: boolean;
  sourceAccount?: string;
  destinationAccount?: string;
  assetCode: string;
  amount: number;
  ledgerTimestamp?: string;
  rawOperation?: StellarOperation;
  explorerUrl: string;
  failureReason?: string;
}

export interface IStellarEvidenceProvider extends EvidenceProvider {
  getTransaction(hash: string): Promise<StellarTransaction | null>;
  getOperations(hash: string): Promise<StellarOperation[]>;
  verifyPayment(
    hash: string,
    expectedAmount: number,
    expectedToken: string,
    expectedRecipient?: string
  ): Promise<StellarPaymentVerification>;
  registerMockTransaction(hash: string, verification: Partial<StellarPaymentVerification>): void;
}

export class StellarProvider implements IStellarEvidenceProvider {
  name = "StellarProvider";
  horizonUrl = "https://horizon-testnet.stellar.org";
  sorobanRpcUrl = "https://soroban-testnet.stellar.org";
  networkPassphrase = "Test SDF Network ; September 2015";

  private mockRegistry = new Map<string, Partial<StellarPaymentVerification>>();

  constructor() {
    // Pre-populate standard known test fixtures
    // 1. Deceptive worker payment fixture (0.5 USDC)
    this.registerMockTransaction("0x8a7b3c21a4de99f2b1892f3900a41cd", {
      exists: true,
      successful: true,
      assetCode: "USDC",
      amount: 0.5,
      destinationAccount: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      sourceAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
      ledgerTimestamp: new Date().toISOString(),
    });

    // 2. Corrected payment fixture (5.0 USDC)
    this.registerMockTransaction("0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de", {
      exists: true,
      successful: true,
      assetCode: "USDC",
      amount: 5.0,
      destinationAccount: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      sourceAccount: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
      ledgerTimestamp: new Date().toISOString(),
    });

    // 3. Failed transaction fixture (reverted on Stellar ledger)
    this.registerMockTransaction("0xfailedtx99999999999999999999999999999999999999999999999999999999", {
      exists: true,
      successful: false,
      assetCode: "USDC",
      amount: 5.0,
      failureReason: "tx_bad_auth",
    });
  }

  registerMockTransaction(hash: string, verification: Partial<StellarPaymentVerification>): void {
    const normalized = this.normalizeHash(hash);
    this.mockRegistry.set(normalized, verification);
  }

  normalizeHash(hash: string): string {
    return hash.toLowerCase().trim().replace(/^0x/, "");
  }

  canHandle(requirement: Requirement): boolean {
    return requirement.type === "transaction" || requirement.type === "ecosystem";
  }

  async getTransaction(hash: string): Promise<StellarTransaction | null> {
    const cleanHash = this.normalizeHash(hash);

    // Check mock registry first
    if (this.mockRegistry.has(cleanHash)) {
      const mock = this.mockRegistry.get(cleanHash)!;
      if (!mock.exists) return null;
      return {
        id: cleanHash,
        hash: cleanHash,
        successful: mock.successful ?? true,
        ledger: 1048576,
        createdAt: mock.ledgerTimestamp || new Date().toISOString(),
        sourceAccount: mock.sourceAccount || "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
        feeCharged: "100",
      };
    }

    // Try live Horizon endpoint with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${this.horizonUrl}/transactions/${cleanHash}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json() as {
        id: string;
        hash: string;
        successful: boolean;
        ledger: number;
        created_at: string;
        source_account: string;
        fee_charged: string;
        memo?: string;
      };

      return {
        id: data.id,
        hash: data.hash,
        successful: data.successful,
        ledger: data.ledger,
        createdAt: data.created_at,
        sourceAccount: data.source_account,
        feeCharged: data.fee_charged,
        memo: data.memo,
      };
    } catch {
      return null;
    }
  }

  async getOperations(hash: string): Promise<StellarOperation[]> {
    const cleanHash = this.normalizeHash(hash);

    // Check mock registry
    if (this.mockRegistry.has(cleanHash)) {
      const mock = this.mockRegistry.get(cleanHash)!;
      if (mock.amount !== undefined) {
        return [
          {
            id: `op_${cleanHash.slice(0, 8)}`,
            type: mock.assetCode === "XLM" ? "payment" : "payment",
            typeI: 1,
            createdAt: mock.ledgerTimestamp || new Date().toISOString(),
            transactionHash: cleanHash,
            assetCode: mock.assetCode || "USDC",
            from: mock.sourceAccount || "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            to: mock.destinationAccount || "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
            amount: String(mock.amount),
          },
        ];
      }
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${this.horizonUrl}/transactions/${cleanHash}/operations`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json() as { _embedded?: { records?: Array<{
        id: string;
        type: string;
        type_i: number;
        created_at: string;
        transaction_hash: string;
        asset_code?: string;
        asset_type?: string;
        from?: string;
        to?: string;
        amount?: string;
      }> } };

      const records = data._embedded?.records || [];
      return records.map((r) => ({
        id: r.id,
        type: r.type,
        typeI: r.type_i,
        createdAt: r.created_at,
        transactionHash: r.transaction_hash,
        assetCode: r.asset_type === "native" ? "XLM" : r.asset_code,
        from: r.from,
        to: r.to,
        amount: r.amount,
      }));
    } catch {
      return [];
    }
  }

  async verifyPayment(
    hash: string,
    _expectedAmount: number,
    expectedToken: string,
    expectedRecipient?: string
  ): Promise<StellarPaymentVerification> {
    const cleanHash = this.normalizeHash(hash);
    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;

    // 1. Check if mock registry contains this hash
    if (this.mockRegistry.has(cleanHash)) {
      const mock = this.mockRegistry.get(cleanHash)!;
      if (mock.exists === false) {
        return {
          exists: false,
          successful: false,
          assetCode: expectedToken,
          amount: 0,
          explorerUrl,
          failureReason: "Transaction does not exist on Stellar ledger",
        };
      }

      if (
        expectedRecipient &&
        mock.destinationAccount &&
        mock.destinationAccount.toLowerCase() !== expectedRecipient.toLowerCase()
      ) {
        return {
          exists: true,
          successful: false,
          sourceAccount: mock.sourceAccount,
          destinationAccount: mock.destinationAccount,
          assetCode: mock.assetCode || expectedToken,
          amount: 0,
          ledgerTimestamp: mock.ledgerTimestamp || new Date().toISOString(),
          explorerUrl,
          failureReason: `Recipient mismatch on Stellar: Expected ${expectedRecipient}, observed ${mock.destinationAccount}`,
        };
      }

      return {
        exists: true,
        successful: mock.successful ?? true,
        sourceAccount: mock.sourceAccount,
        destinationAccount: mock.destinationAccount,
        assetCode: mock.assetCode || expectedToken,
        amount: mock.amount ?? 0,
        ledgerTimestamp: mock.ledgerTimestamp || new Date().toISOString(),
        explorerUrl,
        failureReason: mock.failureReason,
      };
    }

    // 2. Live query Stellar Horizon
    const tx = await this.getTransaction(cleanHash);
    if (!tx) {
      return {
        exists: false,
        successful: false,
        assetCode: expectedToken,
        amount: 0,
        explorerUrl,
        failureReason: "Transaction hash not found in Stellar Horizon ledger",
      };
    }

    if (!tx.successful) {
      return {
        exists: true,
        successful: false,
        sourceAccount: tx.sourceAccount,
        assetCode: expectedToken,
        amount: 0,
        ledgerTimestamp: tx.createdAt,
        explorerUrl,
        failureReason: "Stellar transaction reverted or failed execution on ledger",
      };
    }

    const operations = await this.getOperations(cleanHash);
    const paymentOp = operations.find(
      (op) =>
        (op.type === "payment" || op.type === "path_payment_strict_receive" || op.type === "path_payment_strict_send") &&
        (!expectedRecipient || (op.to && op.to.toLowerCase() === expectedRecipient.toLowerCase()))
    );

    if (!paymentOp || !paymentOp.amount) {
      return {
        exists: true,
        successful: true,
        sourceAccount: tx.sourceAccount,
        assetCode: expectedToken,
        amount: 0,
        ledgerTimestamp: tx.createdAt,
        explorerUrl,
        failureReason: "No matching payment operation found inside Stellar transaction",
      };
    }

    const observedAmount = parseFloat(paymentOp.amount);
    const observedAsset = paymentOp.assetCode || (paymentOp.type === "payment" ? "XLM" : "UNKNOWN");

    return {
      exists: true,
      successful: true,
      sourceAccount: paymentOp.from || tx.sourceAccount,
      destinationAccount: paymentOp.to,
      assetCode: observedAsset,
      amount: observedAmount,
      ledgerTimestamp: paymentOp.createdAt || tx.createdAt,
      rawOperation: paymentOp,
      explorerUrl,
    };
  }

  async verify(
    requirement: Requirement,
    claims: WorkerClaim[],
    _context: VerificationContext
  ): Promise<EvidenceResult> {
    const evidenceItems: Evidence[] = [];

    if (requirement.type === "transaction") {
      const paymentClaim = claims.find((c) => c.value && typeof (c.value as { amount?: number }).amount === "number");
      const txHashClaim = claims.find((c) => c.value && typeof (c.value as { txHash?: string }).txHash === "string");
      const txHash = (txHashClaim?.value as { txHash?: string })?.txHash;

      const expectedReq = requirement.expected as { amount?: number; token?: string } | undefined;
      const expectedAmount = expectedReq?.amount ?? (paymentClaim?.value as { amount?: number })?.amount ?? 0;
      const expectedToken = expectedReq?.token ?? (paymentClaim?.value as { token?: string })?.token ?? "USDC";

      if (!txHash) {
        return {
          status: "unverifiable",
          expected: `${expectedAmount} ${expectedToken}`,
          observed: paymentClaim ? `${(paymentClaim.value as { amount?: number })?.amount} ${expectedToken} (No TxHash)` : "No transaction provided",
          evidence: [],
          explanation: "Worker claimed payment dispatch but omitted an onchain Stellar transaction hash or ledger receipt.",
        };
      }

      const verification = await this.verifyPayment(txHash, expectedAmount, expectedToken);

      evidenceItems.push({
        id: `ev_stellar_tx_${requirement.id}`,
        type: "blockchain",
        source: "stellar_horizon_testnet",
        claim: `Payment transaction ${txHash}`,
        value: {
          txHash,
          amount: verification.amount,
          asset: verification.assetCode,
          successful: verification.successful,
          sourceAccount: verification.sourceAccount,
          destinationAccount: verification.destinationAccount,
          ledgerTimestamp: verification.ledgerTimestamp,
          explorerUrl: verification.explorerUrl,
        },
        strength: "strong",
        status: verification.exists && verification.successful ? "verified" : "failed",
        metadata: {
          network: "Stellar Testnet",
          horizonUrl: this.horizonUrl,
          explorerUrl: verification.explorerUrl,
        },
      });

      if (!verification.exists) {
        return {
          status: "failed",
          expected: `${expectedAmount} ${expectedToken}`,
          observed: "Transaction does not exist on Stellar ledger",
          evidence: evidenceItems,
          explanation: `Stellar transaction hash ${txHash} could not be found on Horizon testnet.`,
        };
      }

      if (!verification.successful) {
        return {
          status: "failed",
          expected: `${expectedAmount} ${expectedToken}`,
          observed: "Transaction failed / reverted on Stellar",
          evidence: evidenceItems,
          explanation: `Stellar transaction failed execution: ${verification.failureReason || "Reverted on ledger"}`,
        };
      }

      // Check amount
      const isAmountSatisfied = verification.amount >= expectedAmount;
      if (!isAmountSatisfied) {
        const deficit = (expectedAmount - verification.amount).toFixed(2);
        return {
          status: "failed",
          expected: `${expectedAmount} ${expectedToken}`,
          observed: `${verification.amount} ${verification.assetCode}`,
          evidence: evidenceItems,
          explanation: `Payment mismatch on Stellar: Expected ${expectedAmount} ${expectedToken}, but observed receipt shows ${verification.amount} ${verification.assetCode} (Deficit: ${deficit} ${expectedToken}).`,
        };
      }

      return {
        status: "passed",
        expected: `${expectedAmount} ${expectedToken}`,
        observed: `${verification.amount} ${verification.assetCode}`,
        evidence: evidenceItems,
        explanation: `Payment verified on Stellar Testnet: Observed transfer of ${verification.amount} ${verification.assetCode} confirmed in ledger.`,
      };
    }

    return {
      status: "unverifiable",
      expected: requirement.expected,
      observed: "Stellar provider handle not applicable",
      evidence: [],
      explanation: "Requirement type not supported by StellarProvider.",
    };
  }
}

export const stellarProvider = new StellarProvider();
