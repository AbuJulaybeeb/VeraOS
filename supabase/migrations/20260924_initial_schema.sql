-- ==============================================================================
-- VeraOS Production Database Schema & Row Level Security (RLS)
-- Migration: 20260924_initial_schema.sql
-- Supports: Real Google Auth, Isolated Multi-Tenant Agents, Verification Runs,
--           Requirements, Claims, Evidence, Verdicts, and Correction Loops.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- Stores application metadata associated with Supabase auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'operator',
  stellar_wallet TEXT,
  api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. AGENTS TABLE
-- AI agents connected by authenticated operators
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'autonomous_worker',
  connection_type TEXT NOT NULL DEFAULT 'api', -- 'api' | 'webhook' | 'telegram'
  connection_status TEXT NOT NULL DEFAULT 'CONNECTED', -- 'CONNECTED' | 'NOT_CONNECTED' | 'IDLE'
  telegram_identifier TEXT,
  endpoint TEXT DEFAULT 'agent://stellar-runtime',
  runtime TEXT DEFAULT 'ElizaOS Stellar Agent',
  model TEXT DEFAULT 'gemini-2.0-flash',
  capabilities JSONB DEFAULT '["task_execution", "stellar_payment"]'::jsonb,
  permissions JSONB DEFAULT '["read_tasks", "stellar_attestation"]'::jsonb,
  guardrail_mode TEXT DEFAULT 'standard',
  stellar_account TEXT,
  total_verifications INTEGER DEFAULT 0,
  pass_rate NUMERIC DEFAULT 100.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(connection_status);

-- ------------------------------------------------------------------------------
-- 3. VERIFICATION RUNS TABLE
-- Real verified runs evaluating agent task outputs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_runs (
  id TEXT PRIMARY KEY, -- e.g. 'VR-2048', 'VR-2048-R2'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES public.agents(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  output TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'failed' | 'passed' | 'correction_required' | 'resubmitted' | 'rechecking'
  parent_run_id TEXT REFERENCES public.verification_runs(id) ON DELETE SET NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_runs_user_id ON public.verification_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_runs_agent_id ON public.verification_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_verification_runs_status ON public.verification_runs(status);
CREATE INDEX IF NOT EXISTS idx_verification_runs_created_at ON public.verification_runs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. REQUIREMENTS TABLE
-- Invariants and criteria extracted from the verification task
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.requirements (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'SATISFIED' | 'VIOLATED' | 'PENDING'
  category TEXT DEFAULT 'invariant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requirements_run_id ON public.requirements(run_id);

-- ------------------------------------------------------------------------------
-- 5. CLAIMS TABLE
-- Atomic claims extracted from the agent output
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  requirement_id TEXT REFERENCES public.requirements(id) ON DELETE SET NULL,
  claim TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- 'VERIFIED' | 'REFUTED' | 'UNVERIFIED'
  reported_value TEXT,
  actual_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_run_id ON public.claims(run_id);
CREATE INDEX IF NOT EXISTS idx_claims_requirement_id ON public.claims(requirement_id);

-- ------------------------------------------------------------------------------
-- 6. EVIDENCE TABLE
-- Independent proof, onchain RPC queries, and receipts corroborating claims
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  claim_id TEXT REFERENCES public.claims(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  relevant_content TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED' | 'CONFLICT' | 'PENDING'
  tx_hash TEXT,
  ledger_sequence INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_run_id ON public.evidence(run_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claim_id ON public.evidence(claim_id);

-- ------------------------------------------------------------------------------
-- 7. VERDICTS TABLE
-- Final evaluated attestation for each verification run
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verdicts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL, -- 'PASS' | 'FAIL' | 'UNVERIFIABLE'
  summary TEXT NOT NULL,
  requirements_satisfied INTEGER NOT NULL DEFAULT 0,
  requirements_total INTEGER NOT NULL DEFAULT 0,
  claims_verified INTEGER NOT NULL DEFAULT 0,
  claims_total INTEGER NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  attestation_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verdicts_run_id ON public.verdicts(run_id);

-- ------------------------------------------------------------------------------
-- 8. CORRECTIONS TABLE
-- Remediations and directives generated when verification fails
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.corrections (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'resolved' | 'resubmitted'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_corrections_run_id ON public.corrections(run_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation: User A can NEVER view or modify User B's data
-- ==============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY Users can view their own profile
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY Users can insert their own profile
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY Users can update their own profile
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Agents Policies
CREATE POLICY Users can view their own agents
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY Users can insert their own agents
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can update their own agents
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY Users can delete their own agents
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- Verification Runs Policies
CREATE POLICY Users can view their own verification runs
  ON public.verification_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY Users can create their own verification runs
  ON public.verification_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can update their own verification runs
  ON public.verification_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY Users can delete their own verification runs
  ON public.verification_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Requirements Policies
CREATE POLICY Users can view requirements for their runs
  ON public.requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.requirements.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can insert requirements for their runs
  ON public.requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.requirements.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can update requirements for their runs
  ON public.requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.requirements.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

-- Claims Policies
CREATE POLICY Users can view claims for their runs
  ON public.claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.claims.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can insert claims for their runs
  ON public.claims FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.claims.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

-- Evidence Policies
CREATE POLICY Users can view evidence for their runs
  ON public.evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.evidence.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can insert evidence for their runs
  ON public.evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.evidence.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

-- Verdicts Policies
CREATE POLICY Users can view verdicts for their runs
  ON public.verdicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.verdicts.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can insert verdicts for their runs
  ON public.verdicts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.verdicts.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

-- Corrections Policies
CREATE POLICY Users can view corrections for their runs
  ON public.corrections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.corrections.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can insert corrections for their runs
  ON public.corrections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.corrections.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

CREATE POLICY Users can update corrections for their runs
  ON public.corrections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.verification_runs
      WHERE public.verification_runs.id = public.corrections.run_id
      AND public.verification_runs.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $func$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, api_key)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    'operator',
    'vera_live_' || encode(gen_random_bytes(12), 'hex')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
