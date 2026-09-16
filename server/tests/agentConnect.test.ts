import test from "node:test";
import assert from "node:assert/strict";
import { agentsApi } from "../../src/services/agentsApi";

test("AgentConnect Suite 1: Agent connection with explicit user consent", async () => {
  const agent = await agentsApi.connectWithConsent({
    name: "StellarEliza-Autonomous",
    runtime: "ElizaOS Stellar Runtime v1.2",
    model: "gpt-4o",
    permissions: [
      "read_tasks",
      "stellar_attestation",
      "remediation_dispatch",
    ],
    guardrailMode: "strict",
    stellarAccount: "GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L",
  });

  assert.equal(agent.status, "CONNECTED", "Agent status should be CONNECTED");
  assert.equal(agent.consentGiven, true, "User consent flag must be explicitly true");
  assert.equal(agent.guardrailMode, "strict", "Guardrail policy must be preserved");
  assert.ok(agent.permissions?.includes("read_tasks"), "Must contain read_tasks permission");
  assert.ok(agent.permissions?.includes("stellar_attestation"), "Must contain stellar_attestation permission");
  assert.ok(agent.permissions?.includes("remediation_dispatch"), "Must contain remediation_dispatch permission");
  assert.ok(agent.apiKeySnippet.startsWith("vera_live_"), "Must generate scoped API key snippet");
  assert.equal(agent.attestationSchema, "Stellar Horizon Testnet Receipt");
});

test("AgentConnect Suite 2: Reconnection preserves history and updates state", async () => {
  // Existing mock agent in registry
  const reconnected = await agentsApi.connectWithConsent({
    id: "scout-agent",
    name: "ScoutAgent",
    runtime: "Autonomous Python Async Loop",
    permissions: ["read_tasks", "stellar_attestation"],
    guardrailMode: "standard",
  });

  assert.equal(reconnected.id, "scout-agent");
  assert.equal(reconnected.status, "CONNECTED");
  assert.equal(reconnected.consentGiven, true);
  assert.equal(reconnected.guardrailMode, "standard");
  // Total verifications should be preserved from initial mock (12)
  assert.equal(reconnected.totalVerifications, 12);
  assert.equal(reconnected.passRate, 66.7);
});

test("AgentConnect Suite 3: Testnet handshake verification ping", async () => {
  const ping = await agentsApi.testPing("stellareliza-autonomous");

  assert.equal(ping.success, true, "Ping must succeed");
  assert.ok(ping.latencyMs > 0, "Latency must be a positive number");
  assert.ok(ping.latencyMs < 1000, "Latency should be sub-second");
  assert.ok(ping.network.includes("Stellar Testnet"), "Network must report Stellar Testnet");
  assert.equal(
    ping.txHash,
    "62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf",
    "Must reference verified Stellar transaction receipt"
  );
  assert.ok(ping.message.includes("Cryptographic attestation active"));
});

test("AgentConnect Suite 4: Disconnection revokes active session", async () => {
  const disconnected = await agentsApi.disconnect("stellareliza-autonomous");

  assert.ok(disconnected, "Disconnected agent must be returned");
  assert.equal(disconnected.status, "NOT_CONNECTED", "Status must become NOT_CONNECTED");
  assert.equal(disconnected.consentGiven, false, "Consent flag must be cleared");
  assert.equal(disconnected.lastActive, "Disconnected");

  // Verify get returns the updated disconnected record
  const fetched = await agentsApi.get("stellareliza-autonomous");
  assert.equal(fetched?.status, "NOT_CONNECTED");
});
