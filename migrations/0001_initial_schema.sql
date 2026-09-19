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
