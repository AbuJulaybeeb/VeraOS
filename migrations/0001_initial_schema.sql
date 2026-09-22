-- VeraOS Enterprise Database Schema (Cloudflare D1 / SQLite)
-- Migration: 0001_initial_schema.sql

-- 1. Invited Users Table (Access Control Whitelist)
CREATE TABLE IF NOT EXISTS invited_users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'PENDING', 'ACTIVE', 'REVOKED'
  invite_code TEXT,
  invited_by TEXT,
  stellar_wallet TEXT,
  created_at TEXT NOT NULL,
  last_active_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invited_users_telegram_id ON invited_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_invited_users_status ON invited_users(status);

-- 2. Invite Codes Table (Redeemable Enterprise Access Codes)
CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL DEFAULT 'system',
  is_active INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Seed Initial VIP / Founder Invite Codes
INSERT OR IGNORE INTO invite_codes (code, max_uses, uses_count, created_by, is_active, notes, created_at)
VALUES 
  ('VERA-OFFICIAL', 0, 0, 'system', 1, 'Permanent Official Website Invite Link', datetime('now')),
  ('VERA-VIP-2026', 100, 0, 'admin', 1, 'VIP Enterprise Founder Access', datetime('now')),
  ('STELLAR-AUDITOR-01', 50, 0, 'admin', 1, 'Stellar Ecosystem Protocol Auditor', datetime('now')),
  ('FOUNDER-ALPHA', 10, 0, 'admin', 1, 'Core Founding Team Access', datetime('now'));

-- 3. Verification Records Table (Deterministic Proof & Invariants)
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  display_id TEXT UNIQUE NOT NULL,
  task_prompt TEXT NOT NULL,
  worker_id TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  worker_output TEXT NOT NULL,
  status TEXT NOT NULL, -- 'PASSED', 'FAILED', 'UNVERIFIED'
  stellar_tx_hash TEXT,
  network TEXT NOT NULL DEFAULT 'Stellar Testnet',
  verdict_json TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  created_by_telegram_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_display_id ON verifications(display_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at);

-- 4. Audit Logs Table (Enterprise Security & Telemetry Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 5. User Accounts & Authentication Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'AI Verification Engineer',
  avatar TEXT,
  stellar_wallet TEXT,
  api_key TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'password', -- 'password', 'stellar', 'google'
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stellar_wallet ON users(stellar_wallet);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);

-- 6. Autonomous Agents Table (Real-time Agent Connections)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0',
  runtime TEXT NOT NULL DEFAULT 'ElizaOS Stellar Runtime v1.2',
  model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONNECTED', -- 'CONNECTED', 'NOT_CONNECTED', 'VERIFIED', 'ERROR'
  api_key TEXT,
  stellar_account TEXT,
  capabilities TEXT NOT NULL DEFAULT '[]',
  permissions TEXT NOT NULL DEFAULT '[]',
  guardrail_mode TEXT NOT NULL DEFAULT 'standard',
  handshake_latency_ms INTEGER DEFAULT 0,
  handshake_tx_hash TEXT,
  last_active TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Seed Initial Connected Agents
INSERT OR IGNORE INTO agents (id, user_id, name, version, runtime, model, endpoint, status, api_key, stellar_account, capabilities, permissions, guardrail_mode, handshake_latency_ms, handshake_tx_hash, last_active, created_at)
VALUES
  ('eliza-stellar-01', 'system', 'ElizaOS Stellar Agent', 'v1.2', 'ElizaOS Stellar Runtime v1.2', 'gemini-2.0-flash', 'agent://stellar-eliza-runtime', 'VERIFIED', 'vera_live_eliza_98a1b', 'GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L', '["task_execution","stellar_payment","remediation_loop"]', '["read_tasks","stellar_attestation","remediation_dispatch"]', 'strict', 18, '62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf', 'Just now', datetime('now')),
  ('langchain-prime', 'system', 'LangChain Agentic Worker', 'v0.3', 'LangChain Agentic Runtime v0.3', 'gpt-4o', 'https://agent.acme.ai/langchain/rpc', 'CONNECTED', 'vera_live_langchain_44c2d', 'GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L', '["multi_actor_graph","stateful_tool_loop"]', '["read_tasks","stellar_attestation"]', 'standard', 24, '62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf', 'Just now', datetime('now')),
  ('crewai-swarm', 'system', 'CrewAI Multi-Worker Swarm', 'v2.0', 'CrewAI Multi-Worker Swarm v2.0', 'claude-3.5-sonnet', 'https://agent.acme.ai/crew/rpc', 'CONNECTED', 'vera_live_crewai_77f1a', 'GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L', '["swarm_handoff","hierarchical_dispatch"]', '["read_tasks","remediation_dispatch"]', 'standard', 31, '62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf', 'Just now', datetime('now'));

