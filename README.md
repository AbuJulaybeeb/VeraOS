# VeraOS

**The verification layer for AI agents.**  
*Verify before you trust.*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/k-deejah/VeraOS)
[![Tests](https://img.shields.io/badge/tests-11%2F11%20passing-brightgreen)](https://github.com/k-deejah/VeraOS)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet%20%7C%20Horizon-black?logo=stellar)](https://developers.stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Autonomous AI agents are increasingly entrusted with high-stakes actions: settling payments, deploying liquidity, generating reports, and modifying cloud infrastructure. However, agents self-report their success. When an agent reports *"Payment of 100 USDC executed successfully"*, systems have historically trusted that claim at face value. **VeraOS** replaces blind trust with automated, deterministic verification. Sitting between task orchestrators and autonomous agents, VeraOS independently extracts requirements, pulls authoritative ground-truth evidence directly from primary sources (such as the Stellar blockchain ledger), runs deterministic verification checks, and renders an un-forgeable verdict with actionable remediation.

---

## 1. Hero

- **Name**: VeraOS
- **Tagline**: The verification layer for AI agents.
- **Core Statement**: Verify before you trust.
- **Mission**: Provide an independent, non-custodial, deterministic verification layer that reconciles agent self-reported claims against ground-truth external evidence before actions are settled or trusted.

---

## 2. Why VeraOS?

### The Self-Reporting Fallacy
Large language models and autonomous agent frameworks suffer from a structural flaw when operating in economic environments: **the self-reporting fallacy**. 

When an agent executes an instruction, it produces an execution summary:
- An agent may hallucinate a completed payment or invent a 64-character transaction hash.
- An agent may execute a partial payment (e.g., sending 0.5 USDC instead of 5.0 USDC) due to slippage or parameter errors, yet report full completion.
- An agent may send funds to the wrong recipient address or use an untrusted asset issuer.
- An agent may report success when the underlying blockchain transaction failed with an error code.

Relying on an agent's self-generated status report creates catastrophic operational risk for autonomous multi-agent pipelines.

### The Fundamental Distinction: Claim vs. Evidence vs. Verdict

VeraOS enforces a strict mathematical and epistemological separation between three concepts:

```
┌────────────────────────────────────────────────────────┐
│ 1. CLAIM (What the worker agent says happened)         │
│    - Unverified assertion                              │
│    - Extracted from raw LLM output or JSON receipt     │
│    - Status: Untrusted                                 │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. EVIDENCE (What independently verifiable sources say)│
│    - Ground-truth data fetched by VeraOS kernel        │
│    - Primary ledger data from Stellar Horizon / RPC    │
│    - Status: Authoritative                             │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. VERDICT (Mathematical reconciliation of 1 & 2)      │
│    - Deterministic comparison (exact, bounded, regex)  │
│    - Structured outcome: VERIFIED, FAILED, etc.        │
│    - Status: Final cryptographic / system truth        │
└────────────────────────────────────────────────────────┘
```

1. **Worker Claim**: What the worker agent asserts took place (e.g., *"Transferred 5 USDC to GBBD47...FLA5 via tx 4a9f..."*).
2. **Independent Evidence**: Objective, tamper-proof facts gathered directly by VeraOS independently of the worker (e.g., Stellar Horizon transaction query showing fee paid, operations list, destination address `GBBD47...FLA5`, asset `USDC`, and actual transferred amount `0.5`).
3. **Verdict**: The deterministic adjudication produced by comparing the claims against the evidence according to explicit task requirements.

---

## 3. How It Works

VeraOS executes an end-to-end 7-step verification pipeline:

```
[1. Task Submission]
        │
        ▼
[2. Requirement Extraction]  ──► [Target Address, Expected Amount, Asset Code, Network]
        │
        ▼
[3. Claim Extraction]        ──► [Reported Tx Hash, Reported Amount, Worker Status]
        │
        ▼
[4. Independent Evidence]    ──► [Stellar Horizon Ledger Lookup / Operation Receipt]
        │
        ▼
[5. Deterministic Checks]    ──► [TX_EXISTS, TX_SUCCESS, RECIPIENT_MATCH, AMOUNT_MATCH]
        │
        ▼
[6. Structured Verdict]      ──► [VERIFIED | FAILED | PARTIAL | UNVERIFIABLE]
        │
        ▼
[7. Remediation & Loop]      ──► [Generates precise delta instructions if FAILED]
```

### The 7-Step Verification Pipeline

1. **Task Submission**: The client or orchestrator submits a task specification along with the worker agent's raw output via the VeraOS API or UI.
2. **Requirement Extraction**: The engine parses task requirements (recipient address, expected token amount, asset code, network, deadline, invariants).
3. **Worker Claim Extraction**: The engine parses the worker's execution response, extracting transaction hashes, reported addresses, claimed transferred amounts, and claimed success status.
4. **Independent Evidence Retrieval**: The verification engine queries authoritative external endpoints (Stellar Horizon Testnet / Stellar RPC) using the extracted transaction identifier. The worker is never asked for evidence.
5. **Deterministic Verification Checks**: A battery of pure deterministic checks are executed:
   - `TX_EXISTS`: Did the transaction get confirmed on the ledger?
   - `TX_SUCCESSFUL`: Is the transaction result code `tx_SUCCESS`?
   - `RECIPIENT_MATCH`: Does the operation payment destination match the requirement?
   - `AMOUNT_MATCH`: Does the confirmed transferred amount equal the required amount (within configured tolerance)?
   - `ASSET_MATCH`: Does the asset code and issuer match the requested currency?
6. **Structured Verdict**: Individual check results are aggregated into an overall verdict with a verification score (0–100) and an immutable breakdown.
7. **Remediation & Correction Loop**: If any check fails, VeraOS automatically calculates the exact delta (e.g., missing 4.5 USDC) and generates a structured remediation payload with resubmission tracking.

---

## 4. Stellar-Native Verification

VeraOS is natively integrated with the **Stellar Network**, leveraging its fast finality (3–5 second ledger close times), low transaction fees, and transparent asset settlement model.

### Verification Mechanism on Stellar
When an agent submits a Stellar payment or action, VeraOS verifies the ledger state:
1. **Transaction Hash Lookup**: VeraOS queries the Stellar Horizon API (`/transactions/{hash}`) or Stellar RPC to confirm ledger inclusion.
2. **Ledger Confirmation & Status**: Verifies that `successful === true` and extracts the ledger sequence number and close timestamp.
3. **Operation Breakdown**: Fetches operations from `/transactions/{hash}/operations` to inspect individual payment, create_account, or path_payment operations.
4. **Account & Recipient Validation**: Checks that the destination account public key matches the task specification (Stellar G-address format: `G...`).
5. **Asset & Amount Precision**: Validates native XLM or issued asset credit (`asset_code`, `asset_issuer`, and numerical `amount` parsed with strict decimal precision).

### Stellar RPC & Soroban Smart Contracts
VeraOS is architected to utilize official **Stellar RPC** interfaces for smart contract verification on Soroban:
- Reference Documentation: [Stellar RPC Official Documentation](https://developers.stellar.org/docs/data/apis/rpc)
- Current Implementation Status:
  - **Horizon Transaction & Payment Verification**: `✅ Fully Implemented` (queries live Testnet or mock fallback).
  - **Soroban Smart Contract State Proofs**: `🔧 Scaffolded` (`server/verification/evidenceProviders/stellarProvider.ts` includes `fetchSorobanContractState` querying Stellar RPC `getTransaction` and `getLedgerEntries`).

---

## 5. Telegram as a Verification Interface

VeraOS provides a Telegram interface. It is crucial to understand: **Telegram is NOT a generic chatbot — it is a lightweight, responsive UI client for the VeraOS verification platform.**

### Telegram Architecture

```
┌─────────────────┐       ┌────────────────────────┐       ┌───────────────────────┐
│ User / Auditor  │       │  VeraOS Telegram Bot   │       │   VeraOS REST API     │
│  (Telegram UI)  │ ◄───► │ (server/telegram/bot)  │ ◄───► │ (/v1/verify endpoints)│
└─────────────────┘       └────────────────────────┘       └───────────┬───────────┘
                                                                       │
                                                                       ▼
                                                           ┌───────────────────────┐
                                                           │  Verification Kernel  │
                                                           │  & Stellar Providers  │
                                                           └───────────────────────┘
```

### Supported Telegram Commands
- `/start` — Welcome message, system status overview, and quick command reference.
- `/verify <tx_hash>` or `/verify <task_spec> | <worker_output>` — Submit an agent claim or Stellar transaction hash for instant verification.
- `/status <verification_id>` — Fetch the real-time status and verdict for an existing verification job.
- `/evidence <verification_id>` — Retrieve detailed independent evidence artifacts collected from Stellar Horizon.
- `/correct <verification_id>` — Retrieve structured remediation steps and correction history if a verification has failed.

### How Verification Reports Render in Telegram
When a verification executes, the bot formats a structured card directly in the chat:
```text
🛡️ VeraOS Verification Report
══════════════════════════════════════
ID: ver_9e2f418b7c3d
Verdict: ❌ FAILED (Score: 25/100)
Network: Stellar Testnet

📋 Checks Breakdown:
  ✅ TX_EXISTS: Confirmed in ledger #582194
  ✅ TX_SUCCESSFUL: Status successful
  ✅ RECIPIENT_MATCH: Destination GBBD47...FLA5
  ❌ AMOUNT_MATCH: Expected 5.0000000 USDC, got 0.5000000 USDC

🔍 Independent Evidence:
  • Source: Stellar Horizon Testnet
  • Tx: 4a9f2c...881b
  • Asset: USDC (GBBD47...FLA5)
  • Actual Amount: 0.5000000

⚠️ Remediation:
  Transfer remaining 4.5 USDC to recipient GBBD47...FLA5 to complete task requirements.
```

---

## 6. Verification Data Model

The VeraOS core verification engine is built on immutable, strongly-typed TypeScript domain models located in `server/verification/types.ts`:

### 1. Worker Claim (`WorkerClaim`)
Represents an assertion extracted from the worker agent's output:
```typescript
interface WorkerClaim {
  id: string;
  type: 'tx_hash' | 'amount' | 'recipient' | 'asset' | 'status' | 'custom';
  rawText: string;
  extractedValue: any;
  confidence: number; // 0.0 to 1.0
}
```

### 2. Independent Evidence (`IndependentEvidence`)
Ground-truth observations gathered by VeraOS independent of the worker:
```typescript
interface IndependentEvidence {
  id: string;
  source: 'stellar_horizon' | 'stellar_rpc' | 'deterministic' | 'web_oracle';
  sourceUri: string;
  retrievedAt: string;
  data: Record<string, any>;
  signatureOrProof?: string;
}
```

### 3. Verification Check (`VerificationCheck`)
A discrete deterministic comparison between requirements, claims, and evidence:
```typescript
interface VerificationCheck {
  id: string;
  name: string;
  description: string;
  category: 'blockchain' | 'computation' | 'format' | 'invariant';
  status: 'passed' | 'failed' | 'inconclusive' | 'skipped';
  claimId?: string;
  evidenceId?: string;
  details: string;
}
```

### 4. The 4 Verdict Types

| Verdict | Meaning | System Action |
| :--- | :--- | :--- |
| **`VERIFIED`** | All critical checks passed with 100% certainty against independent evidence. | Task marked complete; settlement authorized. |
| **`FAILED`** | One or more deterministic checks contradicted worker claims (e.g. amount mismatch, wrong recipient). | Rejection triggered; remediation generated; correction loop initiated. |
| **`PARTIAL`** | Non-critical checks succeeded, but optional criteria were missed or minor deviations occurred. | Flagged for operator review or secondary confirmation. |
| **`UNVERIFIABLE`** | Independent evidence could not be obtained (e.g., tx hash not found on ledger, endpoint timeout). | **Rejected by default.** |

> [!IMPORTANT]
> **UNVERIFIABLE ≠ VERIFIED.**  
> An unprovable claim is never accepted as true. In VeraOS, if evidence cannot be established with mathematical certainty, the claim is rejected.

---

## 7. The Correction Loop

When an agent's execution fails verification, VeraOS does not simply terminate the workflow. It initiates the **Correction Loop**:

```
[FAILED VERDICT]
       │
       ▼
[Remediation Generator] ────► Computes delta (e.g., -4.5 USDC, invalid memo)
       │
       ▼
[Structured Instructions] ──► Dispatches actionable guidance to Worker Agent
       │
       ▼
[Worker Resubmission]    ──► Worker submits new transaction or output
       │
       ▼
[Re-Verification]        ──► VeraOS evaluates Attempt N+1 against total spec
       │
       ▼
[Attempt History]        ──► Appends to immutable audit trail (Attempt 1, 2, ...)
```

1. **Failure Analysis**: The engine pinpoints the exact check failure (`AMOUNT_MISMATCH`, `RECIPIENT_MISMATCH`, etc.).
2. **Remediation Instruction Generation**: The remediation engine produces a machine-readable fix (e.g., *"Transfer remaining 4.5 USDC to recipient GBBD47...FLA5 with memo 10482"*).
3. **Worker Resubmission**: The worker agent consumes the remediation instructions and performs a corrective action (e.g., executing the supplementary transaction).
4. **Re-Verification & State Transition**: VeraOS verifies the resubmitted claim and links the attempts into a unified verification history graph (`previousAttemptId`, `attemptNumber`).

---

## 8. Architecture

```
                      ┌─────────────────────────────────┐
                      │    User Interface & Clients     │
                      │ ┌──────────────┐ ┌────────────┐ │
                      │ │ React 19 SPA │ │Telegram Bot│ │
                      │ └──────┬───────┘ └─────┬──────┘ │
                      └────────┼───────────────┼────────┘
                               │ HTTP / JSON   │ HTTP / JSON
                               ▼               ▼
                      ┌─────────────────────────────────┐
                      │     VeraOS Express API Server   │
                      │    (server/api/routes.ts)       │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │   Core Verification Engine      │
                      │  (server/verification/engine)   │
                      ├────────────────┬────────────────┤
                      │ • Claim Extr.  │ • Req. Extr.   │
                      │ • Check Kernel │ • Verdict Eval │
                      │ • Remediation  │ • Loop Manager │
                      └───────┬────────┴────────┬───────┘
                              │                 │
              ┌───────────────▼─┐             ┌─▼──────────────┐
              │ Stellar Horizon │             │ In-Memory      │
              │  & RPC Provider │             │ Verification   │
              │(Live Testnet/RPC│             │ Repository     │
              └─────────────────┘             └────────────────┘
```

---

## 9. Project Structure

```text
vera-os/
├── server/                               # Node.js / TypeScript Verification Backend
│   ├── api/
│   │   ├── routes.ts                     # Express REST API endpoints (/v1/verify)
│   │   └── server.ts                     # API server bootstrap and middleware
│   ├── telegram/
│   │   └── bot.ts                        # Telegram client interface (commands & runner)
│   ├── tests/
│   │   ├── engine.test.ts                # Deterministic check kernel unit tests
│   │   └── stellar.test.ts               # Stellar Horizon evidence provider tests
│   └── verification/
│       ├── claimExtractor.ts             # Regex and heuristic claim extraction
│       ├── engine.ts                     # 7-step verification orchestration engine
│       ├── evidenceProviders/
│       │   ├── deterministicProvider.ts  # Mathematical & algorithmic proof checks
│       │   ├── stellarProvider.ts        # Stellar Horizon & Soroban RPC integration
│       │   └── webProvider.ts            # Web oracle & hash validation scaffold
│       ├── remediation.ts                # Actionable failure delta calculation
│       ├── repository.ts                 # State persistence & verification history
│       ├── requirementExtractor.ts       # Task spec parser (assets, amounts, keys)
│       └── types.ts                      # Core domain type definitions
├── src/                                  # Production React 19 Frontend (Vite + Tailwind)
│   ├── components/
│   │   ├── auth/                         # Freighter & Stellar wallet connect modal
│   │   ├── layout/                       # Responsive Header, Sidebar, Navigation
│   │   ├── notifications/                # Live alerts and activity popover
│   │   ├── search/                       # Keyboard command palette (Ctrl+K)
│   │   └── verification/                 # ClaimsVsEvidence, TriangulatedEvidence,
│   │                                     # RemediationPanel, TaskSpecCard
│   ├── context/
│   │   ├── AuthContext.tsx               # Stellar wallet session state
│   │   └── ThemeContext.tsx              # Warm brown / dark mode theme provider
│   ├── mocks/
│   │   ├── agentsData.ts                 # Connected worker agent profiles
│   │   └── verificationData.ts           # Stellar Testnet verification scenarios
│   ├── pages/
│   │   ├── ConnectAgent.tsx              # Agent registration & API key management
│   │   ├── CorrectionLoop.tsx            # Multi-attempt remediation inspection UI
│   │   ├── Dashboard.tsx                 # Real-time verification metrics & feed
│   │   ├── EvidenceExplorer.tsx          # Raw Stellar Horizon receipt inspector
│   │   ├── NewVerification.tsx           # Manual task submission form & presets
│   │   ├── Settings.tsx                  # Network & endpoint configuration
│   │   ├── VerificationDetail.tsx        # Comprehensive check breakdown view
│   │   └── VerificationProcessing.tsx    # Live pipeline step visualizer
│   ├── services/
│   │   ├── agentsApi.ts                  # Agent management service
│   │   ├── api.ts                        # HTTP client base utilities
│   │   └── verificationApi.ts            # Client SDK for VeraOS REST API
│   ├── App.tsx                           # React Router v7 application shell
│   ├── index.css                         # Custom Tailwind utilities & warm palette
│   └── main.tsx                          # React DOM entrypoint
├── CHANGELOG.md                          # Version release and migration logs
├── package.json                          # Scripts, dependencies, and metadata
├── tsconfig.json                         # TypeScript compiler configuration
└── vite.config.ts                        # Vite frontend bundler configuration
```

---

## 10. API Reference

The VeraOS server exposes a RESTful JSON API versioned under `/v1`.

### 1. `POST /v1/verify`
Submit a new verification job.

**Request Body**:
```json
{
  "taskSpec": {
    "title": "USDC Settlement to Liquidity Pool",
    "description": "Transfer 5.0 USDC to GBBD472N...FLA5",
    "expectedOutputs": [
      {
        "type": "payment",
        "recipient": "GBBD472N...FLA5",
        "amount": 5.0,
        "asset": "USDC"
      }
    ],
    "network": "stellar-testnet"
  },
  "workerOutput": {
    "workerId": "agent-soroban-settler-01",
    "rawOutput": "Payment of 5.0 USDC submitted via tx 4a9f2c7d91e840182390b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
    "declaredSuccess": true,
    "timestamp": "2026-09-15T08:30:00Z"
  }
}
```

**Response (`201 Created`)**:
```json
{
  "id": "ver_9e2f418b7c3d",
  "taskSpec": { ... },
  "workerOutput": { ... },
  "claims": [ ... ],
  "evidence": [ ... ],
  "checks": [
    {
      "id": "chk_tx_exists",
      "name": "TX_EXISTS",
      "status": "passed",
      "details": "Transaction verified on Stellar Horizon."
    },
    {
      "id": "chk_amount",
      "name": "AMOUNT_MATCH",
      "status": "passed",
      "details": "Transferred amount 5.0000000 matches expected 5.0000000."
    }
  ],
  "verdict": {
    "result": "VERIFIED",
    "score": 100,
    "summary": "All 4 verification checks passed against Stellar Testnet ledger."
  },
  "status": "completed",
  "createdAt": "2026-09-15T08:30:01Z"
}
```

### 2. `GET /v1/verify`
Retrieve a paginated list of verification jobs.
- **Query Parameters**:
  - `limit` (number, default: 20)
  - `offset` (number, default: 0)
  - `status` (string, optional: `completed`, `pending`, `failed`)

### 3. `GET /v1/verify/:id`
Retrieve the complete verification record by ID, including all extracted claims, collected evidence, discrete checks, verdict, and remediation data.

### 4. `POST /v1/verify/:id/correct`
Trigger a correction generation calculation for a failed verification record. Returns the required remediation actions and updated status.

### 5. `POST /v1/verify/:id/resubmit`
Submit a corrective execution output for an existing failed verification.
- **Request Body**:
  ```json
  {
    "workerOutput": {
      "workerId": "agent-soroban-settler-01",
      "rawOutput": "Supplemental payment of 4.5 USDC completed via tx 881b2c...",
      "declaredSuccess": true
    }
  }
  ```
- **Response**: Creates an incremental verification record linked via `previousAttemptId` and updates the correction history.

---

## 11. Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/k-deejah/VeraOS.git
   cd VeraOS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the test suite**:
   ```bash
   npm test
   ```
   *Executes the Node.js native test runner verifying the deterministic verification engine and Stellar Horizon evidence provider.*

4. **Start the verification API server**:
   ```bash
   npm run server
   ```
   *Runs the Express REST API at `http://localhost:3001`.*

5. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   *Launches the Vite development server at `http://localhost:5173`.*

6. **Create a production build**:
   ```bash
   npm run build
   ```
   *Compiles TypeScript and bundles the frontend with Vite.*

---

## 12. Environment Variables

Configure environment variables by creating a `.env` file in the project root:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Port on which the VeraOS REST API server listens. |
| `STELLAR_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Authoritative Stellar Horizon endpoint for ledger queries. |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` | Stellar RPC endpoint for Soroban smart contract state queries. |
| `TELEGRAM_BOT_TOKEN` | *(empty)* | Bot token provided by Telegram's `@BotFather`. |
| `TELEGRAM_WEBHOOK_URL`| *(empty)* | Optional webhook URL for Telegram updates (uses polling if unset). |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`). |
| `VERA_API_URL` | `http://localhost:3001` | URL of the VeraOS REST API used by frontend and bot clients. |

---

## 13. Stellar Development

VeraOS targets the **Stellar Testnet** by default, allowing risk-free verification testing with native assets and custom tokens.

### Useful Stellar Developer Resources
- **Stellar Laboratory**: Test transactions, fund test accounts, and build operations:  
  [https://laboratory.stellar.org/](https://laboratory.stellar.org/)
- **Stellar Friendbot**: Fund any new `G...` account with 10,000 Testnet XLM:  
  `https://friendbot.stellar.org?addr={YOUR_PUBLIC_KEY}`
- **Stellar Expert (Testnet Explorer)**: Inspect transactions, ledgers, and accounts:  
  `https://stellar.expert/explorer/testnet/`

### Generating a Test Payment
To test live verification against Stellar Testnet:
1. Create two test accounts using the Stellar Laboratory.
2. Fund the source account via Friendbot.
3. Submit a Payment operation of `5.0000000` XLM (or test USDC) from Source to Destination.
4. Copy the resulting 64-character transaction hash.
5. Submit the hash to VeraOS via `POST /v1/verify` or via the web UI at `/verify/new`.

---

## 14. Security Model

VeraOS is engineered from first principles around a **zero-trust security model**:

1. **Zero Trust in Worker Agents**: The worker agent is treated as an untrusted adversary or fallible actor. No claim, status flag, or hash submitted by the worker is accepted as evidence.
2. **Deterministic Adjudication**: All comparisons (hashes, addresses, token amounts) are performed deterministically in memory without relying on non-deterministic LLM evaluation. Numerical values use strict bounded tolerances to prevent rounding exploits.
3. **Non-Custodial Architecture**: VeraOS never requests, stores, or handles private keys, seed phrases, or signing credentials. VeraOS verifies state; it does not custody user funds.
4. **Isolated Telegram Surface**: The Telegram bot operates strictly as an unprivileged client calling the public REST API. No private keys, database credentials, or secret variables are accessible through the chat interface.

---

## 15. Current Implementation Status

This status matrix represents the current verified state of the codebase:

| Component / Subsystem | Status | Notes |
| :--- | :---: | :--- |
| **Verification Engine** | `✅ IMPLEMENTED` | 7-step orchestration pipeline in `server/verification/engine.ts`. |
| **Requirement Extraction** | `✅ IMPLEMENTED` | Parses task specs, recipients, expected amounts, and asset codes. |
| **Worker Claim Extraction** | `✅ IMPLEMENTED` | Regex & heuristic parser for tx hashes, claimed amounts, and status. |
| **Evidence Domain Model** | `✅ IMPLEMENTED` | Strongly-typed interfaces for receipts, proofs, and ledger states. |
| **Deterministic Check Kernel**| `✅ IMPLEMENTED` | `TX_EXISTS`, `TX_SUCCESS`, `RECIPIENT_MATCH`, `AMOUNT_MATCH`. |
| **Verdict Engine** | `✅ IMPLEMENTED` | Generates `VERIFIED`, `FAILED`, `PARTIAL`, `UNVERIFIABLE` with scoring. |
| **Remediation Generator** | `✅ IMPLEMENTED` | Calculates precise numerical deltas and machine-readable instructions. |
| **Correction Loop** | `✅ IMPLEMENTED` | Multi-attempt lifecycle tracking with `previousAttemptId` linkage. |
| **REST API Server** | `✅ IMPLEMENTED` | Express server with `/v1/verify` endpoints (`server/api/routes.ts`). |
| **Stellar Horizon Provider**| `✅ IMPLEMENTED` | Queries `/transactions/{hash}` and `/operations` with live ledger checks. |
| **Stellar RPC / Soroban** | `🔧 SCAFFOLDED` | Scaffolded in `stellarProvider.ts` referencing official RPC spec. |
| **Web Oracle Evidence** | `🔧 SCAFFOLDED` | Scaffolded in `server/verification/evidenceProviders/webProvider.ts`. |
| **Telegram Bot** | `🟡 PARTIAL` | Bot commands implemented in `server/telegram/bot.ts`; runner operational. |
| **State Persistence** | `🟡 PARTIAL` | In-memory repository with local client persistence; database planned. |
| **React 19 Frontend** | `✅ IMPLEMENTED` | Production SPA with Dashboard, Detail, Explorer, and Correction Loop. |
| **Automated Test Suite** | `✅ IMPLEMENTED` | 11/11 tests passing (`engine.test.ts`, `stellar.test.ts`). |
| **Mobile Responsiveness** | `✅ IMPLEMENTED` | Responsive navigation, drawer menu, and mobile-friendly tables. |

*Legend: `✅ IMPLEMENTED` (Production code + tests), `🟡 PARTIAL` (Functional, non-production persistence/secret handling), `🔧 SCAFFOLDED` (Type definitions & stub methods ready for integration), `📋 PLANNED` (Roadmap).*

---

## 16. Roadmap

- **Phase 1: Core Deterministic Verification Engine (CURRENT)**
  - Pure deterministic check kernel.
  - Stellar Horizon transaction and payment verification.
  - In-memory verification history and correction loop.
  - Responsive web dashboard and verification explorer.
- **Phase 2: Soroban Smart Contract Verification via Stellar RPC**
  - Query contract state proofs directly via `https://soroban-testnet.stellar.org`.
  - Verification of Soroban token transfers, liquidity pool shares, and contract events.
- **Phase 3: Web Evidence Verification (HTTP Receipts & Hash Proofs)**
  - Cryptographic verification of HTTP response bodies and API payloads.
  - Structured SHA-256 hash invariant checking for data pipelines.
- **Phase 4: Full Interactive Telegram Verification Flow**
  - Interactive inline Telegram buttons for accepting/rejecting remediations.
  - Webhook secret verification and multi-tenant bot sessions.
- **Phase 5: Persistent Storage & Multi-Tenant Authentication**
  - PostgreSQL backing store with Prisma / Drizzle ORM.
  - Stellar wallet-based authentication (Freighter signature challenge).
- **Phase 6: Agent Marketplace & On-Chain Verification Registry**
  - Public directory of verified autonomous worker agents with reliability ratings.
  - Anchoring of verification verdict proofs directly to Stellar ledger memos or Soroban registry.

---

## 17. Example Verification Walkthrough

### Scenario: Deceptive Worker Agent Execution

#### 1. The Task Specification
A DeFi automated manager creates a settlement task:
- **Task**: *"Transfer 5.0 USDC to vendor liquidity reserve account GBBD472NLB5XW766K6S73M45O76V6PVO3YF3N27N3HXZRLL5FLA5 on Stellar Testnet."*
- **Expected Amount**: `5.0000000`
- **Expected Recipient**: `GBBD47...FLA5`
- **Asset**: `USDC`

#### 2. Worker Agent Submission
The worker agent experiences a slippage miscalculation or acts deceptively. It executes a partial payment of `0.5 USDC` but reports full success:
- **Worker Report**: *"Task complete! Transferred 5.0 USDC to GBBD47...FLA5 via Stellar tx hash 4a9f2c7d91e840182390b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2."*
- **Worker Declared Status**: `SUCCESS`

#### 3. VeraOS Verification Execution
1. **Extraction**:
   - Extracted Worker Claim: Amount = `5.0`, Recipient = `GBBD47...FLA5`, Tx = `4a9f...d1e2`.
2. **Evidence Retrieval**:
   - VeraOS queries Stellar Horizon: `GET /transactions/4a9f...d1e2/operations`.
   - Authoritative Result: Operation 1 destination = `GBBD47...FLA5`, asset = `USDC`, **amount = 0.5000000**.
3. **Deterministic Checks**:
   - `TX_EXISTS`: Passed.
   - `TX_SUCCESSFUL`: Passed.
   - `RECIPIENT_MATCH`: Passed (`GBBD47...FLA5` === `GBBD47...FLA5`).
   - `AMOUNT_MATCH`: **FAILED** (Expected `5.0`, Ground Truth Evidence `0.5`).

#### 4. The Verdict & Remediation
- **Verdict**: `FAILED` (Verification Score: 25/100).
- **Automated Remediation**:
  ```json
  {
    "action": "SUBMIT_CORRECTIVE_PAYMENT",
    "requiredDelta": 4.5,
    "asset": "USDC",
    "recipient": "GBBD47...FLA5",
    "instructions": "Worker transferred 0.5 USDC instead of the required 5.0 USDC. Execute a supplementary transfer of 4.5 USDC to complete the requirement."
  }
  ```

---

## 18. Design System & Frontend

The VeraOS web interface is built using a custom aesthetic:

- **Color Palette**:
  - Deep Brown Background: `#160C08`
  - Card & Surface Cocoa: `#21110B`
  - Warm Accent Orange: `#C96A2B`
  - High-Contrast Text Cream: `#F3E5D5`
  - Muted Borders & Dividers: `#3D2317`
  - *(Strictly avoids generic blue and neon green dashboards)*.
- **Key Interface Screens**:
  - **Dashboard**: Real-time telemetry, verification throughput metrics, active agent registry, and live stream of verified/failed transactions.
  - **New Verification**: Interactive form with built-in presets (Deceptive Payment, Invariant Breach, Ledger Proof).
  - **Verification Detail**: Side-by-side reconciliation of Worker Claims vs. Independent Evidence with discrete check badges.
  - **Evidence Explorer**: Raw JSON payload inspector for Stellar Horizon receipts and ledger metadata.
  - **Correction Loop**: Multi-stage visual timeline tracking remediation resubmissions and delta resolution.
- **Accessibility & UX**:
  - Dark mode by default with a clean warm-light mode toggle.
  - Mobile-first responsive layout with slide-over drawer navigation and horizontal scrolling for dense data tables.

---

## 19. Contributing

We welcome contributions to VeraOS! To contribute:

1. **Fork the repository** on GitHub.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/stellar-rpc-integration
   ```
3. **Ensure strict code quality**:
   - Run tests: `npm test` (all tests must pass).
   - Run linter: `npm run lint` (zero warnings or errors).
   - Verify build: `npm run build` (TypeScript compilation must succeed).
4. **Submit a Pull Request** with a detailed description of the changes and testing evidence.

---

## 20. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
