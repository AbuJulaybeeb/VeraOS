# VeraOS Contributor Roadmap & Drips Wave Tasks

Welcome to the **VeraOS Contributor Roadmap**. VeraOS participates in the **Stellar Wave Program** on [Drips](https://drips.network), offering rewarded contribution cycles for open-source developers.

This document outlines our prioritized roadmap and details 6 ready-to-claim, contributor-sized tasks scoped specifically for Wave participants.

---

## Prioritized Roadmap Overview

### P0 — Submission Baseline (Completed)
- [x] Deterministic requirement and claim extraction engine.
- [x] Real Stellar RPC + Horizon evidence provider querying live Testnet ledger.
- [x] Envelope XDR parsing via `@stellar/stellar-sdk` for payment amounts, assets, and recipients.
- [x] Acceptance test: Deceptive worker detection (5.0 USDC claimed vs 0.5 USDC actual -> FAILED).
- [x] Dual-mode Telegram bot interface (long-polling runner + webhook endpoint).
- [x] GitHub Actions CI pipeline (Node 20/22 multi-version matrix).
- [x] Open-source hygiene (MIT License, SECURITY.md, CONTRIBUTING.md, Issue/PR templates).

### P1 — High Credibility & Ecosystem Value (Active Wave Tasks)
- [ ] **Task 1**: Persistent SQLite / PostgreSQL storage adapter for verification records.
- [ ] **Task 2**: Asynchronous Telegram completion webhook notifications.
- [ ] **Task 3**: Onchain Soroban Attestation Registry Contract in Rust.
- [ ] **Task 4**: Multi-operation Stellar transaction verification (batch payments, path payments).
- [ ] **Task 5**: Evidence dossier CSV / JSON export in Web Dashboard.
- [ ] **Task 6**: Soroban smart contract event parser for function call verification.

### P2 — Post-Wave Evolution (Future Enhancements)
- [ ] Decentralized Oracle consensus across multiple Soroban RPC nodes.
- [ ] SDK packages for Python (`pip install veraos`) and Go (`go get github.com/k-deejah/veraos-go`).
- [ ] Native Telegram WebApp / MiniApp interface for inline verification audits.
- [ ] Multi-asset liquidity pool slippage verification on Stellar DEX.

---

## Curated Drips Wave Backlog Tasks

### Task 1: Persistent SQLite / PostgreSQL Repository Adapter
- **Complexity**: `Medium` (25 Points)
- **Labels**: `wave-task`, `backend`, `database`

#### Summary
Replace the in-memory repository with an swappable SQLite / PostgreSQL persistent database layer using Kysely or Prisma, ensuring verification records and attempt histories survive server restarts.

#### Why It Matters
Currently, verification records are held in memory (`server/storage/memoryRepository.ts`). Production deployments require persistent durability across restarts and multi-instance scaling.

#### Acceptance Criteria
- [ ] Implement `SqliteRepository` satisfying the `IVerificationRepository` interface in `server/storage/repository.ts`.
- [ ] Use standard connection string via `DATABASE_URL` environment variable.
- [ ] Auto-run database migrations on startup.
- [ ] Store complete verification records, attempts, checks, evidence, and remediation directives.
- [ ] Add integration tests in `server/tests/repository.test.ts` verifying CRUD operations.
- [ ] Zero regressions to existing 28 automated tests (`npm test`).

#### Tech Stack
TypeScript, Node.js, SQLite / better-sqlite3 or Kysely.

#### Dependencies
None (Ready to claim).

---

### Task 2: Asynchronous Telegram Completion Webhook Notifications
- **Complexity**: `Medium` (25 Points)
- **Labels**: `wave-task`, `telegram`, `integrations`

#### Summary
Enable VeraOS to dispatch an automated Telegram push notification to the operator when an asynchronous verification run completes, especially when querying slow RPC or external oracle checks.

#### Why It Matters
When complex multi-check verifications take longer than a few seconds, users should not be forced to poll `/status`. The bot should proactively notify the user with the final verdict card.

#### Acceptance Criteria
- [ ] Add `telegramChatId` and `notifyOnComplete` flags to verification requests in `server/api/routes.ts`.
- [ ] When verification completes, if `telegramChatId` is present, automatically invoke `veraTelegramBot.sendMessage(chatId, verdictCard)`.
- [ ] Format verdict card with inline action buttons ("View Evidence", "Request Correction").
- [ ] Handle Telegram API network failures with graceful logging (do not block API response).
- [ ] Add unit tests verifying notification dispatch behavior in `server/tests/telegram.test.ts`.

#### Tech Stack
TypeScript, Telegram Bot API, Node.js.

#### Dependencies
None (Ready to claim).

---

### Task 3: Onchain Soroban Attestation Registry Contract in Rust
- **Complexity**: `High` (50 Points)
- **Labels**: `wave-task`, `soroban`, `rust`, `smart-contracts`

#### Summary
Build and deploy a Soroban smart contract written in Rust that records cryptographic attestation certificates on the Stellar network whenever a task is successfully `VERIFIED`.

#### Why It Matters
Currently, VeraOS stores verification results in backend storage. Anchoring attestations into Soroban contract storage provides immutable onchain provenance that other smart contracts can query.

#### Acceptance Criteria
- [ ] Create `contracts/attestation_registry/` containing a Soroban smart contract in Rust.
- [ ] Contract function `record_attestation(verification_id, task_hash, worker_address, verdict, timestamp)`.
- [ ] Contract function `get_attestation(verification_id)` returning attestation struct.
- [ ] Deploy contract to Stellar Testnet and document Contract ID.
- [ ] Include automated Rust unit tests with `cargo test`.
- [ ] Update `server/verification/pipeline.ts` to call contract invocation when `VERIFIED`.

#### Tech Stack
Rust, Soroban SDK (`soroban-sdk`), Stellar Testnet.

#### Dependencies
Stellar CLI (`stellar-cli`), Rust toolchain.

---

### Task 4: Multi-Operation Stellar Transaction Verification
- **Complexity**: `Medium` (25 Points)
- **Labels**: `wave-task`, `stellar`, `verification-engine`

#### Summary
Enhance `StellarRpcProvider` to inspect all operations within a Stellar transaction envelope, supporting batch payments, path payments (`pathPaymentStrictReceive`, `pathPaymentStrictSend`), and account merges.

#### Why It Matters
Agents often batch multiple transfers or perform DEX path payments in a single transaction. Currently, `stellarRpcProvider.ts` only inspects the first operation.

#### Acceptance Criteria
- [ ] Update `getTransaction()` in `server/verification/evidenceProviders/stellarRpcProvider.ts` to decode all operations in `tx.operations`.
- [ ] Aggregate total payment amount sent to `destinationAccount` across all operations in the envelope.
- [ ] Support both native XLM and asset credit payments (`Asset.getCode()`).
- [ ] Add test cases in `server/tests/stellarRpc.test.ts` for transactions with 3+ payment operations.

#### Tech Stack
TypeScript, `@stellar/stellar-sdk`, Soroban RPC.

#### Dependencies
None (Ready to claim).

---

### Task 5: Evidence Dossier CSV / JSON Export in Web Dashboard
- **Complexity**: `Trivial` (10 Points)
- **Labels**: `wave-task`, `frontend`, `ux`

#### Summary
Add an "Export Dossier" button on `VerificationDetail.tsx` and `EvidenceExplorer.tsx` allowing compliance officers to download the complete verification packet as JSON or CSV.

#### Why It Matters
Organizations deploying AI agents require downloadable audit trails for regulatory compliance, internal reporting, and dispute resolution.

#### Acceptance Criteria
- [ ] Add dropdown or button on `VerificationDetail.tsx`: "Export JSON" and "Export CSV".
- [ ] "Export JSON" downloads the raw, untruncated `VerificationRecord` object.
- [ ] "Export CSV" formats check name, status, expected, observed, delta, and Stellar explorer URL into spreadsheet rows.
- [ ] File naming convention: `veraos-verification-[displayId]-[timestamp].[json|csv]`.
- [ ] Test download interaction in web browsers.

#### Tech Stack
React 19, TypeScript, Tailwind CSS.

#### Dependencies
None (Ready to claim).

---

### Task 6: Soroban Smart Contract Event Parser
- **Complexity**: `High` (50 Points)
- **Labels**: `wave-task`, `soroban`, `oracle`

#### Summary
Implement a Soroban event evidence provider (`server/verification/evidenceProviders/sorobanEventProvider.ts`) that queries `getEvents` on Soroban RPC to verify that a worker agent triggered a specific contract event with expected topic and data parameters.

#### Why It Matters
When autonomous agents interact with Soroban protocols (e.g. minting tokens, providing liquidity, voting in DAOs), the ground-truth evidence is the emitted contract event.

#### Acceptance Criteria
- [ ] Implement `SorobanEventProvider` querying `getEvents` on `https://soroban-testnet.stellar.org`.
- [ ] Match event contract ID, topic XDR, and data XDR against requirement invariants.
- [ ] Extract human-readable values from ScVal XDR.
- [ ] Return structured `EvidenceResult` with status `passed` or `failed`.
- [ ] Add automated tests in `server/tests/sorobanEvent.test.ts`.

#### Tech Stack
TypeScript, `@stellar/stellar-sdk`, Soroban RPC JSON-RPC 2.0.

#### Dependencies
Task 4 (or independent).
