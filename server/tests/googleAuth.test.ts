import test from "node:test";
import assert from "node:assert/strict";
import { VeraDatabase } from "../db/database.ts";
import { AuthService } from "../auth/authService.ts";

test("Google Auth & Access Control: Owner login gets admin status and owner role", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  const ownerResult = await auth.authenticateWithGoogle(
    {
      sub: "109876543210987654321",
      email: "owner@veraos.network",
      name: "David VeraOwner",
      picture: "https://lh3.googleusercontent.com/a/test_owner_avatar",
    },
    ["owner@veraos.network", "admin@veraos.network"]
  );

  assert.equal(ownerResult.isOwner, true);
  assert.equal(ownerResult.isInvited, true);
  assert.equal(ownerResult.user.role, "owner");
  assert.equal(ownerResult.user.invitation_status, "admin");
  assert.equal(ownerResult.user.google_id, "109876543210987654321");
  assert.equal(ownerResult.user.avatar, "https://lh3.googleusercontent.com/a/test_owner_avatar");
  assert.ok(ownerResult.token, "Session token should be generated");

  // Verify session token
  const verified = await auth.verifySessionToken(ownerResult.token);
  assert.ok(verified);
  assert.equal(verified?.email, "owner@veraos.network");
  assert.equal(verified?.role, "owner");
  assert.equal(verified?.invitationStatus, "admin");
});

test("Google Auth & Access Control: Whitelisted email gets invited clearance and operator role", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  // Pre-whitelist operator email
  await db.whitelistEmail(
    "alice.operator@enterprise.com",
    "operator",
    "admin_invite",
    "Whitelisted for testing"
  );

  const result = await auth.authenticateWithGoogle(
    {
      sub: "99887766554433221100",
      email: "alice.operator@enterprise.com",
      name: "Alice Operator",
      picture: "https://lh3.googleusercontent.com/a/alice_avatar",
    },
    ["owner@veraos.network"]
  );

  assert.equal(result.isOwner, false);
  assert.equal(result.isInvited, true);
  assert.equal(result.user.role, "operator");
  assert.equal(result.user.invitation_status, "invited");
  assert.equal(result.user.google_id, "99887766554433221100");
  assert.equal(result.user.avatar, "https://lh3.googleusercontent.com/a/alice_avatar");

  // Verify user can be retrieved from DB by Google ID
  const storedUser = await db.getUserByGoogleId("99887766554433221100");
  assert.ok(storedUser);
  assert.equal(storedUser?.email, "alice.operator@enterprise.com");
  assert.equal(storedUser?.invitation_status, "invited");
});

test("Google Auth & Access Control: Uninvited email receives pending status (gated)", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  const result = await auth.authenticateWithGoogle(
    {
      sub: "44556677889900112233",
      email: "stranger.uninvited@gmail.com",
      name: "Stranger Danger",
      picture: "https://lh3.googleusercontent.com/a/stranger_avatar",
    },
    ["owner@veraos.network"]
  );

  assert.equal(result.isOwner, false);
  assert.equal(result.isInvited, false);
  assert.equal(result.user.invitation_status, "pending");
  assert.equal(result.user.role, "user");

  // Verify audit log recorded
  const auditLogs = await db.getRecentAuditLogs(5);
  const loginLog = auditLogs.find((l) => l.action === "GOOGLE_LOGIN");
  assert.ok(loginLog);
  assert.ok(loginLog?.details.includes("stranger.uninvited@gmail.com"));
});

test("Google Auth & Access Control: Pending Google user can redeem invite code to unlock platform", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  // 1. Initial login as uninvited
  const loginRes = await auth.authenticateWithGoogle(
    {
      sub: "55667788990011223344",
      email: "new.recruit@stellar.org",
      name: "New Recruit",
    },
    ["owner@veraos.network"]
  );

  assert.equal(loginRes.user.invitation_status, "pending");
  assert.equal(loginRes.isInvited, false);

  // 2. Redeem pre-seeded VIP invite code VERA-VIP-2026
  const redeemRes = await auth.redeemInviteCodeForUser(
    "new.recruit@stellar.org",
    "VERA-VIP-2026"
  );

  assert.equal(redeemRes.success, true);
  assert.equal(redeemRes.user.invitation_status, "invited");
  assert.equal(redeemRes.user.role, "operator");

  // 3. Verify user's email is now in whitelisted emails registry
  const isWhitelisted = await db.isEmailWhitelisted("new.recruit@stellar.org");
  assert.equal(isWhitelisted.invited, true);
  assert.equal(isWhitelisted.role, "operator");

  // 4. Subsequent login recognizes upgraded invited status
  const secondLogin = await auth.authenticateWithGoogle(
    {
      sub: "55667788990011223344",
      email: "new.recruit@stellar.org",
    },
    ["owner@veraos.network"]
  );

  assert.equal(secondLogin.isInvited, true);
  assert.equal(secondLogin.user.invitation_status, "invited");
});

test("Google Auth & Access Control: Invalid invite codes are rejected", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  await auth.authenticateWithGoogle(
    {
      sub: "77889900112233445566",
      email: "attacker@random.com",
    },
    ["owner@veraos.network"]
  );

  await assert.rejects(
    () => auth.redeemInviteCodeForUser("attacker@random.com", "NOT-A-REAL-CODE"),
    /Invalid or expired invitation code/
  );
});

test("Google Auth & Access Control: Whitelist management", async () => {
  const db = new VeraDatabase();

  // Initially check non-existent email
  const beforeCheck = await db.isEmailWhitelisted("future.member@company.com");
  assert.equal(beforeCheck.invited, false);

  // Add to whitelist
  await db.whitelistEmail(
    "future.member@company.com",
    "operator",
    "admin_usr_01",
    "Added by owner"
  );

  // Check again
  const afterCheck = await db.isEmailWhitelisted("future.member@company.com");
  assert.equal(afterCheck.invited, true);
  assert.equal(afterCheck.role, "operator");

  // List all whitelisted emails
  const list = await db.listWhitelistedEmails();
  const found = list.find((e) => e.email === "future.member@company.com");
  assert.ok(found);
  assert.equal(found?.role, "operator");
  assert.equal(found?.notes, "Added by owner");
});

test("Google Auth & Access Control: 1-Click invite link generation and immediate access grant", async () => {
  const db = new VeraDatabase();
  const auth = new AuthService(db);

  // 1. Generate dynamic invite link code
  const generated = await db.generateInviteCode("test_operator", 1, "Testing 1-click invite link");
  assert.ok(generated.code.startsWith("VERA-INV-"), "Code should have VERA-INV- prefix");
  assert.equal(generated.max_uses, 1);
  assert.equal(generated.uses_count, 0);
  assert.equal(generated.is_active, true);

  // 2. Query code from database
  const retrieved = await db.getInviteCode(generated.code);
  assert.ok(retrieved);
  assert.equal(retrieved?.code, generated.code);

  // 3. Register uninvited Google user
  const uninvited = await auth.authenticateWithGoogle(
    {
      sub: "88991122334455667788",
      email: "invitee.friend@gmail.com",
      name: "Invited Friend",
    },
    ["owner@veraos.network"]
  );
  assert.equal(uninvited.isInvited, false);
  assert.equal(uninvited.user.invitation_status, "pending");

  // 4. Friend clicks invite link and redeems code
  const redeemRes = await auth.redeemInviteCodeForUser(
    "invitee.friend@gmail.com",
    generated.code
  );
  assert.equal(redeemRes.success, true);
  assert.equal(redeemRes.user.invitation_status, "invited");
  assert.equal(redeemRes.user.role, "operator");

  // 5. Code usage count incremented, cannot be reused if max_uses reached
  const updatedCode = await db.getInviteCode(generated.code);
  assert.equal(updatedCode?.uses_count, 1);
});

