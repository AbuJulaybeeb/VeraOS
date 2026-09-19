import test from "node:test";
import assert from "node:assert/strict";
import { VeraDatabase } from "../db/database.ts";
import { InviteService } from "../auth/inviteService.ts";
import { GeminiClient } from "../ai/geminiClient.ts";
import { stellarWalletService } from "../stellar/walletService.ts";

test("VeraDatabase (Fallback Mode): In-memory seed codes and user lifecycle", async () => {
  const db = new VeraDatabase(); // In-memory mode

  // 1. Verify pre-seeded invite codes
  const vipCode = await db.getInviteCode("VERA-VIP-2026");
  assert.ok(vipCode, "VERA-VIP-2026 should be pre-seeded");
  assert.equal(vipCode?.code, "VERA-VIP-2026");
  assert.equal(vipCode?.is_active, true);
  assert.equal(vipCode?.uses_count, 0);

  // 2. Add and retrieve invited user
  await db.upsertInvitedUser({
    id: "usr_test_01",
    telegram_id: "998877",
    username: "crypto_operator",
    first_name: "Satoshi",
    status: "ACTIVE",
    invite_code: "VERA-VIP-2026",
    stellar_wallet: "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  });

  const user = await db.getInvitedUserByTelegramId("998877");
  assert.ok(user);
  assert.equal(user?.username, "crypto_operator");
  assert.equal(user?.status, "ACTIVE");
  assert.equal(user?.stellar_wallet, "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L");

  // 3. Test verification storage
  await db.saveVerification({
    id: "v_ent_001",
    display_id: "V-2001",
    task_prompt: "Send 10 XLM to test account",
    worker_id: "agent_alpha",
    worker_name: "AlphaExecutor",
    worker_output: "Sent 10 XLM tx 62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
    status: "PASSED",
    stellar_tx_hash: "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
    network: "stellar:testnet",
    verdict_json: JSON.stringify({ passed: true, score: 100 }),
    evidence_json: JSON.stringify({ corroborated: true }),
    created_by_telegram_id: "998877",
    created_at: new Date().toISOString(),
  });

  const verification = await db.getVerification("v_ent_001");
  assert.ok(verification);
  assert.equal(verification?.display_id, "V-2001");
  assert.equal(verification?.status, "PASSED");

  // By display ID
  const verificationByDisplay = await db.getVerificationByDisplayId("V-2001");
  assert.ok(verificationByDisplay);
  assert.equal(verificationByDisplay?.id, "v_ent_001");

  // 4. Audit Log
  await db.logAudit({
    user_id: "usr_test_01",
    action: "VERIFICATION_CREATED",
    details: "Verification V-2001 created via test suite",
  });
  const logs = await db.getRecentAuditLogs(5);
  assert.ok(logs.length > 0);
  assert.equal(logs[0].action, "VERIFICATION_CREATED");
});

test("InviteService: Gatekeeping, code validation, and redemption", async () => {
  const db = new VeraDatabase();
  const service = new InviteService(db);

  // 1. Access denied for uninvited user
  const accessBefore = await service.checkAccess("112233");
  assert.equal(accessBefore.allowed, false);
  assert.equal(accessBefore.user, null);

  // 2. Validate invalid code
  const invalidRes = await service.validateCode("INVALID-RANDOM-CODE");
  assert.equal(invalidRes.valid, false);

  // 3. Validate valid pre-seeded code
  const validRes = await service.validateCode("VERA-VIP-2026");
  assert.equal(validRes.valid, true);

  // 4. Redeem code for user
  const redeemRes = await service.redeemCode("112233", "VERA-VIP-2026", {
    username: "vip_tester",
    first_name: "VIP",
  });
  assert.equal(redeemRes.success, true);
  assert.ok(redeemRes.user);
  assert.equal(redeemRes.user?.status, "ACTIVE");

  // 5. Access is now granted
  const accessAfter = await service.checkAccess("112233");
  assert.equal(accessAfter.allowed, true);
  assert.equal(accessAfter.user?.username, "vip_tester");

  // 6. Access denied message includes brand instructions
  const deniedMsg = service.getAccessDeniedMessage("Stranger");
  assert.ok(deniedMsg.includes("Private Beta"), "Should mention Private Beta");
  assert.ok(deniedMsg.includes("/start invite_"), "Should mention invite redemption format");
});

test("GeminiClient: Semantic parsing and natural language intent classification", async () => {
  const client = new GeminiClient(); // Fallback semantic mode (no API key required)

  // 1. Verify intent classification
  const verifyQuery = await client.parseQuery("Verify that I sent 5 USDC to GCEYAU... Payment complete tx 62256096f306");
  assert.equal(verifyQuery.intent, "VERIFY");
  assert.ok(verifyQuery.taskPrompt);
  assert.ok(verifyQuery.workerOutput);

  // 2. Status intent classification
  const statusQuery = await client.parseQuery("What is the current status of verification V-1048?");
  assert.equal(statusQuery.intent, "STATUS");
  assert.equal(statusQuery.verificationId, "V-1048");

  // 3. Evidence intent classification
  const evidenceQuery = await client.parseQuery("Show cryptographic proof and evidence for V-1048");
  assert.equal(evidenceQuery.intent, "EVIDENCE");
  assert.equal(evidenceQuery.verificationId, "V-1048");

  // 4. Wallet connect intent classification
  const walletQuery = await client.parseQuery("Connect wallet GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L");
  assert.equal(walletQuery.intent, "CONNECT_WALLET");
  assert.equal(walletQuery.walletAddress, "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L");

  // 5. Help intent classification
  const helpQuery = await client.parseQuery("Help me, what commands can I use?");
  assert.equal(helpQuery.intent, "HELP");

  // 6. Conversational explanation
  const explanation = await client.explainVerification({
    id: "V-1048",
    status: "PASSED",
    task: "Send 5 USDC",
    output: "tx 62256096...",
    details: "Corroborated by Stellar Testnet ledger",
  });
  assert.ok(explanation.includes("PASSED"));
  assert.ok(explanation.includes("V-1048"));
});

test("StellarWalletService: Public key validation and address formatting", async () => {
  const validKey = "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L";
  const invalidKey = "invalid_stellar_address_12345";
  const secretKey = "SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U64MMHYWCHJWBW";

  assert.equal(stellarWalletService.validateAddress(validKey), true);
  assert.equal(stellarWalletService.validateAddress(invalidKey), false);
  assert.equal(stellarWalletService.validateAddress(secretKey), false);

  const formatted = stellarWalletService.formatAddress(validKey);
  assert.equal(formatted, "GCEYAU...5L2L");

  // Check supported wallets definition
  const wallets = stellarWalletService.getSupportedWallets();
  assert.equal(wallets.length, 3);
  assert.ok(wallets.some((w) => w.id === "freighter"));
  assert.ok(wallets.some((w) => w.id === "albedo"));
  assert.ok(wallets.some((w) => w.id === "lobstr"));
});
