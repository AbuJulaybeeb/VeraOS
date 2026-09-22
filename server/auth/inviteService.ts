/**
 * VeraOS Invitation & Access Control Service
 * Protects Telegram bot and API from unauthorized public usage.
 */

import { defaultVeraDb, VeraDatabase, type InvitedUser } from "../db/database.ts";

export class InviteService {
  private db: VeraDatabase;

  constructor(db: VeraDatabase = defaultVeraDb) {
    this.db = db;
  }

  /**
   * Check if a Telegram user is authorized to use the bot
   */
  async isAuthorized(telegramId: number | string): Promise<boolean> {
    const tid = String(telegramId);
    return this.db.isUserAuthorized(tid);
  }

  /**
   * Check access and return user details
   */
  async checkAccess(telegramId: number | string): Promise<{ allowed: boolean; user: InvitedUser | null }> {
    const tid = String(telegramId);
    const user = await this.db.getUser(tid);
    const allowed = Boolean(user && user.status === "ACTIVE");
    return { allowed, user };
  }

  /**
   * Validate if an invite code is active and has remaining capacity
   */
  async validateCode(code: string): Promise<{ valid: boolean; code?: string; message?: string }> {
    const codeObj = await this.db.getInviteCode(code);
    if (!codeObj || !codeObj.is_active) {
      return { valid: false, message: "Invalid or expired invitation code." };
    }
    if (codeObj.max_uses > 0 && codeObj.uses_count >= codeObj.max_uses) {
      return { valid: false, message: "Invitation code has reached maximum redemptions." };
    }
    return { valid: true, code: codeObj.code };
  }

  /**
   * Extract invite code from /start payload or /invite command
   * Examples:
   *   /start invite_VERA-VIP-2026 -> VERA-VIP-2026
   *   /start invite_839102 -> 839102
   *   /start VERA-VIP-2026 -> VERA-VIP-2026
   *   /invite VERA-VIP-2026 -> VERA-VIP-2026
   *   839102 -> 839102 (pure 6-digit OTP passcode)
   *   OTP-839102 -> 839102
   */
  extractInviteCode(text: string): string | null {
    const trimmed = text.trim();

    // 1. Direct 6-digit OTP passcode
    if (/^\d{6}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. OTP-prefixed passcode
    if (/^OTP[-:\s]?\d{6}$/i.test(trimmed)) {
      return trimmed.replace(/^OTP[-:\s]?/i, "").trim();
    }

    // 3. /start or /invite command format
    if (trimmed.startsWith("/start")) {
      const parts = trimmed.split(/\s+/);
      if (parts.length > 1) {
        const param = parts[1].trim();
        if (param.startsWith("invite_")) {
          return param.replace("invite_", "").trim().toUpperCase();
        }
        if (param.length >= 4) {
          return param.toUpperCase();
        }
      }
    } else if (trimmed.startsWith("/invite")) {
      const parts = trimmed.split(/\s+/);
      if (parts.length > 1) {
        const param = parts[1].trim();
        if (/^OTP[-:\s]?\d{6}$/i.test(param)) {
          return param.replace(/^OTP[-:\s]?/i, "").trim();
        }
        return param.toUpperCase();
      }
    }
    return null;
  }

  /**
   * Generate an instant 6-digit OTP for email verification and bot invite
   */
  async requestEmailOtp(email: string, notes?: string): Promise<{ otp: string; code: string; expiresInSeconds: number; telegramDeepLink: string }> {
    return this.db.generateEmailOtp(email, notes);
  }

  /**
   * Verify an email OTP passcode
   */
  async verifyEmailOtp(email: string, otp: string): Promise<{ valid: boolean; message: string; email?: string }> {
    return this.db.verifyEmailOtp(email, otp);
  }

  /**
   * Attempt to redeem an invitation code for a Telegram user
   */
  async redeemInvite(
    telegramId: number | string,
    code: string,
    meta?: { username?: string; first_name?: string }
  ): Promise<{ success: boolean; message: string; user?: InvitedUser }> {
    return this.db.validateAndRedeemInvite(String(telegramId), code, meta);
  }

  /**
   * Alias for redeemInvite
   */
  async redeemCode(
    telegramId: number | string,
    code: string,
    meta?: { username?: string; first_name?: string }
  ): Promise<{ success: boolean; message: string; user?: InvitedUser }> {
    return this.redeemInvite(telegramId, code, meta);
  }

  /**
   * Access denied message for uninvited users
   */
  getAccessDeniedMessage(name?: string): string {
    return (
      `⛔ *VeraOS Private Beta — Invitation Required*\n\n` +
      `Hello ${name || "Operator"}. VeraOS is an enterprise-grade autonomous agent verification platform and is currently accessible by *invitation only*.\n\n` +
      `*How to get access:*\n` +
      `1. Request an invitation code on the portal:\n` +
      `   👉 https://veraos.abdulwasiikhadijah.workers.dev/invite\n\n` +
      `2. If you already have a code, redeem it via:\n` +
      `   \`/invite <CODE>\` or \`/start invite_<CODE>\`\n`
    );
  }

  /**
   * Enterprise message returned to uninvited/restricted users
   */
  getRestrictedAccessMessage(botUsername = "Vera_Of_bot"): string {
    return (
      `⛔ *Access Restricted — Invitation Required*\n\n` +
      `VeraOS is an enterprise-grade autonomous agent verification platform and is currently accessible by *invitation only*.\n\n` +
      `*How to get access:*\n` +
      `1. Request an invitation code on the official portal:\n` +
      `   👉 [https://veraos.abdulwasiikhadijah.workers.dev/invite](https://veraos.abdulwasiikhadijah.workers.dev/invite)\n\n` +
      `2. If you already have an invite code, redeem it by replying:\n` +
      `   \`/invite <YOUR_CODE>\`\n` +
      `   or open your 1-click link: \`https://t.me/${botUsername}?start=invite_YOUR_CODE\`\n\n` +
      `_Status: Access denied for unauthenticated telemetry._`
    );
  }

  /**
   * Success onboarding message after an invite is redeemed
   */
  getAccessGrantedMessage(user: InvitedUser): string {
    return (
      `🎉 *Welcome to VeraOS Enterprise, ${user.first_name || "Operator"}!*\n\n` +
      `Your invitation code has been verified and registered on Cloudflare D1. You now have full operator clearance to audit agent executions against the Stellar Testnet ledger.\n\n` +
      `*Natural Language AI Active:* You can talk to me in plain English! For example:\n` +
      `• _"Verify that I sent 5 USDC to GCEYAU..."_\n` +
      `• _"What is the status of verification V-1048?"_\n` +
      `• _"Show me the cryptographic proof for the payment"_\n\n` +
      `*Operator Commands:*\n` +
      `• \`/verify <task> | <output>\` — Direct verification audit\n` +
      `• \`/status <id>\` — Query telemetry status\n` +
      `• \`/evidence <id>\` — Retrieve onchain receipts\n` +
      `• \`/wallet\` — Connect & inspect Stellar wallet\n` +
      `• \`/help\` — Operator manual\n\n` +
      `[Open Telemetry Dashboard](https://veraos.abdulwasiikhadijah.workers.dev/dashboard)`
    );
  }
}

export const inviteService = new InviteService();
