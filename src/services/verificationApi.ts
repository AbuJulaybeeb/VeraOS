import {
  VerificationRecord,
  CreateVerificationInput,
  VerificationAttempt,
} from "../types/verification";
import { initialVerifications } from "../mocks/verificationData";
import {
  delay,
  STORAGE_KEYS,
  getFromStorage,
  saveToStorage,
} from "./api";

function getStoredVerifications(): VerificationRecord[] {
  return getFromStorage<VerificationRecord[]>(
    STORAGE_KEYS.VERIFICATIONS,
    initialVerifications
  );
}

function persistVerifications(records: VerificationRecord[]): void {
  saveToStorage(STORAGE_KEYS.VERIFICATIONS, records);
}

export const verificationApi = {
  async list(filters?: {
    status?: string;
    search?: string;
  }): Promise<VerificationRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);
      const res = await fetch(`/v1/verify?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { verifications?: VerificationRecord[] };
        if (Array.isArray(data.verifications) && data.verifications.length > 0) {
          return data.verifications;
        }
      }
    } catch {
      // fallback
    }

    await delay(180);
    let list = getStoredVerifications();

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((item) => item.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.displayId.toLowerCase().includes(q) ||
          item.workerName.toLowerCase().includes(q) ||
          item.workerId.toLowerCase().includes(q) ||
          item.taskPrompt.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async get(id: string): Promise<VerificationRecord | null> {
    try {
      const res = await fetch(`/v1/verify/${encodeURIComponent(id)}`);
      if (res.ok) {
        const record = (await res.json()) as VerificationRecord;
        if (record && (record.id || record.displayId)) {
          return record;
        }
      }
    } catch {
      // fallback
    }

    await delay(150);
    const list = getStoredVerifications();
    const found = list.find((item) => item.id === id || item.displayId === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async create(input: CreateVerificationInput): Promise<VerificationRecord> {
    try {
      const res = await fetch("/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: input.taskPrompt,
          worker: {
            id: input.workerId || "worker-alpha-09",
            name: input.workerName || "Autonomous Worker",
            output: input.workerOutput,
          },
          options: {
            maxAttempts: input.maxAttempts || 3,
            evidenceSources: input.evidenceSources,
          },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { record?: VerificationRecord } & VerificationRecord;
        const record = data.record || data;
        const list = getStoredVerifications();
        persistVerifications([record, ...list.filter((x) => x.id !== record.id)]);
        return record;
      }
    } catch (err) {
      console.warn("Backend /v1/verify unreachable, using local simulation fallback:", err);
    }

    await delay(300);
    const list = getStoredVerifications();
    const nextNum = list.length + 1048;
    const newId = `v_run_${Date.now().toString(36)}`;
    const displayId = `V-${nextNum}`;

    // Determine initial simulated evaluation based on prompt content
    const isSuccessScenario =
      input.taskPrompt.toLowerCase().includes("audit 3") ||
      input.workerOutput.toLowerCase().includes("all passed") ||
      input.workerOutput.toLowerCase().includes("corroborated");

    const isUnverifiedScenario =
      input.workerOutput.toLowerCase().includes("no proof") ||
      input.workerOutput.toLowerCase().includes("unverified");

    const status = isSuccessScenario
      ? "PASSED"
      : isUnverifiedScenario
      ? "UNVERIFIED"
      : "FAILED";

    const initialAttempt: VerificationAttempt = {
      attemptNumber: 1,
      timestamp: new Date().toISOString(),
      status,
      summary:
        status === "PASSED"
          ? "ALL INVARIANTS VERIFIED — STATUS: VERDICT_CONFIRMED"
          : status === "UNVERIFIED"
          ? "TASK UNVERIFIED — NO INDEPENDENT EVIDENCE AVAILABLE"
          : "TASK NOT VERIFIED — STATUS: VERDICT_REJECTED",
      detailedReason:
        status === "PASSED"
          ? "All declarative invariants independently corroborated onchain. Cryptographic attestation generated."
          : status === "UNVERIFIED"
          ? "Worker asserted completion, but no verifiable independent evidence was located."
          : "Invariant threshold checks breached during independent RPC and Oracle triangulation.",
      easUid:
        status === "PASSED"
          ? `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
          : undefined,
      blockNumber: 21849220 + list.length,
      workerClaims: [
        {
          id: `claim_${Date.now()}_1`,
          title: "Worker Result Claim",
          statement: input.workerOutput.slice(0, 160) || "Task completed as specified.",
          source: "WORKER_OUTPUT",
          timestamp: new Date().toISOString(),
          status: status === "PASSED" ? "CORROBORATED" : "CONFLICT",
        },
      ],
      invariants: [
        {
          id: `inv_${Date.now()}_1`,
          name: "Invariant 1: Cardinality & Bounds",
          category: "cardinality",
          description: "Execution parameters respected declared bounds.",
          expected: "Exact requirement satisfaction",
          actual:
            status === "PASSED"
              ? "All parameters validated"
              : "Discrepancy detected during validation",
          status: status === "PASSED" ? "PASSED" : "FAILED",
          latencyMs: 18,
        },
        {
          id: `inv_${Date.now()}_2`,
          name: "Invariant 2: Target Network Verification",
          category: "ecosystem",
          description: "Canonical execution verified on Stellar Testnet.",
          expected: "Stellar Testnet",
          actual: "Stellar Testnet",
          status: "PASSED",
          latencyMs: 24,
        },
      ],
      evidence: [
        {
          id: `ev_${Date.now()}_1`,
          requirementId: `inv_${Date.now()}_1`,
          type: "ONCHAIN",
          title: "Stellar Horizon Receipt",
          provider: "Stellar Horizon Testnet Node",
          proofType: "Ledger State Diff",
          independent: true,
          status: status === "PASSED" ? "CONFIRMED" : "REJECTED",
          timestamp: new Date().toISOString(),
          isMock: true,
          data: {
            Network: input.network || "Stellar Testnet",
            Worker: input.workerId,
            EvidenceGrounding: status === "PASSED" ? "CORROBORATED" : "BREACH_DETECTED",
          },
        },
      ],
      remediationDirectives:
        status === "FAILED"
          ? [
              {
                id: `dir_${Date.now()}`,
                invariantId: `inv_${Date.now()}_1`,
                action: "RETRY_WITH_PROOF",
                reason: "Invariant check failed. Provide verified transaction evidence and correct parameters.",
                mandatory: true,
              },
            ]
          : undefined,
    };

    const newRecord: VerificationRecord = {
      id: newId,
      displayId,
      taskId: `task_${Date.now().toString(36)}`,
      taskPrompt: input.taskPrompt,
      workerId: input.workerId,
      workerName: input.workerId.includes("bot")
        ? `${input.workerId} (v1.0)`
        : `${input.workerId} (v2.0)`,
      network: input.network || "Stellar Testnet",
      chainId: 0,
      createdAt: new Date().toISOString(),
      currentAttempt: 1,
      maxAttempts: 3,
      status,
      quorum: "3/3 Quorum Checked",
      latencyMs: 135,
      attempts: [initialAttempt],
    };

    const updated = [newRecord, ...list];
    persistVerifications(updated);
    return newRecord;
  },

  async resubmit(
    id: string,
    patch?: {
      target?: string;
      supplementalAmount?: number;
      txHash?: string;
    }
  ): Promise<VerificationRecord> {
    try {
      const res = await fetch(`/v1/verify/${encodeURIComponent(id)}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplementalTxHash: patch?.txHash,
          workerOutput: patch?.target
            ? `Remediated target: ${patch.target}\nSupplemental Transfer: ${patch.supplementalAmount || 4.5} USDC TxHash: ${patch.txHash || "0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"}`
            : undefined,
        }),
      });
      if (res.ok) {
        const record = (await res.json()) as VerificationRecord;
        if (record && record.id) {
          const list = getStoredVerifications();
          persistVerifications(list.map((r) => (r.id === record.id || r.displayId === record.displayId ? record : r)));
          return record;
        }
      }
    } catch {
      // fallback
    }

    await delay(350);
    const list = getStoredVerifications();
    const index = list.findIndex((item) => item.id === id || item.displayId === id);
    if (index === -1) {
      throw new Error(`Verification not found: ${id}`);
    }

    const item = list[index];
    const nextAttemptNum = item.currentAttempt + 1;

    // Simulate progressive remediation
    // Attempt 2: Target replaced with Aerodrome ($214M TVL), TVL invariant passes.
    // If supplemental amount is supplied or attempt >= 2, all pass!
    const isFinalPass = nextAttemptNum >= 2;

    const newAttempt: VerificationAttempt = {
      attemptNumber: nextAttemptNum,
      timestamp: new Date().toISOString(),
      status: isFinalPass ? "PASSED" : "FAILED",
      summary: isFinalPass
        ? "ALL INVARIANTS VERIFIED — STATUS: VERDICT_CONFIRMED"
        : "TASK STILL UNVERIFIED — 1 INVARIANT DEFICIT REMAINING",
      detailedReason: isFinalPass
        ? `Remediation directives successfully executed. Replaced protocol with ${patch?.target || "Blend Capital ($18M TVL)"} and reconciled 4.5 USDC deficit. Grounded payment verified on Stellar Testnet.`
        : "Replaced protocol with Blend Capital, but compensation payment deficit is still awaiting supplemental transfer.",
      easUid: isFinalPass ? "0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de" : undefined,
      blockNumber: 1048576 + nextAttemptNum * 5,
      workerClaims: [
        {
          id: `claim_att_${nextAttemptNum}_1`,
          requirementId: "inv_cardinality",
          title: "Remediated Protocols",
          statement: `Updated protocols: ${patch?.target || "Blend Capital ($18M)"}, Aquarius ($12M), YieldBlox ($15M).`,
          source: "WORKER_OUTPUT",
          timestamp: new Date().toISOString(),
          status: "CORROBORATED",
        },
        {
          id: `claim_att_${nextAttemptNum}_2`,
          requirementId: "inv_usdc_payment",
          title: "Reconciled Payment",
          statement: `Supplemental transfer broadcast: 4.50 USDC -> recipient GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 (Tx: ${patch?.txHash || "0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"})`,
          source: "WORKER_OUTPUT",
          timestamp: new Date().toISOString(),
          status: "CORROBORATED",
        },
      ],
      invariants: [
        {
          id: "inv_cardinality",
          name: "Invariant 1: Cardinality (3 Protocols)",
          category: "cardinality",
          description: "Task requires exactly 3 distinct protocols identified.",
          expected: "3 protocols",
          actual: "3 protocols parsed",
          status: "PASSED",
          latencyMs: 14,
        },
        {
          id: "inv_ecosystem",
          name: "Invariant 2: Stellar Network Conformance",
          category: "ecosystem",
          description: "All protocols possess active contracts deployed on Stellar Testnet.",
          expected: "Stellar Testnet",
          actual: "Stellar Testnet confirmed",
          status: "PASSED",
          latencyMs: 22,
        },
        {
          id: "inv_classification",
          name: "Invariant 3: Lending Category Classification",
          category: "custom",
          description: "Oracle ontology registers all targets under taxonomy defi.lending_market.",
          expected: "defi.lending_market",
          actual: "defi.lending_market corroborated",
          status: "PASSED",
          latencyMs: 38,
        },
        {
          id: "inv_lending_tvl",
          name: "Invariant 4: TVL Threshold Minimum (≥ $10,000,000)",
          category: "threshold",
          description: `Target substituted: ${patch?.target || "Aerodrome"}. Independent Oracle returns $214.2M at block #${21849201 + nextAttemptNum * 5}.`,
          expected: "≥ $10,000,000 USD",
          actual: "$214,200,000 USD",
          delta: "+$204,200,000 surplus",
          status: "PASSED",
          latencyMs: 29,
          oracleProof: {
            source: "DefiLlama Web Oracle",
            proofId: "0x89ee12",
            verified: true,
          },
        },
        {
          id: "inv_usdc_payment",
          name: "Invariant 5: Accurate Compensation Transfer (5.00 USDC)",
          category: "payment",
          description: "Initial 0.50 USDC + Supplemental 4.50 USDC = 5.00 USDC total transferred to recipient GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5.",
          expected: "5.000000 USDC (5,000,000 base units)",
          actual: "5.000000 USDC confirmed across 2 tx receipts",
          delta: "0.00 USDC (Reconciled)",
          status: "PASSED",
          latencyMs: 25,
        },
      ],
      evidence: [
        {
          id: `ev_base_reconciled_${nextAttemptNum}`,
          requirementId: "inv_usdc_payment",
          type: "ONCHAIN",
          title: "Stellar Horizon Receipt (Supplemental Payout)",
          provider: "Stellar Horizon Testnet",
          proofType: "Stellar Ledger State",
          independent: true,
          status: "CONFIRMED",
          timestamp: new Date().toISOString(),
          isMock: true,
          proofHash: patch?.txHash || "5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de",
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${patch?.txHash || "5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de"}`,
          data: {
            Chain: "Stellar Testnet",
            Ledger: `#${1048576 + nextAttemptNum * 5}`,
            SupplementalTx: patch?.txHash || "5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de",
            SupplementalTransferred: "4.500000 USDC",
            TotalReconciled: "5.000000 USDC",
            Status: "SUCCESS (Confirmed Reconciled)",
          },
        },
        {
          id: `ev_oracle_remediated_${nextAttemptNum}`,
          requirementId: "inv_lending_tvl",
          type: "WEB_ORACLE",
          title: "Web Oracle Witness (Blend Capital)",
          provider: "DefiLlama REST API via Web Witness",
          proofType: "Web Oracle Proof",
          independent: true,
          status: "CONFIRMED",
          timestamp: new Date().toISOString(),
          isMock: true,
          proofHash: "0x89ee12",
          data: {
            Provider: "DefiLlama REST API",
            Target: patch?.target || "Aerodrome Finance",
            LiveTVL: "$214,200,000 USD",
            InvariantSatisfaction: "CONFIRMED (> $10M threshold)",
          },
        },
      ],
      rawTraceJson: JSON.stringify(
        {
          agent: item.workerName,
          attempt: nextAttemptNum,
          remediated_selection: [
            { slug: "aerodrome", tvl: 214000000 },
            { slug: "moonwell", tvl: 45000000 },
            { slug: "overnight", tvl: 12000000 },
          ],
          supplemental_payout_tx: patch?.txHash || "0x91cc4421b8fa012984fe9823901bca019",
          supplemental_units: "4500000",
          total_reconciled_units: "5000000",
        },
        null,
        2
      ),
    };

    item.currentAttempt = nextAttemptNum;
    item.status = isFinalPass ? "PASSED" : "FAILED";
    item.attempts.push(newAttempt);

    persistVerifications(list);
    return JSON.parse(JSON.stringify(item));
  },

  async resetDemoData(): Promise<void> {
    saveToStorage(STORAGE_KEYS.VERIFICATIONS, initialVerifications);
  },
};
