-- VeraOS Google OAuth & Access Control Migration
-- Migration: 0002_google_auth_and_access_control.sql

-- 1. Whitelisted Emails Table (Enterprise Invitation Registry)
CREATE TABLE IF NOT EXISTS invited_emails (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'operator', -- 'owner', 'operator', 'auditor'
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED'
  notes TEXT,
  invited_by TEXT DEFAULT 'system',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invited_emails_status ON invited_emails(status);

-- Seed Initial Owner / Founding Team Emails
INSERT OR IGNORE INTO invited_emails (email, role, status, notes, invited_by, created_at)
VALUES
  ('owner@veraos.network', 'owner', 'ACTIVE', 'Primary System Owner', 'genesis', datetime('now')),
  ('admin@veraos.network', 'owner', 'ACTIVE', 'Security Operations Admin', 'genesis', datetime('now')),
  ('auditor@stellar.org', 'operator', 'ACTIVE', 'Stellar Ecosystem Protocol Auditor', 'genesis', datetime('now'));

-- Note: SQLite does not support ADD COLUMN IF NOT EXISTS in all versions, 
-- but users table additions are handled gracefully in migration runner / database layer.
