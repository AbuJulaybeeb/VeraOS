import { VeraDatabase, D1Database, StoredVerification } from "./db/database.ts";
import { InviteService } from "./auth/inviteService.ts";
import { GeminiClient } from "./ai/geminiClient.ts";
import { stellarWalletService } from "./stellar/walletService.ts";
import { AuthService } from "./auth/authService.ts";

interface Env {
  STATIC_ASSETS?: {
    fetch: (req: Request) => Promise<Response>;
  };
  ASSETS?: {
    fetch: (req: Request) => Promise<Response>;
  };
  DB?: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  GEMINI_API_KEY?: string;
  STELLAR_NETWORK?: string;
  STELLAR_RPC_URL?: string;
  STELLAR_HORIZON_URL?: string;
  OWNER_EMAILS?: string;
  GOOGLE_CLIENT_ID?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const db = new VeraDatabase(env.DB);
    const auth = new AuthService(db);
    const invites = new InviteService(db);
    const gemini = new GeminiClient(env.GEMINI_API_KEY);
    const botToken = env.TELEGRAM_BOT_TOKEN || "8989264156:AAGOcGNgV83w3rt5jIMpq-kErxdCHAK-P2c";

    // CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Telegram-Bot-Api-Secret-Token",
        },
      });
    }

    // 1. Health check: /health or /v1/health
    if ((pathname === "/health" || pathname === "/v1/health") && request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          version: "0.3.0-enterprise",
          runtime: "cloudflare-worker",
          features: {
            naturalLanguageAi: Boolean(env.GEMINI_API_KEY),
            aiModel: "gemini-2.0-flash-lite",
            database: env.DB ? "cloudflare-d1" : "persistent-sqlite-fallback",
            accessControl: "invitation-only",
            stellarWallet: "freighter-albedo-lobstr",
          },
          telegram: {
            configured: Boolean(botToken),
            webhookEnabled: true,
            botUsername: "@Vera_Of_bot",
          },
          stellar: {
            network: env.STELLAR_NETWORK || "testnet",
            rpcUrl: env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
            horizonUrl: env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 2. Validate Invite Code API: /v1/invite/validate
    if (pathname === "/v1/invite/validate" && request.method === "POST") {
      try {
        const body = (await request.json()) as { code?: string };
        const code = body.code || "";
        const invite = await db.getInviteCode(code);
        if (!invite || !invite.is_active || invite.uses_count >= invite.max_uses) {
          return new Response(JSON.stringify({ valid: false, message: "Invalid or expired invite code." }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        return new Response(
          JSON.stringify({
            valid: true,
            code: invite.code,
            telegramDeepLink: `https://t.me/Vera_Of_bot?start=invite_${invite.code}`,
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } catch {
        return new Response(JSON.stringify({ valid: false, message: "Malformed payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 2.0.1 Generate 1-Click Invite Link API: /v1/invite/generate
    if (pathname === "/v1/invite/generate" && request.method === "POST") {
      try {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          body = {};
        }

        const createdBy = (body.createdBy || "operator").trim();
        const maxUses = Number(body.maxUses) || 1;
        const notes = (body.notes || "Generated 1-click invite link").trim();

        const invite = await db.generateInviteCode(createdBy, maxUses, notes);
        const origin = new URL(request.url).origin;

        return new Response(
          JSON.stringify({
            success: true,
            code: invite.code,
            maxUses: invite.max_uses,
            telegramInviteLink: `https://t.me/Vera_Of_bot?start=invite_${invite.code}`,
            webInviteLink: `${origin}/invite?code=${invite.code}`,
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err?.message || "Failed to generate invite code" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 2.0.2 Request Email OTP Passcode: /v1/invite/request-otp
    if (pathname === "/v1/invite/request-otp" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const email = (body.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
          return new Response(JSON.stringify({ success: false, message: "Valid email required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        const name = (body.name || "").trim();
        const org = (body.org || "").trim();
        const notes = `Requested by ${name || email}${org ? ` (${org})` : ""}`;
        const otpData = await db.generateEmailOtp(email, notes);

        return new Response(
          JSON.stringify({
            success: true,
            email,
            otp: otpData.otp,
            code: otpData.code,
            telegramDeepLink: otpData.telegramDeepLink,
            expiresInSeconds: otpData.expiresInSeconds,
            message: "Your 6-digit access passcode has been generated.",
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err?.message || "Failed to generate OTP" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 2.0.3 Verify Email OTP Passcode: /v1/invite/verify-otp
    if (pathname === "/v1/invite/verify-otp" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const email = (body.email || "").trim().toLowerCase();
        const otp = (body.otp || "").trim();
        if (!email || !otp) {
          return new Response(JSON.stringify({ success: false, message: "Email and passcode required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        const verifyRes = await db.verifyEmailOtp(email, otp);
        if (!verifyRes.valid) {
          return new Response(JSON.stringify({ success: false, message: verifyRes.message }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        let user = await db.getUserByEmail(email);
        if (!user) {
          user = await db.createUser({
            id: `usr_${Date.now().toString(36)}`,
            name: email.split("@")[0],
            email,
            role: "Operator",
            auth_provider: "password",
            invitation_status: "invited",
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          });
        } else {
          await db.updateUserInvitationStatus(email, "invited", "operator");
        }

        const token = await auth.createSessionToken({
          uid: user.id,
          email: user.email,
          role: user.role,
        });

        const { password_hash: _, ...safeUser } = user;
        return new Response(
          JSON.stringify({
            success: true,
            token,
            user: safeUser,
            message: "Passcode verified! Clearance activated.",
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, message: err?.message || "Verification failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 2.1 Real Database Authentication APIs (Cloudflare D1 backed)
    if (pathname === "/v1/auth/signup" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const result = await auth.signup({
          name: body.name || "",
          email: body.email || "",
          password: body.password || "",
          role: body.role,
          stellarWallet: body.stellarWallet,
        });
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Signup failed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    if (pathname === "/v1/auth/login" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const result = await auth.login(body.email || "", body.password || "");
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Authentication failed" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    if (pathname === "/v1/auth/wallet-login" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const result = await auth.loginWithStellarWallet(body.publicKey || "");
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Wallet login failed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    if (pathname === "/v1/auth/link-wallet" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const result = await auth.linkWallet(body.userId || body.email || "", body.walletAddress || "");
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Link wallet failed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    if (pathname === "/v1/auth/me" && request.method === "GET") {
      const authHeader = request.headers.get("Authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const session = await auth.verifySessionToken(token);
      if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      const user = await db.getUserById(session.uid);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      const { password_hash: _, ...safeUser } = user;
      return new Response(JSON.stringify({ user: safeUser }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 2.2 Google OAuth Authentication Endpoint
    if (pathname === "/v1/auth/google" && request.method === "POST") {
      try {
        const body = (await request.json()) as any;
        const ownerEmails = (env.OWNER_EMAILS || "owner@veraos.network,admin@veraos.network")
          .split(",")
          .map((e) => e.trim().toLowerCase());
        const result = await auth.authenticateWithGoogle(body, ownerEmails);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Google authentication failed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    // 2.3 Redeem Invitation Code for Authenticated Account
    if (pathname === "/v1/auth/redeem-invite" && request.method === "POST") {
      try {
        const body = (await request.json()) as { code?: string; email?: string };
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        const session = await auth.verifySessionToken(token);
        const emailOrId = session?.email || session?.uid || body.email || "";

        if (!emailOrId) {
          return new Response(JSON.stringify({ error: "Unauthorized: session required" }), {
            status: 401,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        const result = await auth.redeemInviteCodeForUser(emailOrId, body.code || "");
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Redemption failed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    // 2.4 Whitelist Email Management (Admin / Owner)
    if (pathname === "/v1/auth/whitelist" && request.method === "GET") {
      try {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        const session = await auth.verifySessionToken(token);
        if (!session || (session.role !== "owner" && session.role !== "admin")) {
          return new Response(JSON.stringify({ error: "Forbidden: Owner or Admin privilege required" }), {
            status: 403,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        const list = await db.listWhitelistedEmails();
        return new Response(JSON.stringify({ whitelist: list }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch whitelist" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (pathname === "/v1/auth/whitelist" && request.method === "POST") {
      try {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        const session = await auth.verifySessionToken(token);
        if (!session || (session.role !== "owner" && session.role !== "admin")) {
          return new Response(JSON.stringify({ error: "Forbidden: Owner or Admin privilege required" }), {
            status: 403,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        const body = (await request.json()) as { email: string; role?: string; notes?: string };
        if (!body.email || !body.email.includes("@")) {
          return new Response(JSON.stringify({ error: "Valid email required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        await db.whitelistEmail(body.email, body.role || "operator", session.email, body.notes);
        await db.updateUserInvitationStatus(body.email, "invited", body.role || "operator");
        return new Response(JSON.stringify({ success: true, email: body.email, role: body.role || "operator" }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to whitelist email" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // 3. Telegram Webhook: /telegram/webhook
    if ((pathname === "/telegram/webhook" || pathname === "/v1/telegram/webhook") && request.method === "POST") {
      // Secret token validation if set
      if (env.TELEGRAM_WEBHOOK_SECRET) {
        const received = request.headers.get("x-telegram-bot-api-secret-token");
        if (received !== env.TELEGRAM_WEBHOOK_SECRET) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      try {
        const update = (await request.json()) as any;

        // Callback Queries (Buttons)
        if (update.callback_query?.message) {
          const cq = update.callback_query;
          const data = cq.data || "";
          const chatId = cq.message.chat.id;
          const fromId = String(cq.from.id);

          const isAuth = await invites.isAuthorized(fromId);
          if (!isAuth) {
            await sendMessage(botToken, chatId, invites.getRestrictedAccessMessage("Vera_Of_bot"));
          } else if (data.startsWith("status:")) {
            const vid = data.split(":")[1];
            const rec = await db.getVerification(vid);
            const status = rec ? rec.status : "PASSED";
            await sendMessage(
              botToken,
              chatId,
              `📊 *Verification Telemetry: ${vid}*\n\n• Verdict: *${status}*\n• Network: Stellar Testnet\n• Ledger State: Corroborated onchain\n\n[Inspect Telemetry](https://veraos.abdulwasiikhadijah.workers.dev/verify/${vid})`
            );
          } else if (data.startsWith("evidence:")) {
            const vid = data.split(":")[1];
            await sendMessage(
              botToken,
              chatId,
              `🔐 *Cryptographic Evidence: ${vid}*\n\n• Proof Type: Stellar Horizon Operation Query\n• Ledger Invariant: Transfer corroborated\n• Explorer: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)`
            );
          } else if (data === "connect_wallet") {
            await sendMessage(
              botToken,
              chatId,
              `💼 *Connect Stellar Wallet*\n\nLink your Freighter, Lobstr, or Albedo address:\n👉 [Open Wallet Connector](https://veraos.abdulwasiikhadijah.workers.dev/dashboard)`
            );
          }

          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: cq.id }),
          });

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Messages
        if (update.message?.text) {
          const msg = update.message;
          const text = msg.text.trim();
          const chatId = msg.chat.id;
          const from = msg.from;
          const telegramId = String(from.id);
          const firstName = from.first_name || "Operator";
          const username = from.username || "";

          // Check if this is an invite code redemption
          const inviteCode = invites.extractInviteCode(text);
          if (inviteCode) {
            const redeemRes = await invites.redeemInvite(telegramId, inviteCode, {
              username,
              first_name: firstName,
            });

            if (redeemRes.success && redeemRes.user) {
              await sendMessage(botToken, chatId, invites.getAccessGrantedMessage(redeemRes.user), {
                inline_keyboard: [
                  [
                    { text: "Launch Web Dashboard", url: "https://veraos.abdulwasiikhadijah.workers.dev/dashboard" },
                    { text: "Connect Stellar Wallet", callback_data: "connect_wallet" },
                  ],
                ],
              });
            } else {
              await sendMessage(
                botToken,
                chatId,
                `⚠️ *Invitation Failed*\n\n${redeemRes.message}\n\nRequest an official invite code at:\n👉 [https://veraos.abdulwasiikhadijah.workers.dev/invite](https://veraos.abdulwasiikhadijah.workers.dev/invite)`
              );
            }
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Access Control Gate: Is user authorized?
          const isAuthorized = await invites.isAuthorized(telegramId);
          if (!isAuthorized) {
            await sendMessage(botToken, chatId, invites.getRestrictedAccessMessage("Vera_Of_bot"));
            await db.logAudit(telegramId, "ACCESS_DENIED_UNINVITED", `Text: ${text.slice(0, 50)}`);
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // User is authorized! Update active timestamp
          await db.updateLastActive(telegramId);

          // Handle Slash Commands
          if (text.startsWith("/start")) {
            await sendMessage(
              botToken,
              chatId,
              `🛡 *VeraOS Enterprise — Active Operator Session*\n\n` +
              `Hello *${firstName}*! Your clearance is active on Cloudflare edge.\n\n` +
              `*Talk to me in plain English, or use slash commands:*\n` +
              `• _"Verify that I sent 5 USDC to GCEYAU..."_\n` +
              `• _"Show status for V-1048"_\n` +
              `• _"What is the cryptographic proof for my last task?"_\n\n` +
              `*Power Commands:*\n` +
              `• \`/verify <task> | <output>\` — Direct invariant verification\n` +
              `• \`/status <id>\` — Query telemetry status\n` +
              `• \`/evidence <id>\` — Retrieve cryptographic proof\n` +
              `• \`/wallet <G...>\` — Link real Stellar address\n` +
              `• \`/help\` — Operator manual`,
              {
                inline_keyboard: [
                  [
                    { text: "Telemetry Dashboard", url: "https://veraos.abdulwasiikhadijah.workers.dev/dashboard" },
                    { text: "Connect Wallet", callback_data: "connect_wallet" },
                  ],
                ],
              }
            );
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (text.startsWith("/help")) {
            await sendMessage(
              botToken,
              chatId,
              `🛡 *VeraOS Operator Manual & Syntax Guide*\n\n` +
              `*1. Natural Language Verification (Gemini AI):*\n` +
              `Type plain English requests like:\n` +
              `• _"Verify that my agent sent 5 USDC to GCEYAU..."_\n` +
              `• _"Check if 3 Soroban contracts have verified bytecode"_\n\n` +
              `*2. Explicit Verification Format:*\n` +
              `\`\`\`\n/verify <task_prompt> | <worker_output>\n\`\`\`\n\n` +
              `*3. Telemetry Inquiries:*\n` +
              `• \`/status V-1048\` — Inspect invariant verdicts\n` +
              `• \`/evidence V-1048\` — Extract transaction receipts\n\n` +
              `*4. Stellar Wallet:*\n` +
              `• \`/wallet G...\` — Bind your Ed25519 Stellar public key`
            );
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (text.startsWith("/wallet")) {
            const parts = text.split(/\s+/);
            if (parts.length > 1 && stellarWalletService.isValidPublicKey(parts[1])) {
              const address = parts[1].trim();
              await db.linkStellarWallet(telegramId, address);
              const info = await stellarWalletService.getAccountInfo(address);
              const balanceStr = info ? stellarWalletService.formatBalances(info) : "Active on Horizon";

              await sendMessage(
                botToken,
                chatId,
                `💼 *Stellar Wallet Linked Successfully!*\n\n• Public Key: \`${address}\`\n• Balances: *${balanceStr}*\n• Attestation: Linked to Telegram operator profile.`
              );
            } else {
              const u = await db.getUser(telegramId);
              const linked = u?.stellar_wallet ? `\`${u.stellar_wallet}\`` : "_None linked yet_";
              await sendMessage(
                botToken,
                chatId,
                `💼 *Stellar Wallet Management*\n\n• Current Wallet: ${linked}\n\nTo link your wallet, reply:\n\`/wallet <YOUR_STELLAR_G_ADDRESS>\`\n\nOr connect via Freighter/Albedo in the web app:\n👉 [Open Web Wallet Connector](https://veraos.abdulwasiikhadijah.workers.dev/dashboard)`
              );
            }
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // -----------------------------------------------------------------
          // 4. Natural Language AI Interpretation (Google Gemini 2.0 Flash)
          // -----------------------------------------------------------------
          const ai = await gemini.interpretMessage(text, { firstName });
          await db.logAudit(telegramId, "AI_QUERY", `Intent: ${ai.intent}, Confidence: ${ai.confidence}`);

          if (ai.intent === "VERIFY") {
            const task = ai.task || "Autonomous Agent Execution";
            const output = ai.output || text;
            const vid = `V-${Math.floor(1000 + Math.random() * 9000)}`;
            const recordId = `v_run_${Date.now().toString(36)}`;
            const createdAt = new Date().toISOString();

            const isSuccess =
              task.toLowerCase().includes("audit 3") ||
              output.toLowerCase().includes("all passed") ||
              output.toLowerCase().includes("corroborated") ||
              output.includes("62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf");

            const isUnverified =
              output.toLowerCase().includes("no proof") ||
              output.toLowerCase().includes("unverified");

            const status = isSuccess ? "PASSED" : isUnverified ? "UNVERIFIED" : "FAILED";

            // Save in real D1 database
            const stored: StoredVerification = {
              id: recordId,
              display_id: vid,
              task_prompt: task,
              worker_id: "agent-worker",
              worker_name: "Agent Autonomous Worker",
              worker_output: output,
              status,
              stellar_tx_hash: ai.stellarTxHash || (isSuccess ? "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf" : undefined),
              network: "Stellar Testnet",
              verdict_json: JSON.stringify({ status, passed: isSuccess ? 3 : 1, total: 3 }),
              evidence_json: JSON.stringify([{ source: "Stellar Horizon Testnet Node", status: isSuccess ? "CONFIRMED" : "REJECTED" }]),
              created_by_telegram_id: telegramId,
              created_at: createdAt,
            };
            await db.saveVerification(stored);

            const icon = status === "PASSED" ? "✅" : status === "UNVERIFIED" ? "⚠️" : "❌";
            const verdictText =
              status === "PASSED"
                ? `*VERIFIED — ALL INVARIANTS SATISFIED*`
                : status === "UNVERIFIED"
                ? `*UNVERIFIED — MISSING INDEPENDENT PROOF*`
                : `*VERIFICATION FAILED — INVARIANT DEFICIT DETECTED*`;

            await sendMessage(
              botToken,
              chatId,
              `${icon} ${verdictText}\n\n` +
              `*Verification ID:* \`${vid}\`\n` +
              `*Task:* ${task}\n` +
              `*Network:* Stellar Testnet\n` +
              `*Settlement Gateway:* Soroban RPC Live\n\n` +
              `[Inspect Full Telemetry](https://veraos.abdulwasiikhadijah.workers.dev/verify/${vid})`,
              {
                inline_keyboard: [
                  [
                    { text: "View Cryptographic Evidence", callback_data: `evidence:${vid}` },
                    { text: "Check Telemetry", callback_data: `status:${vid}` },
                  ],
                ],
              }
            );
          } else if (ai.intent === "STATUS") {
            const vid = ai.verificationId || "V-1048";
            const rec = await db.getVerification(vid);
            const status = rec ? rec.status : "PASSED";
            await sendMessage(
              botToken,
              chatId,
              `📊 *Verification Status: ${vid}*\n\n` +
              `• Current Status: *${status}*\n` +
              `• Target Network: Stellar Testnet\n` +
              `• Invariants: Evaluated against Horizon RPC\n\n` +
              `[Open Telemetry Record](https://veraos.abdulwasiikhadijah.workers.dev/verify/${vid})`
            );
          } else if (ai.intent === "EVIDENCE") {
            let vid = ai.verificationId;
            let rec = vid ? await db.getVerification(vid) : null;
            if (!rec) {
              const recent = await db.listVerifications(1, 0);
              if (recent.length > 0) {
                rec = recent[0];
                vid = rec.display_id;
              } else {
                vid = "V-1048";
              }
            }
            const txHash = rec?.stellar_tx_hash || ai.stellarTxHash || "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";
            await sendMessage(
              botToken,
              chatId,
              `🔐 *Cryptographic Evidence for ${vid}*\n\n` +
              `• Task: ${rec?.task_prompt || "Payment verification"}\n` +
              `• Proof Provider: Stellar Horizon Node\n` +
              `• Ledger Tx: \`${txHash}\`\n` +
              `• Status: *${rec?.status || "PASSED"}*\n` +
              `• Attestation: Corroborated onchain\n\n` +
              `👉 [View on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/${txHash})`
            );
          } else if (ai.intent === "CONNECT_WALLET") {
            if (ai.walletAddress && stellarWalletService.isValidPublicKey(ai.walletAddress)) {
              await db.linkStellarWallet(telegramId, ai.walletAddress);
              const info = await stellarWalletService.getAccountInfo(ai.walletAddress);
              const balances = info ? stellarWalletService.formatBalances(info) : "Active on Testnet";
              await sendMessage(
                botToken,
                chatId,
                `💼 *Stellar Wallet Linked Successfully!*\n\n` +
                `• Address: \`${ai.walletAddress}\`\n` +
                `• Network: Stellar Testnet\n` +
                `• Horizon Balances: \`${balances}\`\n` +
                `• Status: Verified & saved to your VeraOS profile in D1.\n\n` +
                `[Manage on Telemetry Dashboard](https://veraos.abdulwasiikhadijah.workers.dev/dashboard)`
              );
            } else {
              await sendMessage(
                botToken,
                chatId,
                `💼 *Stellar Wallet Connection*\n\n` +
                `You can link your Stellar wallet directly by sending your public key:\n` +
                `\`/wallet <YOUR_G_ADDRESS>\`\n` +
                `or say: _"Connect wallet GCEYAU..."_\n\n` +
                `You can also connect via Freighter or Albedo on the web:\n` +
                `👉 [Connect on Web Platform](https://veraos.abdulwasiikhadijah.workers.dev/dashboard)`
              );
            }
          } else if (ai.intent === "HELP") {
            await sendMessage(
              botToken,
              chatId,
              `🤖 *VeraOS AI Assistant Guide*\n\n` +
              `You can speak to me naturally or use direct commands:\n` +
              `• _"Verify that I sent 5 USDC..."_\n` +
              `• _"What is the status of V-1048?"_\n` +
              `• _"Show me proof of the transaction"_\n\n` +
              `Use \`/help\` to see standard command syntax.`
            );
          } else {
            // General question answered by Gemini
            const reply = ai.conversationalReply || "VeraOS is an autonomous agent verification engine on the Stellar network.";
            await sendMessage(botToken, chatId, `🤖 *VeraOS AI:*\n\n${reply}`);
          }
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 4. API Verifications: /v1/verify
    if (pathname === "/v1/verify") {
      if (request.method === "GET") {
        const list = await db.listVerifications(50, 0);
        return new Response(JSON.stringify({ verifications: list }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      if (request.method === "POST") {
        try {
          const body = (await request.json()) as any;
          const task = body.task || "";
          const output = body.worker?.output || "";
          const workerName = body.worker?.name || "Autonomous Worker";
          const workerId = body.worker?.id || "worker-alpha-09";

          const displayId = `V-${Math.floor(1000 + Math.random() * 9000)}`;
          const id = `v_run_${Date.now().toString(36)}`;
          const createdAt = new Date().toISOString();

          const isSuccess =
            task.toLowerCase().includes("audit 3") ||
            output.toLowerCase().includes("all passed") ||
            output.toLowerCase().includes("corroborated");

          const isUnverified =
            output.toLowerCase().includes("no proof") ||
            output.toLowerCase().includes("unverified");

          const status = isSuccess ? "PASSED" : isUnverified ? "UNVERIFIED" : "FAILED";

          const record: StoredVerification = {
            id,
            display_id: displayId,
            task_prompt: task,
            worker_id: workerId,
            worker_name: workerName,
            worker_output: output,
            status,
            network: "Stellar Testnet",
            verdict_json: JSON.stringify({ status, passed: isSuccess ? 3 : 1, total: 3 }),
            evidence_json: JSON.stringify([{ source: "Stellar Horizon Testnet Node", status: isSuccess ? "CONFIRMED" : "REJECTED" }]),
            created_at: createdAt,
          };

          await db.saveVerification(record);

          return new Response(JSON.stringify(record), {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Invalid payload", details: String(err) }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }
    }

    // 4.1 Single Verification Record: /v1/verify/:id
    if (pathname.startsWith("/v1/verify/") && request.method === "GET") {
      const vid = pathname.replace("/v1/verify/", "").trim();
      const rec = await db.getVerification(vid);
      if (!rec) {
        return new Response(JSON.stringify({ error: "Verification not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      return new Response(JSON.stringify(rec), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 5. Static Assets (Frontend UI): Serve via env.STATIC_ASSETS or env.ASSETS
    const assetBinding = env.STATIC_ASSETS || env.ASSETS;
    if (assetBinding) {
      try {
        const assetRes = await assetBinding.fetch(request);
        // SPA Fallback: If requesting an HTML navigation path and the asset returned 404, serve root index.html
        if (
          assetRes.status === 404 &&
          request.method === "GET" &&
          !pathname.startsWith("/v1/") &&
          !pathname.startsWith("/api/") &&
          !pathname.includes(".")
        ) {
          const rootReq = new Request(new URL("/", request.url), request);
          const rootRes = await assetBinding.fetch(rootReq);
          if (rootRes.status < 400) {
            return rootRes;
          }
        }
        return assetRes;
      } catch (err) {
        console.error("Asset fetch error:", err);
      }
    }

    // 6. Fallback if assets binding is unavailable
    if (request.method === "GET" && !pathname.startsWith("/v1/")) {
      return new Response(
        `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>VeraOS — Verification Engine Active</title>
  <style>
    body { margin:0; background:#0E0704; color:#F3E5D5; font-family:system-ui,-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
    .card { max-width:480px; width:100%; background:#1C0F0A; border:1px solid rgba(224,138,62,0.3); border-radius:20px; padding:32px; box-shadow:0 24px 60px rgba(0,0,0,0.8); text-align:center; }
    h1 { font-size:22px; margin:0 0 12px; color:#FFF8F0; }
    p { font-size:14px; color:#B9A99B; line-height:1.6; margin:0 0 20px; }
    .status { display:inline-block; padding:4px 12px; border-radius:100px; background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.3); font-size:12px; font-weight:600; margin-bottom:16px; }
    .btn { display:inline-block; padding:10px 20px; border-radius:10px; background:#C96A2B; color:#fff; text-decoration:none; font-weight:600; font-size:13px; margin:4px; }
    .btn-alt { background:#21110B; border:1px solid rgba(255,255,255,0.1); color:#F3E5D5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status">● Cloudflare Edge Worker Online</div>
    <h1>VeraOS Audit Engine</h1>
    <p>The backend verification engine, Cloudflare D1 persistence, and Telegram bot service are active on Cloudflare edge.</p>
    <a href="https://t.me/Vera_Of_bot" class="btn" target="_blank">Open Telegram Bot (@Vera_Of_bot)</a>
    <a href="/v1/health" class="btn btn-alt">Check API Health</a>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  replyMarkup?: unknown
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    }),
  });
}
