import test from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { handleApiRequest } from "../api/routes.ts";
import { VeraTelegramBot, type TelegramUpdate } from "../telegram/bot.ts";
import { defaultRepository } from "../storage/memoryRepository.ts";

// Real Stellar Testnet transaction hashes
const RECIPIENT_ADDRESS = "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L";
const DECEPTIVE_TX_HASH = "108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759";
const CORRECT_TX_HASH = "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";

let server: Server;
let testPort: number;
let bot: VeraTelegramBot;

test.before(async () => {
  testPort = 3099;
  server = createServer(async (req, res) => {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(testPort, () => resolve()));
  bot = new VeraTelegramBot("", `http://localhost:${testPort}`);
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// =========================================================================
// PART 1: BOT COMMAND TESTS
// =========================================================================

test("Telegram Bot: /start returns polished VeraOS introduction and command list", async () => {
  const update: TelegramUpdate = {
    update_id: 1,
    message: {
      message_id: 101,
      from: { id: 1001, first_name: "Alice" },
      chat: { id: 1001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/start",
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🛡 VeraOS"), "Must include brand header");
  assert.ok(res.reply?.includes("The verification layer for AI agents"), "Must include positioning");
  assert.ok(res.reply?.includes("/verify"), "Must list /verify");
  assert.ok(res.reply?.includes("/status"), "Must list /status");
  assert.ok(res.reply?.includes("/evidence"), "Must list /evidence");
  assert.ok(res.reply?.includes("/correct"), "Must list /correct");
  assert.ok(res.reply?.includes("/resubmit"), "Must list /resubmit");
});

test("Telegram Bot: /help returns concise operator command guide", async () => {
  const update: TelegramUpdate = {
    update_id: 2,
    message: {
      message_id: 102,
      from: { id: 1001, first_name: "Alice" },
      chat: { id: 1001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/help",
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🛡 VeraOS Commands"));
  assert.ok(res.reply?.includes("/status <verification_id>"));
});

test("Telegram Bot: Conversational /verify prompt flow", async () => {
  const chatId = 2001;
  const userId = 2001;

  // Step 1: User sends bare /verify
  const step1 = await bot.handleUpdate({
    update_id: 3,
    message: {
      message_id: 103,
      from: { id: userId, first_name: "Bob" },
      chat: { id: chatId, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/verify",
    },
  });

  assert.equal(step1.handled, true);
  assert.equal(step1.reply, "What should be verified?", "Must prompt user conversationally");

  // Step 2: User provides conversational verification prompt with deceptive real tx
  const step2 = await bot.handleUpdate({
    update_id: 4,
    message: {
      message_id: 104,
      from: { id: userId, first_name: "Bob" },
      chat: { id: chatId, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `Send 5 USDC to ${RECIPIENT_ADDRESS} | Sent 5 USDC via tx ${DECEPTIVE_TX_HASH}`,
    },
  });

  assert.equal(step2.handled, true);
  assert.ok(step2.reply?.includes("❌ VERIFICATION FAILED"), "Must render FAILED card");
  assert.ok(
    step2.reply?.includes("Requirement:\n5 USDC") ||
      step2.reply?.includes("Requirement:\n5.00 USDC") ||
      step2.reply?.includes("5 USDC") ||
      step2.reply?.includes("5.00 USDC"),
    "Must state Requirement: 5 USDC or 5.00 USDC"
  );
  assert.ok(
    step2.reply?.includes("Observed:\n0.50 USDC") ||
      step2.reply?.includes("Observed:\n0.5 USDC") ||
      step2.reply?.includes("0.50 USDC") ||
      step2.reply?.includes("0.5 USDC"),
    "Must state Observed: 0.5 USDC or 0.50 USDC"
  );
  assert.ok(
    step2.reply?.includes("Difference:\n-4.50 USDC") ||
      step2.reply?.includes("Difference:\n-4.5 USDC") ||
      step2.reply?.includes("-4.50 USDC") ||
      step2.reply?.includes("-4.5 USDC"),
    "Must state Difference: -4.5 USDC or -4.50 USDC"
  );
  assert.ok(step2.reply?.includes("✗ Amount"), "Must check Amount failure");
  assert.ok(step2.reply?.includes("✓ Transaction exists"), "Must corroborate Transaction exists");

  // Check that sent message in history has inline keyboard buttons
  const lastMsg = bot.sentMessages[bot.sentMessages.length - 1];
  assert.ok(lastMsg.replyMarkup?.inline_keyboard, "Must supply inline keyboard");
  const buttons = lastMsg.replyMarkup.inline_keyboard.flat();
  assert.ok(buttons.some((b) => b.text === "View Evidence"), "Must have View Evidence button");
  assert.ok(buttons.some((b) => b.text === "Request Correction"), "Must have Request Correction button");
});

test("Telegram Bot: /status returns current state from VeraOS backend", async () => {
  // Create a record directly via API
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${CORRECT_TX_HASH}` },
      telegramUserId: 3001,
      telegramChatId: 3001,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  const update: TelegramUpdate = {
    update_id: 5,
    message: {
      message_id: 105,
      from: { id: 3001, first_name: "Charlie" },
      chat: { id: 3001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/status ${record.verificationId}`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes(`Verification:\n${record.verificationId}`));
  assert.ok(res.reply?.includes("Status:\nVERIFIED"));
});

test("Telegram Bot: /evidence shows real Stellar Testnet evidence and explorer link", async () => {
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${DECEPTIVE_TX_HASH}` },
      telegramUserId: 4001,
      telegramChatId: 4001,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  const update: TelegramUpdate = {
    update_id: 6,
    message: {
      message_id: 106,
      from: { id: 4001, first_name: "Dana" },
      chat: { id: 4001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/evidence ${record.verificationId}`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("Network:\nStellar Testnet"));
  assert.ok(res.reply?.includes(DECEPTIVE_TX_HASH), "Must output real transaction hash");
  assert.ok(res.reply?.includes("Status:\nConfirmed"));
  assert.ok(res.reply?.includes(RECIPIENT_ADDRESS), "Must include recipient address");
  assert.ok(res.reply?.includes("Asset:\nUSDC"));
  assert.ok(res.reply?.includes("Amount:\n0.50"));

  const lastMsg = bot.sentMessages[bot.sentMessages.length - 1];
  const buttons = lastMsg.replyMarkup?.inline_keyboard.flat() || [];
  const explorerBtn = buttons.find((b) => b.text === "View on Stellar Explorer");
  assert.ok(explorerBtn, "Must have explorer button");
  assert.equal(explorerBtn?.url, `https://stellar.expert/explorer/testnet/tx/${DECEPTIVE_TX_HASH}`);
});

test("Telegram Bot: /correct initiates correction request", async () => {
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${DECEPTIVE_TX_HASH}` },
      telegramUserId: 5001,
      telegramChatId: 5001,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  const update: TelegramUpdate = {
    update_id: 7,
    message: {
      message_id: 107,
      from: { id: 5001, first_name: "Eve" },
      chat: { id: 5001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/correct ${record.verificationId} The worker must send the required 5 USDC.`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🔄 Correction requested"));
  assert.ok(res.reply?.includes("Issue:\nAmount mismatch"));
  assert.ok(res.reply?.includes("The worker can now resubmit"));
});

test("Telegram Bot: /resubmit verifies corrected work to VERIFIED", async () => {
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${DECEPTIVE_TX_HASH}` },
      telegramUserId: 6001,
      telegramChatId: 6001,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  // Resubmit with the correct transaction hash transferring 5.0 USDC
  const update: TelegramUpdate = {
    update_id: 8,
    message: {
      message_id: 108,
      from: { id: 6001, first_name: "Frank" },
      chat: { id: 6001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/resubmit ${record.verificationId} Sent 5 USDC via tx ${CORRECT_TX_HASH}`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("✅ VERIFIED"), "Corrected work must result in VERIFIED");
  assert.ok(res.reply?.includes("The corrected work passed independent verification"));
});

// =========================================================================
// PART 2: SECURITY & AUTHORIZATION TESTS
// =========================================================================

test("Security: Webhook secret token rejection (invalid header -> 403 Forbidden)", async () => {
  const secureBot = new VeraTelegramBot("fake-token", `http://localhost:${testPort}`, "my-ultra-secure-secret");
  const webhookHandler = secureBot.createWebhookHandler();

  let statusCode = 0;
  let responseData = "";

  const mockReq = {
    method: "POST",
    url: "/telegram/webhook",
    headers: {
      "x-telegram-bot-api-secret-token": "wrong-secret-token",
    },
    on: () => {},
  } as unknown as IncomingMessage;

  const mockRes = {
    writeHead: (status: number) => {
      statusCode = status;
    },
    end: (data: string) => {
      responseData = data;
    },
  } as unknown as ServerResponse;

  const handled = await webhookHandler(mockReq, mockRes);
  assert.equal(handled, true);
  assert.equal(statusCode, 403, "Must reject invalid secret with 403");
  assert.ok(responseData.includes("Invalid webhook secret token"));
});

test("Security: Unauthorized user cannot view verification of another user", async () => {
  // Create verification owned by User 7001
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: "Private task for 7001",
      worker: { output: "Worker result" },
      telegramUserId: 7001,
      telegramChatId: 7001,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  // User 8002 attempts to query status
  const res = await bot.handleUpdate({
    update_id: 9,
    message: {
      message_id: 109,
      from: { id: 8002, first_name: "Attacker" },
      chat: { id: 8002, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/status ${record.verificationId}`,
    },
  });

  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("Unauthorized"), "Must block unauthorized status lookup");
});

test("Security: Missing verification ID outputs user-friendly error", async () => {
  const res = await bot.handleUpdate({
    update_id: 10,
    message: {
      message_id: 110,
      from: { id: 9001 },
      chat: { id: 9001, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/status",
    },
  });

  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("Usage: /status <verification_id>"));
});

test("Security: Shared repository confirmation (Telegram verification exists on Web API)", async () => {
  const chatId = 9500;
  const userId = 9500;

  await bot.handleUpdate({
    update_id: 11,
    message: {
      message_id: 111,
      from: { id: userId, first_name: "Grace" },
      chat: { id: chatId, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/verify Send 5 USDC to ${RECIPIENT_ADDRESS} | Sent 5 USDC via tx ${CORRECT_TX_HASH}`,
    },
  });

  // Verify record exists in defaultRepository
  const list = await defaultRepository.list();
  const matched = list.find((r) => r.telegramUserId === userId);
  assert.ok(matched, "Verification created via Telegram must exist in the shared VeraOS repository");
  assert.equal(matched?.verdict.status, "VERIFIED");

  // Verify record is retrievable via GET /v1/verify/:id
  const getRes = await fetch(`http://localhost:${testPort}/v1/verify/${matched?.id}`);
  assert.equal(getRes.status, 200);
  const getJson = (await getRes.json()) as { id: string; verdict: { status: string } };
  assert.equal(getJson.verdict.status, "VERIFIED");
});

// =========================================================================
// PART 3: HEALTH ENDPOINT & POLLING LIFECYCLE TESTS
// =========================================================================

test("API: GET /health returns operational status and component info", async () => {
  const res = await fetch(`http://localhost:${testPort}/health`);
  assert.equal(res.status, 200);
  const data = (await res.json()) as {
    status: string;
    version: string;
    telegram: { configured: boolean; polling: boolean };
    stellar: { network: string; rpcUrl: string };
  };

  assert.equal(data.status, "ok");
  assert.equal(typeof data.version, "string");
  assert.equal(typeof data.telegram.configured, "boolean");
  assert.equal(typeof data.telegram.polling, "boolean");
  assert.equal(data.stellar.network, "testnet");
  assert.ok(data.stellar.rpcUrl.includes("stellar.org"));
});

test("Telegram Bot: /start returns exact VeraOS specification copy", async () => {
  const update: TelegramUpdate = {
    update_id: 12,
    message: {
      message_id: 112,
      from: { id: 1002, first_name: "Tester" },
      chat: { id: 1002, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/start",
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  const expectedText =
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

  assert.equal(res.reply, expectedText);
});

test("Telegram Bot Polling: Unconfigured bot gracefully handles getMe, webhook clear, and startPolling", async () => {
  const unconfiguredBot = new VeraTelegramBot("", `http://localhost:${testPort}`);
  assert.equal(unconfiguredBot.isConfigured(), false);
  assert.equal(unconfiguredBot.isPollingActive(), false);
  assert.equal(unconfiguredBot.getBotUsername(), null);

  const meRes = await unconfiguredBot.getMe();
  assert.equal(meRes.ok, false);
  assert.equal(meRes.error, "TELEGRAM_BOT_TOKEN is not configured.");

  const delWebhookRes = await unconfiguredBot.deleteWebhook();
  assert.equal(delWebhookRes, false);

  const startRes = await unconfiguredBot.startPolling();
  assert.equal(startRes, false);
  assert.equal(unconfiguredBot.isPollingActive(), false);

  // Stop polling should be a safe no-op
  unconfiguredBot.stopPolling();
  assert.equal(unconfiguredBot.isPollingActive(), false);
});

test("Telegram Bot Protocol: Group command sanitization handles @botname suffixes", async () => {
  const update: TelegramUpdate = {
    update_id: 13,
    message: {
      message_id: 113,
      from: { id: 1003, first_name: "GroupMember" },
      chat: { id: -1001234567, type: "supergroup" },
      date: Math.floor(Date.now() / 1000),
      text: "/start@VeraOSBot",
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🛡 VeraOS"), "Must recognize /start@VeraOSBot as /start");

  const helpUpdate: TelegramUpdate = {
    update_id: 14,
    message: {
      message_id: 114,
      from: { id: 1003, first_name: "GroupMember" },
      chat: { id: -1001234567, type: "supergroup" },
      date: Math.floor(Date.now() / 1000),
      text: "/help@VeraOSBot",
    },
  };

  const helpRes = await bot.handleUpdate(helpUpdate);
  assert.equal(helpRes.handled, true);
  assert.ok(helpRes.reply?.includes("🛡 VeraOS Commands"), "Must recognize /help@VeraOSBot as /help");
});

test("Telegram Bot Protocol: answerCallbackQuery and setWebhook methods execute safely", async () => {
  // Test offline/unconfigured behavior
  const unconfiguredBot = new VeraTelegramBot("", `http://localhost:${testPort}`);
  const ansResult = await unconfiguredBot.answerCallbackQuery("cb_query_123", "Acknowledged");
  assert.equal(ansResult, true, "Offline bot safely returns true for answerCallbackQuery");

  const setWebhookResult = await unconfiguredBot.setWebhook("https://example.com/webhook", "secret-token");
  assert.equal(setWebhookResult.ok, false);
  assert.ok(setWebhookResult.description?.includes("TELEGRAM_BOT_TOKEN is not configured"));
});

