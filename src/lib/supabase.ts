import { createClient } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  stellar_wallet: string | null;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAgent {
  id: string;
  user_id: string;
  name: string;
  type: string;
  connection_type: "api" | "webhook" | "telegram";
  connection_status: "CONNECTED" | "NOT_CONNECTED" | "IDLE";
  telegram_identifier: string | null;
  endpoint: string;
  runtime: string;
  model: string;
  capabilities: string[];
  permissions: string[];
  guardrail_mode: "standard" | "strict";
  stellar_account: string | null;
  total_verifications: number;
  pass_rate: number;
  created_at: string;
  updated_at: string;
}

export interface DbVerificationRun {
  id: string;
  user_id: string;
  agent_id: string | null;
  task: string;
  output: string;
  status: "pending" | "processing" | "failed" | "passed" | "correction_required" | "resubmitted" | "rechecking";
  parent_run_id: string | null;
  attempt_number: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbRequirement {
  id: string;
  run_id: string;
  description: string;
  status: "SATISFIED" | "VIOLATED" | "PENDING";
  category?: string;
  created_at: string;
}

export interface DbClaim {
  id: string;
  run_id: string;
  requirement_id: string | null;
  claim: string;
  status: "VERIFIED" | "REFUTED" | "UNVERIFIED";
  reported_value?: string;
  actual_value?: string;
  created_at: string;
}

export interface DbEvidence {
  id: string;
  run_id: string;
  claim_id: string | null;
  source: string;
  source_url?: string;
  relevant_content: string;
  verification_status: "CONFIRMED" | "CONFLICT" | "PENDING";
  tx_hash?: string;
  ledger_sequence?: number;
  created_at: string;
}

export interface DbVerdict {
  id: string;
  run_id: string;
  status: "PASS" | "FAIL" | "UNVERIFIABLE";
  summary: string;
  requirements_satisfied: number;
  requirements_total: number;
  claims_verified: number;
  claims_total: number;
  evidence_count: number;
  attestation_hash?: string;
  created_at: string;
}

export interface DbCorrection {
  id: string;
  run_id: string;
  issues: any[];
  instructions: string;
  status: "pending" | "resolved" | "resubmitted";
  created_at: string;
  updated_at: string;
}

// Safely retrieve environment variables across Vite and SSR/test runtimes
const env = typeof import.meta !== "undefined" ? (import.meta as any).env : {};
const proc = typeof globalThis !== "undefined" && (globalThis as any).process ? (globalThis as any).process.env : {};

const supabaseUrl = (env?.VITE_SUPABASE_URL || proc?.VITE_SUPABASE_URL || "") as string;
const supabaseAnonKey = (env?.VITE_SUPABASE_ANON_KEY || proc?.VITE_SUPABASE_ANON_KEY || "") as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[VeraOS Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Add them to .env or Vercel Environment Variables to enable production Supabase persistence and Google Auth."
  );
}

// Safe URL configuration to prevent createClient throwing during SSR / build
const effectiveUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const effectiveKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
