import test from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { AiService } from "../ai/aiService.ts";
import { handleApiRequest } from "../api/routes.ts";
import { VeraTelegramBot, type TelegramUpdate } from "../telegram/bot.ts";
import type { VerificationRecord } from "../types/domain.ts";
import { defaultVeraDb } from "../db/database.ts";

const RECIPIENT_ADDRESS = "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L";
const DECEPTIVE_TX_HASH = "108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759";
const CORRECT_TX_HASH = "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf";

let server: Server;
let testPort: number;
let bot: VeraTelegramBot;

test.before(async () => {
  testPort = 3105;
  server = createServer(async (req, res) => {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(testPort, () => resolve()));
  bot = new VeraTelegramBot("", `http://localhost:${testPort}`);

  // Authorize test users for AI suite
  for (const uid of [9901, 9902, 9903]) {
    await defaultVeraDb.upsertInvitedUser({
      id: `usr_test_${uid}`,
      telegram_id: String(uid),
      first_name: `TestUser_${uid}`,
      status: "ACTIVE",
      invite_code: "VERA-OFFICIAL",
      created_at: new Date().toISOString(),
    });
  }
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// =========================================================================
// AI SERVICE UNIT TESTS
// =========================================================================

test("AiService: unconfigured instance defaults to deterministic mode", () => {
  const ai = new AiService();
  // In test environment without keys set, provider is deterministic
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    assert.equal(ai.getActiveProvider(), "deterministic");
    assert.equal(ai.isConfigured(), false);
  }
});

test("AiService: parseVerificationPrompt extracts pipe-delimited task and output", async () => {
  const ai = new AiService();
  const res = await ai.parseVerificationPrompt("Send 5 USDC to Alice | Sent 5 USDC via tx 12345");
  assert.equal(res.isVerification, true);
  assert.equal(res.task, "Send 5 USDC to Alice");
  assert.equal(res.workerOutput, "Sent 5 USDC via tx 12345");
});

test("AiService: parseVerificationPrompt detects payment and tx hash heuristics", async () => {
  const ai = new AiService();
  const res = await ai.parseVerificationPrompt(
    `I transferred 5 USDC to ${RECIPIENT_ADDRESS} with txhash: ${DECEPTIVE_TX_HASH}`
  );
  assert.equal(res.isVerification, true);
  assert.ok(res.workerOutput?.includes(DECEPTIVE_TX_HASH));
});

test("AiService: parseVerificationPrompt rejects casual conversational chatter", async () => {
  const ai = new AiService();
  const res = await ai.parseVerificationPrompt("Hello bot, how is the weather today?");
  assert.equal(res.isVerification, false);
});

test("AiService: explainVerdict produces accurate deterministic explanation for VERIFIED", async () => {
  const ai = new AiService();
  const mockRecord: VerificationRecord = {
    id: "ver_test_verified",
    displayId: "VER-1001",
    task: "Send 5 USDC",
    worker: { output: "Sent 5 USDC" },
    requirements: [
      { id: "r1", description: "Transfer 5 USDC", type: "transaction", status: "passed" },
    ],
    claims: [],
    evidence: [],
    checks: [
      {
        id: "c1",
        requirementId: "r1",
        method: "blockchain",
        status: "passed",
        expected: "5 USDC",
        observed: "5 USDC",
        evidenceIds: [],
        explanation: "Ledger corroborated 5 USDC transfer",
      },
    ],
    verdict: {
      status: "VERIFIED",
      passed: 1,
      failed: 0,
      unverifiable: 0,
      total: 1,
      summary: "All checks passed",
      failureReasons: [],
    },
    attempt: 1,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
  };

  const explanation = await ai.explainVerdict(mockRecord);
  assert.ok(explanation.includes("VERIFIED"));
  assert.ok(explanation.includes("VER-1001"));
  assert.ok(explanation.includes("Stellar"));
});

test("AiService: explainVerdict produces breakdown and directives for FAILED", async () => {
  const ai = new AiService();
  const mockRecord: VerificationRecord = {
    id: "ver_test_failed",
    displayId: "VER-1002",
    task: "Send 5 USDC",
    worker: { output: "Sent 0.5 USDC" },
    requirements: [
      { id: "r1", description: "Transfer 5 USDC", type: "transaction", status: "failed" },
    ],
    claims: [],
    evidence: [],
    checks: [
      {
        id: "c1",
        requirementId: "r1",
        method: "blockchain",
        status: "failed",
        expected: "5 USDC",
        observed: "0.5 USDC",
        evidenceIds: [],
        explanation: "Expected: 5 USDC. Observed: 0.5 USDC. Difference: -4.5 USDC",
      },
    ],
    verdict: {
      status: "FAILED",
      passed: 0,
      failed: 1,
      unverifiable: 0,
      total: 1,
      summary: "Amount mismatch",
      failureReasons: ["Amount deficit"],
    },
    remediation: {
      status: "FAIL",
      retryable: true,
      attempt: 1,
      maxAttempts: 3,
      directives: [
        {
          requirementId: "r1",
          type: "CORRECT_TRANSACTION",
          reason: "Transfer remaining 4.5 USDC",
        },
      ],
    },
    attempt: 1,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
  };

  const explanation = await ai.explainVerdict(mockRecord);
  assert.ok(explanation.includes("FAILED"));
  assert.ok(explanation.includes("VER-1002"));
  assert.ok(explanation.includes("Transfer remaining 4.5 USDC"));
});

// =========================================================================
// TELEGRAM BOT AI INTEGRATION TESTS
// =========================================================================

test("Telegram Bot AI: /explain returns structured analysis for verification", async () => {
  // Create a failed verification
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${DECEPTIVE_TX_HASH}` },
      telegramUserId: 9901,
      telegramChatId: 9901,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  const update: TelegramUpdate = {
    update_id: 201,
    message: {
      message_id: 501,
      from: { id: 9901, first_name: "Alice" },
      chat: { id: 9901, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `/explain ${record.verificationId}`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🤖 VeraOS AI Analysis"));
  assert.ok(res.reply?.includes(record.verificationId));
});

test("Telegram Bot AI: Natural language prompt triggers autonomous verification", async () => {
  const update: TelegramUpdate = {
    update_id: 202,
    message: {
      message_id: 502,
      from: { id: 9902, first_name: "Bob" },
      chat: { id: 9902, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: `Send 5 USDC to ${RECIPIENT_ADDRESS} | Sent 5 USDC via tx ${CORRECT_TX_HASH}`,
    },
  };

  const res = await bot.handleUpdate(update);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("✅ VERIFIED"));
});

test("Telegram Bot AI: explain_verdict callback query triggers analysis", async () => {
  // Create a record
  const apiRes = await fetch(`http://localhost:${testPort}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: `Send 5 USDC to ${RECIPIENT_ADDRESS}`,
      worker: { output: `Sent 5 USDC via tx ${CORRECT_TX_HASH}` },
      telegramUserId: 9903,
      telegramChatId: 9903,
    }),
  });
  const record = (await apiRes.json()) as { verificationId: string };

  const callbackUpdate: TelegramUpdate = {
    update_id: 203,
    callback_query: {
      id: "cb_explain_999",
      from: { id: 9903, first_name: "Charlie" },
      message: {
        message_id: 503,
        chat: { id: 9903, type: "private" },
        date: Math.floor(Date.now() / 1000),
      },
      data: `explain_verdict:${record.verificationId}`,
    },
  };

  const res = await bot.handleUpdate(callbackUpdate);
  assert.equal(res.handled, true);
  assert.ok(res.reply?.includes("🤖 VeraOS AI Analysis"));
});
