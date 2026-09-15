# VeraOS

**The verification layer for AI agents.**  
*Verify before you trust.*

[![CI](https://github.com/k-deejah/VeraOS/actions/workflows/ci.yml/badge.svg)](https://github.com/k-deejah/VeraOS/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-28%2F28%20passing-brightgreen)](https://github.com/k-deejah/VeraOS)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet%20%7C%20Soroban%20RPC-black?logo=stellar)](https://developers.stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)


Autonomous AI agents are increasingly entrusted with high-stakes actions: settling payments, dispatching bounties, deploying liquidity, and executing Soroban smart contracts on Stellar. However, agents self-report their success. When an agent reports *"Payment of 5 USDC executed successfully"*, systems have historically trusted that claim at face value. 

**VeraOS** replaces blind trust with automated, deterministic verification. Sitting between task orchestrators and autonomous agents, VeraOS independently extracts requirements, pulls authoritative ground-truth evidence directly from primary sources (such as the Stellar blockchain ledger), runs deterministic verification checks, and renders a structured verdict with actionable remediation directives.

---

## 1. Product Overview

- **Positioning**: The verification layer for AI agents.
- **Core Mantra**: Verify before you trust.
- **Problem**: Large language models and autonomous agent frameworks suffer from the **self-reporting fallacy**. An agent may hallucinate a transaction hash, underpay due to slippage or parameter error, send to the wrong recipient, or report success on a reverted transaction.
- **Solution**: VeraOS never treats an agent's words as evidence. It extracts the claimed hypothesis and independently proves or disproves it against authoritative blockchain RPC and cryptographic evidence.

---

## 2. Core Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        User & Operator Ingress                         │
│  - Web Dashboard (React 19 + Tailwind CSS)                             │
│  - Telegram Bot (@VeraOSBot via long-polling runner or webhook)        │
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

## 3. Real Stellar Testnet Verification

VeraOS connects directly to **Stellar Soroban RPC** (`https://soroban-testnet.stellar.org`) and **Stellar Horizon** (`https://horizon-testnet.stellar.org`), decoding the signed transaction envelope XDR via `@stellar/stellar-sdk`.

### Critical Benchmark Scenario: Deceptive Worker Detection
1. **Task**: *"Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L."*
2. **Worker Claim**: *"Payment completed. I sent 5 USDC to GCEYAU... via transaction 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759."*
3. **VeraOS Result**:
   - Queries Stellar RPC for hash `108822f6...`.
   - Discovers actual ledger payment operation transferred only **0.50 USDC**.
   - **Verdict**: `FAILED`.
   - **Structured Delta Check**:
     ```text
     Expected: 5 USDC
     Observed: 0.5 USDC
     Difference: -4.5 USDC
     Payment mismatch: Expected 5 USDC, but observed receipt shows 0.5 USDC (Deficit: 4.50 USDC).
     ```

### Live Testnet Verification Artifacts
| Role | Account / Transaction Hash | Explorer Link |
| :--- | :--- | :--- |
| **Recipient** | `GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L` | [View on Stellar.Expert](https://stellar.expert/explorer/testnet/account/GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L) |
| **Deceptive Tx (0.5 USDC)** | `108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759` | [View 0.5 USDC Tx](https://stellar.expert/explorer/testnet/tx/108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759) |
| **Corrected Tx (5.0 USDC)** | `62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf` | [View 5.0 USDC Tx](https://stellar.expert/explorer/testnet/tx/62256096f306726197208231b00e422628b0bb83e104dabed9a74da5186afbaf) |

---

## 4. Quick Start

### 1. Installation
```bash
git clone https://github.com/k-deejah/VeraOS.git
cd VeraOS
npm install
cp .env.example .env
```

### 2. Run Locally
```bash
# Start Vite development server + integrated API on http://localhost:5173
npm run dev

# Start standalone API server on http://localhost:3001
npm run server

# Start Telegram bot long-polling runner
npm run bot
```

### 3. Run Automated Tests
```bash
# Runs complete 28-test suite (engine, stellar, stellarRpc, telegram)
npm test

# Run linter and typecheck
npm run lint
npx tsc -b
```

### 4. Docker Deployment
```bash
# Run via Docker Compose
docker compose up --build
```

---

## 5. Telegram Bot Interface

VeraOS includes a dedicated, production-grade Telegram bot supporting both **long-polling** (`getUpdates`) and **webhook** modes.

### Commands
- `/start` — Welcome message and command guide.
- `/verify` — Start interactive verification or inline evaluation (`/verify <task> | <output>`).
- `/status <id>` — Check live status card of a verification.
- `/evidence <id>` — View onchain evidence and Stellar.Expert explorer links.
- `/correct <id> [note]` — Issue self-correction directive.
- `/resubmit <id> [tx]` — Re-evaluate with corrected transaction hash.

See [`docs/TELEGRAM_BOT.md`](./docs/TELEGRAM_BOT.md) for full configuration and security documentation.

---

## 6. REST API Reference

### Execute Verification: `POST /v1/verify`
```bash
curl -X POST http://localhost:5173/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Send 5 USDC to GCEYAUYCI3WTE5GOD7CDLRJQPATQCLHMXY4Q3CEQ64RP5SVDWPFF5L2L.",
    "worker": {
      "id": "agent-alpha-09",
      "output": "Payment completed via tx 108822f67b10e3ad38db576d60712939c1bdbe372c9d4729928d613605682759."
    }
  }'
```

See [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) for complete endpoint schemas.

---

## 7.  Contributor Roadmap

We offer curated, rewarded tasks for open-source contributors:



Check out [`docs/CONTRIBUTOR_ROADMAP.md`](./docs/CONTRIBUTOR_ROADMAP.md) to claim an issue!

---

## 8. Documentation Index

- [Architecture & Data Flow](./docs/ARCHITECTURE.md)
- [Stellar RPC & Horizon Integration](./docs/STELLAR_INTEGRATION.md)
- [Telegram Bot Guide](./docs/TELEGRAM_BOT.md)
- [REST API Reference](./docs/API_REFERENCE.md)
- [Contributor Roadmap ](./docs/CONTRIBUTOR_ROADMAP.md)
- [Demo Script & Video Narration](./docs/DEMO_SCRIPT.md)

---

## 9. Security & Governance

- **Security Policy**: See [`SECURITY.md`](./SECURITY.md) for vulnerability disclosure and reporting.
- **Contributing**: See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development workflows and PR templates.
- **License**: Released under the [MIT License](./LICENSE).
- **Maintainers**: Maintained by [@k-deejah](https://github.com/k-deejah) and the VeraOS Open Source Contributors.
