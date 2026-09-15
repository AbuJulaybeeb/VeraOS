import type { VerificationRecord } from "../types/domain.ts";



export interface VerificationRepository {
  create(record: VerificationRecord): Promise<void>;
  get(id: string): Promise<VerificationRecord | null>;
  list(filters?: { status?: string; search?: string }): Promise<VerificationRecord[]>;
  update(record: VerificationRecord): Promise<void>;
}
