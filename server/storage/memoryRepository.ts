import type { VerificationRecord } from "../types/domain.ts";
import type { VerificationRepository } from "./repository.ts";



export class MemoryVerificationRepository implements VerificationRepository {
  private records: Map<string, VerificationRecord> = new Map();

  constructor(initialRecords: VerificationRecord[] = []) {
    for (const record of initialRecords) {
      this.records.set(record.id, record);
      if (record.displayId) {
        this.records.set(record.displayId, record);
      }
    }
  }

  async create(record: VerificationRecord): Promise<void> {
    this.records.set(record.id, record);
    if (record.displayId) {
      this.records.set(record.displayId, record);
    }
  }

  async get(id: string): Promise<VerificationRecord | null> {
    const found = this.records.get(id);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  }

  async list(filters?: { status?: string; search?: string }): Promise<VerificationRecord[]> {
    // Unique by canonical ID
    const unique = new Map<string, VerificationRecord>();
    for (const record of this.records.values()) {
      unique.set(record.id, record);
    }

    let list = Array.from(unique.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.status && filters.status !== "ALL") {
      list = list.filter((r) => r.verdict.status === filters.status || r.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          (r.displayId && r.displayId.toLowerCase().includes(q)) ||
          r.task.toLowerCase().includes(q) ||
          (r.worker.name && r.worker.name.toLowerCase().includes(q)) ||
          (r.worker.id && r.worker.id.toLowerCase().includes(q))
      );
    }

    return JSON.parse(JSON.stringify(list));
  }

  async update(record: VerificationRecord): Promise<void> {
    this.records.set(record.id, record);
    if (record.displayId) {
      this.records.set(record.displayId, record);
    }
  }

  clear(): void {
    this.records.clear();
  }
}

// Global default repository singleton for server runtime
export const defaultRepository = new MemoryVerificationRepository();
