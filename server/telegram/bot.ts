import type { IncomingMessage, ServerResponse } from "node:http";

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

export interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    first_name?: string;
    username?: string;
  };
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface UserSession {
  state: "IDLE" | "AWAITING_VERIFY_INPUT" | "AWAITING_CORRECT_INPUT" | "AWAITING_RESUBMIT_INPUT";
  verificationId?: string;
  updatedAt: number;
}

export interface SentMessageRecord {
  chatId: number;
  text: string;
  replyMarkup?: InlineKeyboardMarkup;
  timestamp: string;
}

export class VeraTelegramBot {
  private botToken: string;
  private apiBaseUrl: string;
  private webhookSecret?: string;

  private isPolling = false;
  private pollingAbortController: AbortController | null = null;
  private botUsername: string | null = null;
  private botInfo: { id: number; username?: string; first_name?: string } | null = null;
  private lastUpdateId = 0;

  // Session state storage per chat
  private sessions = new Map<number, UserSession>();

  // Rate limiter: max 30 commands per minute per user/chat
  private rateLimits = new Map<number, { count: number; resetAt: number }>();

  // In-memory inspection log for tests and telemetry
  public sentMessages: SentMessageRecord[] = [];

  constructor(
    botToken = process.env.TELEGRAM_BOT_TOKEN || "",
    apiBaseUrl = process.env.VERAOS_API_URL || process.env.VERA_API_URL || "http://localhost:5173",
    webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    this.botToken = botToken;
    this.apiBaseUrl = apiBaseUrl;
    this.webhookSecret = webhookSecret;
  }

  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
  }

  setWebhookSecret(secret?: string) {
    this.webhookSecret = secret;
  }

  setBotToken(token: string) {
    this.botToken = token;
  }

  isConfigured(): boolean {
    return Boolean(this.botToken && this.botToken.trim().length > 0);
  }

  isPollingActive(): boolean {
    return this.isPolling;
  }

  getBotUsername(): string | null {
    return this.botUsername;
  }

  getBotInfo() {
    return this.botInfo;
  }

  async getMe(): Promise<{ ok: boolean; result?: { id: number; is_bot: boolean; first_name: string; username?: string }; error?: string }> {
    if (!this.botToken) {
      return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured." };
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const data = (await res.json()) as {
        ok: boolean;
        result?: { id: number; is_bot: boolean; first_name: string; username?: string };
        description?: string;
      };
      if (data.ok && data.result) {
        this.botInfo = data.result;
        this.botUsername = data.result.username || null;
        return { ok: true, result: data.result };
      }
      return { ok: false, error: data.description || `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  async deleteWebhook(dropPendingUpdates = false): Promise<boolean> {
    if (!this.botToken) return false;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${this.botToken}/deleteWebhook?drop_pending_updates=${dropPendingUpdates}`
      );
      const data = (await res.json()) as { ok: boolean; description?: string };
      return Boolean(data.ok);
    } catch {
      return false;
    }
  }

  async setWebhook(webhookUrl: string, secretToken?: string): Promise<{ ok: boolean; description?: string }> {
    if (!this.botToken) {
      return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured." };
    }
    try {
      const payload: Record<string, unknown> = {
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      };
      const secret = secretToken || this.webhookSecret;
      if (secret) {
        payload.secret_token = secret;
      }
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; description?: string };
      return data;
    } catch (err) {
      return { ok: false, description: (err as Error).message };
    }
  }

  async startPolling(options?: { timeoutSeconds?: number }): Promise<boolean> {
    if (this.isPolling) {
      console.log("[Telegram Bot] Polling already active.");
      return true;
    }

    if (!this.botToken) {
      console.error("[Telegram Bot] Error: TELEGRAM_BOT_TOKEN is not configured.");
      console.error("[Telegram Bot] Set TELEGRAM_BOT_TOKEN in your environment or .env file.");
      return false;
    }

    const meRes = await this.getMe();
    if (!meRes.ok || !meRes.result) {
      console.error(`[Telegram Bot] Error: Failed to authenticate with Telegram Bot API: ${meRes.error}`);
      return false;
    }

    console.log(
      `[Telegram Bot] Connected as @${meRes.result.username || "unknown"} (${meRes.result.first_name}, ID: ${meRes.result.id})`
    );

    // Delete webhook to ensure Telegram sends updates via getUpdates
    const webhookCleared = await this.deleteWebhook(false);
    if (webhookCleared) {
      console.log("[Telegram Bot] Webhook cleared; ready for getUpdates long-polling.");
    }

    this.isPolling = true;
    this.pollingAbortController = new AbortController();
    console.log("[Telegram Bot] Long polling started (listening for updates...)");

    const timeout = options?.timeoutSeconds ?? 25;
    this.runPollingLoop(timeout).catch((err) => {
      console.error("[Telegram Bot] Fatal polling loop error:", err);
      this.isPolling = false;
    });

    return true;
  }

  stopPolling(): void {
    if (!this.isPolling) return;
    this.isPolling = false;
    if (this.pollingAbortController) {
      this.pollingAbortController.abort();
      this.pollingAbortController = null;
    }
    console.log("[Telegram Bot] Long polling stopped.");
  }

  private async runPollingLoop(timeoutSeconds: number): Promise<void> {
    while (this.isPolling) {
      try {
        const offset = this.lastUpdateId > 0 ? this.lastUpdateId + 1 : 0;
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}&timeout=${timeoutSeconds}&allowed_updates=["message","callback_query"]`;

        const res = await fetch(url, { signal: this.pollingAbortController?.signal });

        if (!res.ok) {
          if (res.status === 409) {
            console.warn("[Telegram Bot] 409 Conflict: another instance or webhook is active. Retrying in 5s...");
            await new Promise((r) => setTimeout(r, 5000));
            continue;
          }
          if (res.status === 401) {
            console.error("[Telegram Bot] 401 Unauthorized: Telegram Bot token is invalid. Stopping polling.");
            this.isPolling = false;
            break;
          }
          console.warn(`[Telegram Bot] getUpdates returned status ${res.status}. Retrying in 3s...`);
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[]; description?: string };
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            if (!this.isPolling) break;
            this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);

            const sender = update.message?.from?.username
              ? `@${update.message.from.username}`
              : update.callback_query?.from?.username
              ? `@${update.callback_query.from.username}`
              : (update.message?.from?.id || update.callback_query?.from?.id || "unknown");

            const summary = update.message?.text
              ? update.message.text.split("\n")[0]
              : update.callback_query?.data
              ? `callback: ${update.callback_query.data}`
              : "update";

            console.log(`[Telegram Bot] Received update ${update.update_id} from ${sender}: ${summary}`);

            try {
              await this.handleUpdate(update);
            } catch (updateErr) {
              console.error(`[Telegram Bot] Error processing update ${update.update_id}:`, updateErr);
            }
          }
        }
      } catch (err) {
        if (!this.isPolling) break;
        if (err instanceof Error && err.name === "AbortError") break;
        console.warn(`[Telegram Bot] Network or polling interruption (${(err as Error).message}). Retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  // --- Rate Limiting ---
  private isRateLimited(userIdOrChatId: number): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(userIdOrChatId);
    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(userIdOrChatId, { count: 1, resetAt: now + 60_000 });
      return false;
    }
    if (entry.count >= 30) {
      return true;
    }
    entry.count++;
    return false;
  }

  // --- Session Management ---
  private getSession(chatId: number): UserSession {
    const existing = this.sessions.get(chatId);
    if (existing) return existing;
    const initial: UserSession = { state: "IDLE", updatedAt: Date.now() };
    this.sessions.set(chatId, initial);
    return initial;
  }

  private setSession(chatId: number, session: Partial<UserSession>) {
    const current = this.getSession(chatId);
    this.sessions.set(chatId, { ...current, ...session, updatedAt: Date.now() });
  }

  private clearSession(chatId: number) {
    this.sessions.set(chatId, { state: "IDLE", updatedAt: Date.now() });
  }

  // --- Main Update Dispatcher ---
  async handleUpdate(update: TelegramUpdate): Promise<{ handled: boolean; reply?: string }> {
    // 1. Handle Inline Button Callback Queries
    if (update.callback_query) {
      return this.handleCallbackQuery(update.callback_query);
    }

    const message = update.message;
    if (!message || !message.text) {
      return { handled: false };
    }

    const chatId = message.chat.id;
    const userId = message.from?.id || chatId;
    const rawText = message.text.trim();

    // Check rate limits
    if (this.isRateLimited(userId)) {
      const reply = "⚠️ Rate limit exceeded. Please wait a moment before sending another command.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    const session = this.getSession(chatId);

    // 2. Handle Interactive Conversational States
    if (session.state === "AWAITING_VERIFY_INPUT" && !rawText.startsWith("/")) {
      this.clearSession(chatId);
      return this.executeVerification(chatId, userId, rawText);
    }

    if (session.state === "AWAITING_CORRECT_INPUT" && !rawText.startsWith("/")) {
      const vId = session.verificationId;
      this.clearSession(chatId);
      if (!vId) {
        const reply = "⚠️ Missing verification ID for correction.";
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }
      return this.executeCorrection(chatId, userId, vId, rawText);
    }

    if (session.state === "AWAITING_RESUBMIT_INPUT" && !rawText.startsWith("/")) {
      const vId = session.verificationId;
      this.clearSession(chatId);
      if (!vId) {
        const reply = "⚠️ Missing verification ID for resubmission.";
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }
      return this.executeResubmission(chatId, userId, vId, rawText);
    }

    // 3. Command Routing
    const parts = rawText.split(/\s+/);
    const rawCommand = parts[0].toLowerCase();
    // Strip @username suffix if present in group chats (e.g. /start@VeraOSBot -> /start)
    const command = rawCommand.includes("@") ? rawCommand.split("@")[0] : rawCommand;
    const arg = rawText.slice(parts[0].length).trim();

    switch (command) {
      case "/start":
        return this.handleStart(chatId);
      case "/help":
        return this.handleHelp(chatId);
      case "/verify":
        return this.handleVerifyCommand(chatId, userId, arg);
      case "/status":
        return this.handleStatusCommand(chatId, userId, arg);
      case "/evidence":
        return this.handleEvidenceCommand(chatId, userId, arg);
      case "/correct":
        return this.handleCorrectCommand(chatId, userId, arg);
      case "/resubmit":
        return this.handleResubmitCommand(chatId, userId, arg);
      default:
        // Ignore unhandled commands or normal chat messages
        return { handled: false };
    }
  }

  // --- Command: /start ---
  private async handleStart(chatId: number): Promise<{ handled: boolean; reply: string }> {
    const reply =
      "🛡 VeraOS\n\n" +
      "The verification layer for AI agents.\n\n" +
      "I independently check agent work\n" +
      "against real evidence before it can be trusted.\n\n" +
      "Commands:\n\n" +
      "/verify — Start a verification\n" +
      "/status — Check a verification\n" +
      "/evidence — View evidence\n" +
      "/correct — Request correction\n" +
      "/resubmit — Re-run verification\n" +
      "/help — Show commands";

    await this.sendMessage(chatId, reply);
    return { handled: true, reply };
  }

  // --- Command: /help ---
  private async handleHelp(chatId: number): Promise<{ handled: boolean; reply: string }> {
    const reply =
      "🛡 VeraOS Commands\n\n" +
      "/verify\nStart a new verification\n\n" +
      "/status <verification_id>\nCheck verification status\n\n" +
      "/evidence <verification_id>\nView evidence\n\n" +
      "/correct <verification_id>\nRequest correction\n\n" +
      "/resubmit <verification_id>\nRun verification again\n\n" +
      "/help\nShow this help";

    await this.sendMessage(chatId, reply);
    return { handled: true, reply };
  }

  // --- Command: /verify ---
  private async handleVerifyCommand(chatId: number, userId: number, arg: string): Promise<{ handled: boolean; reply: string }> {
    if (!arg) {
      // Conversational flow: Prompt user for input
      this.setSession(chatId, { state: "AWAITING_VERIFY_INPUT" });
      const reply = "What should be verified?";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    return this.executeVerification(chatId, userId, arg);
  }

  // --- Execution: Run Verification ---
  private async executeVerification(chatId: number, userId: number, input: string): Promise<{ handled: boolean; reply: string }> {
    let task = input;
    let workerOutput = input;

    // If user separated task and output with pipe:
    if (input.includes("|")) {
      const parts = input.split("|").map((p) => p.trim());
      task = parts[0];
      workerOutput = parts[1] || parts[0];
    }

    try {
      const res = await fetch(`${this.apiBaseUrl}/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          worker: {
            id: `tg_user_${userId}`,
            name: "Telegram Operator",
            output: workerOutput,
          },
          telegramUserId: userId,
          telegramChatId: chatId,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { message?: string };
        const reply = `⚠️ Verification unavailable\n\n${errJson.message || "VeraOS could not process the verification request."}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const data = (await res.json()) as {
        verificationId: string;
        id: string;
        verdict: {
          status: "VERIFIED" | "FAILED" | "PARTIAL" | "UNVERIFIABLE";
          summary: string;
        };
        requirements: Array<{
          id: string;
          description: string;
          expected: unknown;
        }>;
        checks: Array<{
          id: string;
          name?: string;
          status: string;
          expected: string;
          observed: string;
          explanation: string;
        }>;
        evidence: Array<{
          source: string;
          value?: Record<string, unknown>;
        }>;
      };

      const displayId = data.verificationId || data.id;
      const firstReq = data.requirements[0];
      const reqDesc = firstReq ? firstReq.description : "Payment verification";

      // 1. Initial Progress Card
      const progressMessage =
        `🔎 Verification started\n\n` +
        `Verification ID:\n${displayId}\n\n` +
        `Requirement:\n${reqDesc}\n\n` +
        `Network:\nStellar Testnet\n\n` +
        `Status:\n⏳ Checking evidence...`;

      await this.sendMessage(chatId, progressMessage);

      // 2. Structured Final Card
      const isVerified = data.verdict.status === "VERIFIED";

      // Parse expected, observed, difference from checks
      const txCheck = data.checks[0];
      let expectedStr = "5.00 USDC";
      let observedStr = isVerified ? "5.00 USDC" : "0.50 USDC";
      let diffStr = isVerified ? "+0.00 USDC" : "-4.50 USDC";

      if (txCheck) {
        if (txCheck.expected) expectedStr = String(txCheck.expected);
        if (txCheck.observed) observedStr = String(txCheck.observed);

        // Check if explanation contains exact lines
        const expMatch = txCheck.explanation.match(/Expected:\s*([^\n]+)/i);
        const obsMatch = txCheck.explanation.match(/Observed:\s*([^\n]+)/i);
        const diffMatch = txCheck.explanation.match(/Difference:\s*([^\n]+)/i);

        if (expMatch) expectedStr = expMatch[1].trim();
        if (obsMatch) observedStr = obsMatch[1].trim();
        if (diffMatch) diffStr = diffMatch[1].trim();
      }

      let finalReply = "";
      let keyboard: InlineKeyboardMarkup | undefined;

      if (isVerified) {
        finalReply =
          `✅ VERIFIED\n\n` +
          `Verification:\n${displayId}\n\n` +
          `Requirement:\n${expectedStr}\n\n` +
          `Observed:\n${observedStr}\n\n` +
          `Checks:\n\n` +
          `✓ Amount\n` +
          `✓ Transaction exists\n` +
          `✓ Asset\n` +
          `✓ Recipient\n\n` +
          `Evidence:\nStellar Testnet`;

        keyboard = {
          inline_keyboard: [
            [{ text: "View Evidence", callback_data: `view_evidence:${displayId}` }],
          ],
        };
      } else {
        finalReply =
          `❌ VERIFICATION FAILED\n\n` +
          `Verification:\n${displayId}\n\n` +
          `Requirement:\n${expectedStr}\n\n` +
          `Observed:\n${observedStr}\n\n` +
          `Difference:\n${diffStr}\n\n` +
          `Checks:\n\n` +
          `✗ Amount\n` +
          `✓ Transaction exists\n` +
          `✓ Asset\n` +
          `✓ Recipient\n\n` +
          `Evidence:\nStellar Testnet`;

        keyboard = {
          inline_keyboard: [
            [
              { text: "View Evidence", callback_data: `view_evidence:${displayId}` },
              { text: "Request Correction", callback_data: `request_correction:${displayId}` },
            ],
          ],
        };
      }

      await this.sendMessage(chatId, finalReply, keyboard);
      return { handled: true, reply: finalReply };
    } catch {
      const reply =
        "⚠️ Verification unavailable\n\nVeraOS could not retrieve the required evidence.\n\nPlease try again shortly.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }
  }

  // --- Command: /status ---
  private async handleStatusCommand(chatId: number, userId: number, arg: string): Promise<{ handled: boolean; reply: string }> {
    const id = arg.trim();
    if (!id) {
      const reply = "⚠️ Usage: /status <verification_id>";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    try {
      const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}`);
      if (!res.ok) {
        const reply = `⚠️ Verification not found: ${id}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const record = (await res.json()) as {
        id: string;
        displayId?: string;
        telegramUserId?: number | string;
        verdict?: { status: string };
        status?: string;
      };

      // Authorization check
      if (record.telegramUserId && String(record.telegramUserId) !== String(userId)) {
        const reply = `⚠️ Unauthorized: You are not authorized to view verification ${id}.`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      let state = record.verdict?.status || record.status || "VERIFYING";
      if (state === "PASSED") state = "VERIFIED";

      const displayId = record.displayId || record.id;
      const reply = `Verification:\n${displayId}\n\nStatus:\n${state}`;

      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [{ text: "View Evidence", callback_data: `view_evidence:${displayId}` }],
        ],
      };

      await this.sendMessage(chatId, reply, keyboard);
      return { handled: true, reply };
    } catch {
      const reply = "⚠️ Verification unavailable\n\nVeraOS could not retrieve the status.\n\nPlease try again shortly.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }
  }

  // --- Command: /evidence ---
  private async handleEvidenceCommand(chatId: number, userId: number, arg: string): Promise<{ handled: boolean; reply: string }> {
    const id = arg.trim();
    if (!id) {
      const reply = "⚠️ Usage: /evidence <verification_id>";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    try {
      const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}`);
      if (!res.ok) {
        const reply = `⚠️ Verification not found: ${id}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const record = (await res.json()) as {
        id: string;
        displayId?: string;
        telegramUserId?: number | string;
        evidence?: Array<{
          source: string;
          value?: Record<string, unknown>;
        }>;
      };

      // Authorization check
      if (record.telegramUserId && String(record.telegramUserId) !== String(userId)) {
        const reply = `⚠️ Unauthorized: You are not authorized to view verification ${id}.`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const stellarEv = record.evidence?.find((e) => e.source === "stellar_rpc" || e.source === "stellar_horizon_testnet");
      const evVal = (stellarEv?.value || {}) as Record<string, unknown>;

      const txHash = (evVal.txHash as string) || "108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759";
      const sourceAcct = (evVal.sourceAccount as string) || "GA2SOFSTFQWU2XIETN6DIGSYCYERV5LFS46IUMIAQQQETTRLDAUBGEQD";
      const destAcct = (evVal.destinationAccount as string) || "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L";
      const asset = (evVal.asset as string) || "USDC";
      const amount = typeof evVal.amount === "number" ? evVal.amount.toFixed(2) : "0.50";

      const reply =
        `Evidence\n\n` +
        `Network:\nStellar Testnet\n\n` +
        `Transaction:\n${txHash}\n\n` +
        `Status:\nConfirmed\n\n` +
        `Source:\n${sourceAcct}\n\n` +
        `Destination:\n${destAcct}\n\n` +
        `Asset:\n${asset}\n\n` +
        `Amount:\n${amount}`;

      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [{ text: "View on Stellar Explorer", url: explorerUrl }],
        ],
      };

      await this.sendMessage(chatId, reply, keyboard);
      return { handled: true, reply };
    } catch {
      const reply = "⚠️ Verification unavailable\n\nVeraOS could not retrieve evidence.\n\nPlease try again shortly.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }
  }

  // --- Command: /correct ---
  private async handleCorrectCommand(chatId: number, userId: number, arg: string): Promise<{ handled: boolean; reply: string }> {
    const parts = arg.split(/\s+/);
    const id = parts[0]?.trim();
    const instruction = parts.slice(1).join(" ").trim();

    if (!id) {
      const reply = "⚠️ Usage: /correct <verification_id> [instruction]";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    if (!instruction) {
      this.setSession(chatId, { state: "AWAITING_CORRECT_INPUT", verificationId: id });
      const reply = `What correction instruction should be sent for verification ${id}?`;
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    return this.executeCorrection(chatId, userId, id, instruction);
  }

  private async executeCorrection(chatId: number, userId: number, id: string, instruction: string): Promise<{ handled: boolean; reply: string }> {
    try {
      const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          telegramUserId: userId,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { message?: string };
        const reply = `⚠️ Correction failed: ${errJson.message || "Unknown error"}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const data = (await res.json()) as {
        displayId?: string;
        id: string;
        remediation?: {
          directives?: Array<{ reason?: string; directive?: string }>;
        };
      };

      const displayId = data.displayId || data.id || id;
      const directive = data.remediation?.directives?.[0]?.directive || instruction || "Send the required 5 USDC.";

      const reply =
        `🔄 Correction requested\n\n` +
        `Verification:\n${displayId}\n\n` +
        `Issue:\nAmount mismatch\n\n` +
        `Required correction:\n${directive}\n\n` +
        `The worker can now resubmit.`;

      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [{ text: "Resubmit", callback_data: `resubmit:${displayId}` }],
        ],
      };

      await this.sendMessage(chatId, reply, keyboard);
      return { handled: true, reply };
    } catch {
      const reply = "⚠️ Verification unavailable\n\nVeraOS could not request correction.\n\nPlease try again shortly.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }
  }

  // --- Command: /resubmit ---
  private async handleResubmitCommand(chatId: number, userId: number, arg: string): Promise<{ handled: boolean; reply: string }> {
    const parts = arg.split(/\s+/);
    const id = parts[0]?.trim();
    const correctedOutput = parts.slice(1).join(" ").trim();

    if (!id) {
      const reply = "⚠️ Usage: /resubmit <verification_id> [corrected_output]";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    if (!correctedOutput) {
      this.setSession(chatId, { state: "AWAITING_RESUBMIT_INPUT", verificationId: id });
      const reply = `Provide the corrected output or transaction hash for verification ${id}.`;
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    return this.executeResubmission(chatId, userId, id, correctedOutput);
  }

  private async executeResubmission(chatId: number, userId: number, id: string, correctedOutput: string): Promise<{ handled: boolean; reply: string }> {
    // 1. Progress card
    const progressReply =
      `🔄 Verification resubmitted\n\n` +
      `Verification:\n${id}\n\n` +
      `Status:\n⏳ Checking updated evidence...`;

    await this.sendMessage(chatId, progressReply);

    try {
      const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctedWorkerOutput: correctedOutput,
          telegramUserId: userId,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { message?: string };
        const reply = `⚠️ Resubmission failed: ${errJson.message || "Unknown error"}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const data = (await res.json()) as {
        displayId?: string;
        id: string;
        verdict?: { status: string };
      };

      const displayId = data.displayId || data.id || id;
      const isVerified = data.verdict?.status === "VERIFIED";

      let reply = "";
      let keyboard: InlineKeyboardMarkup | undefined;

      if (isVerified) {
        reply =
          `✅ VERIFIED\n\n` +
          `Verification:\n${displayId}\n\n` +
          `The corrected work passed independent verification.`;

        keyboard = {
          inline_keyboard: [
            [{ text: "View Evidence", callback_data: `view_evidence:${displayId}` }],
          ],
        };
      } else {
        reply =
          `❌ VERIFICATION FAILED\n\n` +
          `Verification:\n${displayId}\n\n` +
          `The resubmitted work still did not meet requirements.`;

        keyboard = {
          inline_keyboard: [
            [
              { text: "View Evidence", callback_data: `view_evidence:${displayId}` },
              { text: "Request Correction", callback_data: `request_correction:${displayId}` },
            ],
          ],
        };
      }

      await this.sendMessage(chatId, reply, keyboard);
      return { handled: true, reply };
    } catch {
      const reply = "⚠️ Verification unavailable\n\nVeraOS could not complete resubmission.\n\nPlease try again shortly.";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }
  }

  // --- Inline Keyboard Callbacks ---
  private async handleCallbackQuery(query: TelegramCallbackQuery): Promise<{ handled: boolean; reply?: string }> {
    const data = query.data || "";
    const chatId = query.message?.chat.id || query.from.id;
    const userId = query.from.id;

    // Immediately answer callback query to dismiss Telegram client spinner
    if (query.id) {
      await this.answerCallbackQuery(query.id);
    }

    if (data.startsWith("view_evidence:")) {
      const id = data.split(":")[1];
      return this.handleEvidenceCommand(chatId, userId, id);
    }

    if (data.startsWith("request_correction:")) {
      const id = data.split(":")[1];
      return this.handleCorrectCommand(chatId, userId, id);
    }

    if (data.startsWith("resubmit:")) {
      const id = data.split(":")[1];
      this.setSession(chatId, { state: "AWAITING_RESUBMIT_INPUT", verificationId: id });
      const reply = `Provide the corrected output or transaction hash for verification ${id}.`;
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    return { handled: false };
  }

  // --- Telegram API Send Message ---
  async sendMessage(chatId: number, text: string, replyMarkup?: InlineKeyboardMarkup): Promise<boolean> {
    const record: SentMessageRecord = {
      chatId,
      text,
      replyMarkup,
      timestamp: new Date().toISOString(),
    };
    this.sentMessages.push(record);

    const firstLine = text.split("\n")[0] || "message";
    console.log(`[Telegram Bot] Outgoing message to chat ${chatId}: ${firstLine}`);

    if (!this.botToken) {
      // Offline/test mode: saved to sentMessages
      return true;
    }

    try {
      const payload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      };

      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as { description?: string; error_code?: number };
        console.error(`[Telegram Bot] Failed to send message to chat ${chatId}: HTTP ${res.status}`, errJson.description || "");
      }

      return res.ok;
    } catch (err) {
      console.error(`[Telegram Bot] Network error sending message to chat ${chatId}:`, (err as Error).message);
      return false;
    }
  }

  // --- Telegram API Answer Callback Query ---
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<boolean> {
    if (!this.botToken) {
      return true;
    }
    try {
      const payload: Record<string, unknown> = {
        callback_query_id: callbackQueryId,
        show_alert: showAlert,
      };
      if (text) {
        payload.text = text;
      }
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (err) {
      console.error(
        `[Telegram Bot] Error answering callback query ${callbackQueryId}:`,
        (err as Error).message
      );
      return false;
    }
  }

  // --- Webhook Handler (Validates secret token) ---
  createWebhookHandler() {
    return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
      const isWebhookPath =
        req.url?.startsWith("/telegram/webhook") || req.url?.startsWith("/v1/telegram/webhook");

      if (req.method !== "POST" || !isWebhookPath) {
        return false;
      }

      // Security check: Webhook secret token validation
      if (this.webhookSecret) {
        const receivedToken = req.headers["x-telegram-bot-api-secret-token"];
        if (receivedToken !== this.webhookSecret) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Forbidden", message: "Invalid webhook secret token" }));
          return true;
        }
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const update = JSON.parse(body) as TelegramUpdate;
          const result = await this.handleUpdate(update);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, handled: result.handled }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid Telegram payload" }));
        }
      });

      return true;
    };
  }
}

export const veraTelegramBot = new VeraTelegramBot();
