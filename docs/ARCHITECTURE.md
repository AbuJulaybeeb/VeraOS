# VeraOS System Architecture

VeraOS is the independent verification layer for AI agents. Its purpose is to eliminate hallucinated, deceptive, or non-conforming agent task completions by enforcing deterministic, evidence-grounded verification before trusting or settling work.

---

## High-Level Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        User & Operator Ingress                         │
│  - Web Dashboard (React 19)                                            │
│  - Telegram Bot (@VeraOSBot via long-polling or webhook)               │
│  - REST API Client / Agent Orchestrator (POST /v1/verify)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      VeraOS Verification Pipeline                      │
│                                                                        │
│   1. Requirement Extractor                                             │
│      Task Prompt ──► [ Invariant Rules & Expected Bounds ]             │
│                                                                        │
│   2. Worker Claim Extractor                                            │
│      Worker Output ──► [ Extracted Claims & Assertions ]               │
│                                                                        │
│   3. Deterministic Check Engine                                        │
│      Triangulates claims against independent evidence providers:       │
│      ├── Stellar RPC Provider (Live Testnet Ledger & Horizon)          │
│      ├── Deterministic Kernel (Cardinality, bounds, structure)         │
│      └── Worker Output Provider (Baseline trace audit)                 │
│                                                                        │
│   4. Mathematical Verdict Synthesizer                                  │
│      Checks Map ──► VERIFIED | FAILED | PARTIAL | UNVERIFIABLE         │
│                                                                        │
│   5. Remediation Directive Engine                                      │
│      Failures ──► Structured Correction Directives (Amount, Target)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Persistence & Audit                          │
│  - Verification Repository (Attempts, Checks, Evidence, Directives)    │
│  - Public Explorer Proofs (Stellar.Expert Testnet Links)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Core Verification Pipeline Stages

### 1. Requirement Extraction (`requirementExtractor.ts`)
Parses the user's task prompt into discrete, testable invariants:
- **Transaction Invariants**: Expected asset code (e.g. `USDC`), target amount, and recipient public key (`G...`).
- **Cardinality Invariants**: Exact count of items (e.g. "Find 3 protocols").
- **Ecosystem Invariants**: Target blockchain network (e.g. "Stellar").
- **Category & Threshold Invariants**: Specific protocol taxonomy and numeric thresholds.

### 2. Claim Extraction (`claimExtractor.ts`)
Extracts assertions made by the AI worker from its unstructured text output:
- Stated transaction hashes (regex pattern matching 64-character hex strings).
- Asserted financial transfer amounts.
- Stated entities, protocol names, and outcomes.
- **Critical Rule**: A worker claim is **never** accepted as ground truth. It merely formulates the hypothesis to be tested against independent evidence.

### 3. Check Engine & Evidence Triangulation (`checkEngine.ts`)
Executes deterministic checks matching each requirement invariant to evidence retrieved by authoritative providers:
- Queries Stellar RPC (`getTransaction`) and Horizon to verify:
  1. Transaction exists on the ledger.
  2. Transaction execution status is `SUCCESS`.
  3. Source and destination account match requirements.
  4. Asset code and issuer match requirements.
  5. Payment operation amount matches requirement.

### 4. Verdict Synthesis (`verdictEngine.ts`)
Synthesizes a structured, mathematical verdict:
- `VERIFIED`: 100% of required invariants pass independent deterministic checks.
- `FAILED`: One or more mandatory invariants fail (e.g., payment amount deficit or non-existent transaction).
- `UNVERIFIABLE`: Worker output lacks necessary cryptographic anchors (e.g. omitted transaction hash).

### 5. Remediation Loop (`remediationEngine.ts`)
When a verification fails, the engine generates actionable remediation directives:
- Calculates exact deficits (e.g. `Difference: -4.50 USDC`).
- Formulates corrective directives (e.g., `Execute supplemental payment of 4.50 USDC to GCEYAU...`).
- Allows the agent to self-correct and resubmit up to `maxAttempts` (default: 3).
