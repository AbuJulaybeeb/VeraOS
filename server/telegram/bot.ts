import type { IncomingMessage, ServerResponse } from "node:http";

export interface TelegramUpdate {
  update_id: number;
  message?: {
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
  };
}

export class VeraTelegramBot {
  private botToken: string;
  private apiBaseUrl: string;

  constructor(botToken?: string, apiBaseUrl = "http://localhost:5173") {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || "";
    this.apiBaseUrl = apiBaseUrl;
  }

  async handleUpdate(update: TelegramUpdate): Promise<{ handled: boolean; reply?: string }> {
    const message = update.message;
    if (!message || !message.text) {
      return { handled: false };
    }

    const text = message.text.trim();
    const chatId = message.chat.id;

    // Command router
    if (text === "/start") {
      const reply =
        "👋 *Welcome to VeraOS Verification Bot!*\n\n" +
        "VeraOS independently verifies autonomous AI agent work before you trust or pay.\n\n" +
        "⚡ *Commands:*\n" +
        "• `/verify <task> | <worker output>` — Verify an agent submission\n" +
        "• `/status <id>` — Check status of a verification (e.g., `/status V-1048`)\n" +
        "• `/evidence <id>` — View Stellar onchain evidence\n" +
        "• `/resubmit <id> | <corrected output>` — Submit a correction for a failed task\n" +
        "• `/help` — How it works & guidelines";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    if (text === "/help") {
      const reply =
        "🛡️ *VeraOS — Verify Before You Trust*\n\n" +
        "AI agents can make mistakes or claim they sent funds when they underpaid. " +
        "VeraOS checks agent outputs against real data on the *Stellar Horizon ledger*.\n\n" +
        "*Example Verification Command:*\n" +
        "`/verify Find 3 Stellar protocols and pay 5 USDC | 1. Blend, 2. YieldBlox, 3. Aqua. Sent 5 USDC Tx: 0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de`\n\n" +
        "Questions? Visit [VeraOS Network](https://veraos.network)";
      await this.sendMessage(chatId, reply);
      return { handled: true, reply };
    }

    if (text.startsWith("/verify")) {
      const payload = text.slice(7).trim();
      if (!payload.includes("|")) {
        const reply =
          "⚠️ *Format Error*\n\n" +
          "Please separate the task and the worker output with a pipe `|`.\n\n" +
          "*Example:*\n" +
          "`/verify Pay 5 USDC to GBBD47... | Sent 5.0 USDC TxHash: 0x5f9e2b1892f3900a41cd8a7b3c21a4de99f2b1892f3900a41cd8a7b3c21a4de`";
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const [task, workerOutput] = payload.split("|").map((s) => s.trim());

      try {
        const res = await fetch(`${this.apiBaseUrl}/v1/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task,
            worker: {
              id: `tg_user_${message.from?.id || "anon"}`,
              name: message.from?.first_name || "Telegram User",
              output: workerOutput,
            },
          }),
        });

        if (!res.ok) {
          const errData = (await res.json()) as { message?: string };
          const reply = `❌ *Verification Request Failed*: ${errData.message || "Unknown error"}`;
          await this.sendMessage(chatId, reply);
          return { handled: true, reply };
        }

        const data = (await res.json()) as {
          id: string;
          verificationId: string;
          status: string;
          verdict: {
            status: string;
            passed: number;
            total: number;
            summary: string;
            failureReasons: string[];
          };
          remediation?: {
            directives: Array<{ reason?: string }>;
          };
        };

        const isVerified = data.verdict.status === "VERIFIED";
        const icon = isVerified ? "✅" : "❌";

        let reply =
          `${icon} *VERIFICATION RESULT: ${data.verdict.status}*\n\n` +
          `• *ID*: \`${data.verificationId || data.id}\`\n` +
          `• *Score*: ${data.verdict.passed}/${data.verdict.total} requirements passed\n` +
          `• *Summary*: ${data.verdict.summary}\n`;

        if (!isVerified && data.remediation?.directives?.length) {
          reply += "\n🔧 *Actionable Directives Required:*\n";
          for (const d of data.remediation.directives) {
            reply += `• ${d.reason || "Remediate breach"}\n`;
          }
          reply += `\nUse \`/resubmit ${data.verificationId || data.id} | <corrected output>\` to fix.`;
        }

        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      } catch (err) {
        const reply = `❌ *Engine Error*: ${err instanceof Error ? err.message : "Failed to reach VeraOS API"}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }
    }

    if (text.startsWith("/status") || text.startsWith("/evidence")) {
      const id = text.split(" ")[1]?.trim();
      if (!id) {
        const reply = "⚠️ *Usage*: `/status <id>` or `/evidence <id>`";
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      try {
        const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const reply = `🔍 *Verification '${id}' not found.*`;
          await this.sendMessage(chatId, reply);
          return { handled: true, reply };
        }

        const data = (await res.json()) as {
          id: string;
          displayId?: string;
          task: string;
          status?: string;
          verdict?: {
            status: string;
            summary: string;
          };
          evidence?: Array<{
            claim?: string;
            source: string;
            metadata?: { explorerUrl?: string };
          }>;
        };

        let reply =
          `📋 *Verification Report: ${data.displayId || data.id}*\n\n` +
          `• *Task*: ${data.task}\n` +
          `• *Status*: *${data.verdict?.status || data.status}*\n` +
          `• *Summary*: ${data.verdict?.summary || "Evaluated"}\n\n` +
          `*Stellar Ledger Evidence:*`;

        if (data.evidence && data.evidence.length > 0) {
          for (const e of data.evidence) {
            reply += `\n• ${e.claim || e.source}`;
            if (e.metadata?.explorerUrl) {
              reply += `\n  🔗 [Stellar Expert Explorer](${e.metadata.explorerUrl})`;
            }
          }
        } else {
          reply += "\n• No independent evidence records attached.";
        }

        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      } catch (err) {
        const reply = `❌ *Error*: ${err instanceof Error ? err.message : "Lookup failed"}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }
    }

    if (text.startsWith("/resubmit") || text.startsWith("/correct")) {
      const payload = text.replace(/^\/(?:resubmit|correct)\s*/, "").trim();
      if (!payload.includes("|")) {
        const reply = "⚠️ *Usage*: `/resubmit <id> | <corrected output or tx hash>`";
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }

      const [id, newOutput] = payload.split("|").map((s) => s.trim());

      try {
        const res = await fetch(`${this.apiBaseUrl}/v1/verify/${encodeURIComponent(id)}/resubmit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correctedWorkerOutput: newOutput,
          }),
        });

        if (!res.ok) {
          const errData = (await res.json()) as { message?: string };
          const reply = `❌ *Correction Failed*: ${errData.message || "Error"}`;
          await this.sendMessage(chatId, reply);
          return { handled: true, reply };
        }

        const updated = (await res.json()) as {
          verdict?: { status: string; summary: string };
        };

        const icon = updated.verdict?.status === "VERIFIED" ? "✅" : "⚠️";
        const reply =
          `${icon} *Correction Processed!*\n\n` +
          `• *Status*: *${updated.verdict?.status || "UPDATED"}*\n` +
          `• *Summary*: ${updated.verdict?.summary || "Re-evaluated"}`;

        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      } catch (err) {
        const reply = `❌ *Error*: ${err instanceof Error ? err.message : "Resubmission failed"}`;
        await this.sendMessage(chatId, reply);
        return { handled: true, reply };
      }
    }

    return { handled: false };
  }

  async sendMessage(chatId: number, text: string): Promise<boolean> {
    if (!this.botToken) {
      // Offline/Test Mode: bot token not configured, return true without network call
      return true;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Webhook handler for Express/HTTP server integration
  createWebhookHandler() {
    return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
      if (req.method !== "POST" || !req.url?.startsWith("/telegram/webhook")) {
        return false;
      }

      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", async () => {
        try {
          const update = JSON.parse(data) as TelegramUpdate;
          await this.handleUpdate(update);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid Telegram payload" }));
        }
      });
      return true;
    };
  }
}

export const veraTelegramBot = new VeraTelegramBot();
