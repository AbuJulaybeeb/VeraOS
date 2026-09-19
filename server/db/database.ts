/**
 * VeraOS Enterprise Database Layer
 * Supports Cloudflare D1 (SQLite) with automatic migration and resilient storage fallback.
 */

export interface InvitedUser {
  id: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  invite_code?: string;
  invited_by?: string;
  stellar_wallet?: string;
  created_at: string;
  last_active_at: string;
}

export interface InviteCode {
  code: string;
  max_uses: number;
  uses_count: number;
  created_by: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface StoredVerification {
  id: string;
  display_id: string;
  task_prompt: string;
  worker_id: string;
  worker_name: string;
  worker_output: string;
  status: "PASSED" | "FAILED" | "UNVERIFIED";
  stellar_tx_hash?: string;
  network: string;
  verdict_json: string;
  evidence_json: string;
  created_by_telegram_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

// Minimal Cloudflare D1 types interface for type safety without external dependencies
export interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
  exec: (query: string) => Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: unknown;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

export class VeraDatabase {
  private d1?: D1Database;

  // Resilient memory cache when D1 is not bound
  private static fallbackUsers: Map<string, InvitedUser> = new Map();
  private static fallbackCodes: Map<string, InviteCode> = new Map([
    [
      "VERA-VIP-2026",
      {
        code: "VERA-VIP-2026",
        max_uses: 100,
        uses_count: 0,
        created_by: "admin",
        is_active: true,
        notes: "VIP Enterprise Founder Access",
        created_at: new Date().toISOString(),
      },
    ],
    [
      "STELLAR-AUDITOR-01",
      {
        code: "STELLAR-AUDITOR-01",
        max_uses: 50,
        uses_count: 0,
        created_by: "admin",
        is_active: true,
        notes: "Stellar Ecosystem Protocol Auditor",
        created_at: new Date().toISOString(),
      },
    ],
    [
      "FOUNDER-ALPHA",
      {
        code: "FOUNDER-ALPHA",
        max_uses: 10,
        uses_count: 0,
        created_by: "admin",
        is_active: true,
        notes: "Core Founding Team Access",
        created_at: new Date().toISOString(),
      },
    ],
  ]);
  private static fallbackVerifications: Map<string, StoredVerification> = new Map();
  private static fallbackAuditLogs: AuditLog[] = [];

  constructor(d1Database?: D1Database) {
    this.d1 = d1Database;
  }

  setD1(d1Database: D1Database): void {
    this.d1 = d1Database;
  }

  // --- 1. Invited Users (Access Whitelist) ---

  async getUser(telegramId: string): Promise<InvitedUser | null> {
    if (this.d1) {
      try {
        const stmt = this.d1.prepare("SELECT * FROM invited_users WHERE telegram_id = ?");
        const res = await stmt.bind(telegramId).first<InvitedUser>();
        return res || null;
      } catch (err) {
        console.warn("[DB] D1 getUser error, falling back to local store:", err);
      }
    }
    return VeraDatabase.fallbackUsers.get(telegramId) || null;
  }

  async getInvitedUserByTelegramId(telegramId: string): Promise<InvitedUser | null> {
    return this.getUser(telegramId);
  }

  async isUserAuthorized(telegramId: string): Promise<boolean> {
    const user = await this.getUser(telegramId);
    return Boolean(user && user.status === "ACTIVE");
  }

  async saveUser(user: InvitedUser): Promise<void> {
    if (this.d1) {
      try {
        const query = `
          INSERT INTO invited_users (id, telegram_id, username, first_name, status, invite_code, invited_by, stellar_wallet, created_at, last_active_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(telegram_id) DO UPDATE SET
            username = excluded.username,
            first_name = excluded.first_name,
            status = excluded.status,
            stellar_wallet = coalesce(excluded.stellar_wallet, invited_users.stellar_wallet),
            last_active_at = excluded.last_active_at
        `;
        await this.d1
          .prepare(query)
          .bind(
            user.id,
            user.telegram_id,
            user.username || null,
            user.first_name || null,
            user.status,
            user.invite_code || null,
            user.invited_by || null,
            user.stellar_wallet || null,
            user.created_at,
            user.last_active_at
          )
          .run();
      } catch (err) {
        console.warn("[DB] D1 saveUser error, falling back:", err);
      }
    }
    VeraDatabase.fallbackUsers.set(user.telegram_id, user);
  }

  async upsertInvitedUser(user: InvitedUser): Promise<void> {
    return this.saveUser(user);
  }

  async updateLastActive(telegramId: string): Promise<void> {
    const now = new Date().toISOString();
    if (this.d1) {
      try {
        await this.d1
          .prepare("UPDATE invited_users SET last_active_at = ? WHERE telegram_id = ?")
          .bind(now, telegramId)
          .run();
      } catch {
        // ignore
      }
    }
    const local = VeraDatabase.fallbackUsers.get(telegramId);
    if (local) {
      local.last_active_at = now;
    }
  }

  async linkStellarWallet(telegramId: string, walletAddress: string): Promise<boolean> {
    if (this.d1) {
      try {
        await this.d1
          .prepare("UPDATE invited_users SET stellar_wallet = ? WHERE telegram_id = ?")
          .bind(walletAddress, telegramId)
          .run();
      } catch (err) {
        console.warn("[DB] D1 linkStellarWallet error:", err);
      }
    }
    const local = VeraDatabase.fallbackUsers.get(telegramId);
    if (local) {
      local.stellar_wallet = walletAddress;
      return true;
    }
    return true;
  }

  // --- 2. Invite Codes System ---

  async getInviteCode(code: string): Promise<InviteCode | null> {
    const normalized = code.trim().toUpperCase();
    if (this.d1) {
      try {
        const stmt = this.d1.prepare("SELECT * FROM invite_codes WHERE code = ?");
        const res = await stmt.bind(normalized).first<InviteCode>();
        return res || null;
      } catch (err) {
        console.warn("[DB] D1 getInviteCode error:", err);
      }
    }
    return VeraDatabase.fallbackCodes.get(normalized) || null;
  }

  async validateAndRedeemInvite(
    telegramId: string,
    rawCode: string,
    meta?: { username?: string; first_name?: string }
  ): Promise<{ success: boolean; message: string; user?: InvitedUser }> {
    const code = rawCode.trim().toUpperCase();
    const invite = await this.getInviteCode(code);

    if (!invite) {
      return { success: false, message: "Invalid invite code. Please check code spelling." };
    }

    if (!invite.is_active) {
      return { success: false, message: "This invite code has been deactivated." };
    }

    if (invite.uses_count >= invite.max_uses) {
      return {
        success: false,
        message: "This invitation code has already reached its maximum redemption limit.",
      };
    }

    // Check if user is already invited
    const existing = await this.getUser(telegramId);
    if (existing && existing.status === "ACTIVE") {
      return {
        success: true,
        message: "You are already an authorized operator.",
        user: existing,
      };
    }

    const now = new Date().toISOString();
    const newUser: InvitedUser = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      telegram_id: telegramId,
      username: meta?.username || "",
      first_name: meta?.first_name || "Operator",
      status: "ACTIVE",
      invite_code: code,
      invited_by: invite.created_by,
      created_at: now,
      last_active_at: now,
    };

    // Increment usage count in D1
    if (this.d1) {
      try {
        await this.d1
          .prepare("UPDATE invite_codes SET uses_count = uses_count + 1 WHERE code = ?")
          .bind(code)
          .run();
      } catch (err) {
        console.warn("[DB] D1 increment invite error:", err);
      }
    }
    invite.uses_count += 1;
    VeraDatabase.fallbackCodes.set(code, invite);

    await this.saveUser(newUser);
    await this.logAudit(telegramId, "INVITE_REDEEMED", `Code: ${code} by ${meta?.username || telegramId}`);

    return {
      success: true,
      message: `Access granted! Welcome to VeraOS Enterprise, ${newUser.first_name}.`,
      user: newUser,
    };
  }

  async createInviteCode(code: string, maxUses = 1, createdBy = "admin", notes = ""): Promise<InviteCode> {
    const normalized = code.trim().toUpperCase();
    const newCode: InviteCode = {
      code: normalized,
      max_uses: maxUses,
      uses_count: 0,
      created_by: createdBy,
      is_active: true,
      notes,
      created_at: new Date().toISOString(),
    };

    if (this.d1) {
      try {
        await this.d1
          .prepare(
            "INSERT INTO invite_codes (code, max_uses, uses_count, created_by, is_active, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(
            newCode.code,
            newCode.max_uses,
            newCode.uses_count,
            newCode.created_by,
            1,
            newCode.notes || null,
            newCode.created_at
          )
          .run();
      } catch (err) {
        console.warn("[DB] D1 createInviteCode error:", err);
      }
    }

    VeraDatabase.fallbackCodes.set(normalized, newCode);
    return newCode;
  }

  // --- 3. Verifications ---

  async saveVerification(record: StoredVerification): Promise<void> {
    if (this.d1) {
      try {
        const query = `
          INSERT INTO verifications (
            id, display_id, task_prompt, worker_id, worker_name, worker_output,
            status, stellar_tx_hash, network, verdict_json, evidence_json,
            created_by_telegram_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.d1
          .prepare(query)
          .bind(
            record.id,
            record.display_id,
            record.task_prompt,
            record.worker_id,
            record.worker_name,
            record.worker_output,
            record.status,
            record.stellar_tx_hash || null,
            record.network,
            record.verdict_json,
            record.evidence_json,
            record.created_by_telegram_id || null,
            record.created_at
          )
          .run();
      } catch (err) {
        console.warn("[DB] D1 saveVerification error:", err);
      }
    }
    VeraDatabase.fallbackVerifications.set(record.id, record);
    VeraDatabase.fallbackVerifications.set(record.display_id, record);
  }

  async getVerification(idOrDisplayId: string): Promise<StoredVerification | null> {
    if (this.d1) {
      try {
        const stmt = this.d1.prepare(
          "SELECT * FROM verifications WHERE id = ? OR display_id = ?"
        );
        const res = await stmt.bind(idOrDisplayId, idOrDisplayId).first<StoredVerification>();
        if (res) return res;
      } catch (err) {
        console.warn("[DB] D1 getVerification error:", err);
      }
    }
    return VeraDatabase.fallbackVerifications.get(idOrDisplayId) || null;
  }

  async getVerificationByDisplayId(displayId: string): Promise<StoredVerification | null> {
    return this.getVerification(displayId);
  }

  async listVerifications(limit = 20, offset = 0): Promise<StoredVerification[]> {
    if (this.d1) {
      try {
        const stmt = this.d1.prepare(
          "SELECT * FROM verifications ORDER BY created_at DESC LIMIT ? OFFSET ?"
        );
        const res = await stmt.bind(limit, offset).all<StoredVerification>();
        if (res && res.results) return res.results;
      } catch (err) {
        console.warn("[DB] D1 listVerifications error:", err);
      }
    }
    // Unique list from memory fallback
    const unique = new Map<string, StoredVerification>();
    for (const v of VeraDatabase.fallbackVerifications.values()) {
      unique.set(v.id, v);
    }
    return Array.from(unique.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit);
  }

  // --- 4. Audit Logs ---

  async logAudit(
    userIdOrEntry: string | { user_id?: string; action: string; details?: string; ip_address?: string } | undefined,
    action?: string,
    details?: string,
    ipAddress?: string
  ): Promise<void> {
    let entry: AuditLog;
    if (typeof userIdOrEntry === "object" && userIdOrEntry !== null) {
      entry = {
        id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: userIdOrEntry.user_id,
        action: userIdOrEntry.action,
        details: userIdOrEntry.details,
        ip_address: userIdOrEntry.ip_address,
        timestamp: new Date().toISOString(),
      };
    } else {
      entry = {
        id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: userIdOrEntry,
        action: action || "UNKNOWN",
        details,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      };
    }

    if (this.d1) {
      try {
        await this.d1
          .prepare("INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(entry.id, entry.user_id || null, entry.action, entry.details || null, entry.ip_address || null, entry.timestamp)
          .run();
      } catch {
        // ignore
      }
    }
    VeraDatabase.fallbackAuditLogs.unshift(entry);
  }

  async getRecentAuditLogs(limit = 10): Promise<AuditLog[]> {
    if (this.d1) {
      try {
        const stmt = this.d1.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?");
        const res = await stmt.bind(limit).all<AuditLog>();
        if (res && res.results) return res.results;
      } catch (err) {
        console.warn("[DB] D1 getRecentAuditLogs error:", err);
      }
    }
    return VeraDatabase.fallbackAuditLogs.slice(0, limit);
  }
}

export const defaultVeraDb = new VeraDatabase();
