import {
  VerificationRecord,
  CreateVerificationInput,
} from "../types/verification";
import {
  STORAGE_KEYS,
  getFromStorage,
  saveToStorage,
} from "./api";

function getStoredVerifications(): VerificationRecord[] {
  return getFromStorage<VerificationRecord[]>(
    STORAGE_KEYS.VERIFICATIONS,
    []
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
        if (Array.isArray(data.verifications)) {
          persistVerifications(data.verifications);
          return data.verifications;
        }
      }
    } catch {
      // fallback to stored verifications
    }

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
      // fallback to stored verifications
    }

    const list = getStoredVerifications();
    const found = list.find((item) => item.id === id || item.displayId === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  },

  async create(input: CreateVerificationInput): Promise<VerificationRecord> {
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Verification failed (HTTP ${res.status})`);
    }

    const data = (await res.json()) as { record?: VerificationRecord } & VerificationRecord;
    const record = data.record || data;
    const list = getStoredVerifications();
    persistVerifications([record, ...list.filter((x) => x.id !== record.id)]);
    return record;
  },

  async resubmit(
    id: string,
    patch?: {
      target?: string;
      supplementalAmount?: number;
      txHash?: string;
    }
  ): Promise<VerificationRecord> {
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Resubmission failed (HTTP ${res.status})`);
    }

    const record = (await res.json()) as VerificationRecord;
    const list = getStoredVerifications();
    persistVerifications(list.map((r) => (r.id === record.id || r.displayId === record.displayId ? record : r)));
    return record;
  },

  async clearLocalCache(): Promise<void> {
    saveToStorage(STORAGE_KEYS.VERIFICATIONS, []);
  },
};
