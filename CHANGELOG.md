# Changelog

All notable changes to the VeraOS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-09-15

### Major Architectural Migration
- **Stellar-Native Engine**: Migrated the entire core verification architecture to native Stellar Testnet integration.
- **Removed Legacy Base Stack**: Completely excised outdated Base L2, BaseScan, Ethereum Attestation Service (EAS), and TLS-Notary references across all frontend components, mock datasets, navigation menus, and backend evidence providers.

### Added
- **Deterministic Verification Kernel (`server/verification/engine.ts`)**:
  - Implemented the pure 7-step verification pipeline: Task Submission -> Requirement Extraction -> Claim Extraction -> Independent Evidence Retrieval -> Deterministic Checks -> Structured Verdict -> Remediation Generator.
  - Added pure deterministic checks: `TX_EXISTS`, `TX_SUCCESSFUL`, `RECIPIENT_MATCH`, `AMOUNT_MATCH`, and `ASSET_MATCH`.
  - Added 4-state verdict model: `VERIFIED`, `FAILED`, `PARTIAL`, and `UNVERIFIABLE` with mathematical rejection guarantees (`UNVERIFIABLE ≠ VERIFIED`).
- **Stellar Horizon Evidence Provider (`server/verification/evidenceProviders/stellarProvider.ts`)**:
  - Direct ledger lookup for confirmed transactions via Horizon `/transactions/{hash}` and `/operations`.
  - Added deterministic check evaluation for payment operations, native XLM, and credit assets (USDC) with strict address format validation (`G...`).
  - Added Soroban RPC state proof interface scaffold referencing official [Stellar RPC documentation](https://developers.stellar.org/docs/data/apis/rpc).
- **Telegram Verification Client (`server/telegram/bot.ts`)**:
  - Implemented Telegram client interface executing against VeraOS REST API.
  - Added command dispatchers for `/start`, `/verify`, `/status`, `/evidence`, and `/correct`.
  - Added long-polling and webhook runner options for bot operations without exposing secrets to chat streams.
- **Remediation & Correction Loop (`server/verification/remediation.ts`)**:
  - Automated calculation of missing deltas for underpaid transactions or invalid execution outputs.
  - Generation of structured remediation payloads for autonomous worker agent resubmission.
  - Multi-attempt verification history tracking linked via `previousAttemptId`.
- **REST API Endpoints (`server/api/routes.ts`)**:
  - `POST /v1/verify` — Submit task and worker output for verification.
  - `GET /v1/verify` — List and filter verification runs with pagination.
  - `GET /v1/verify/:id` — Retrieve comprehensive verification details, checks, and evidence.
  - `POST /v1/verify/:id/correct` — Calculate remediation guidance.
  - `POST /v1/verify/:id/resubmit` — Ingest corrective execution for re-verification.
- **Automated Verification Test Suite**:
  - `server/tests/engine.test.ts` (6 test suites verifying deterministic check mechanics, deceptive amounts, and non-existent transaction rejections).
  - `server/tests/stellar.test.ts` (5 test suites validating Stellar Horizon query parsing, payment extraction, and tolerance matching).
- **Stellar Freighter Wallet Integration (`src/context/AuthContext.tsx`, `src/components/auth/AuthModal.tsx`)**:
  - Connect flow for Stellar Freighter wallet and public G-addresses.
- **Comprehensive Documentation**:
  - Completely rewritten 20-section `README.md` reflecting today's working code, zero-trust security model, and Stellar RPC reference.

### Changed
- Updated frontend presets in `src/pages/NewVerification.tsx` to showcase real Stellar scenarios (USDC settlement, payment amount mismatch, ledger proof).
- Updated `src/pages/EvidenceExplorer.tsx`, `src/pages/CorrectionLoop.tsx`, and `src/components/verification/TriangulatedEvidence.tsx` to display Stellar Horizon receipts and ledger sequence metadata.
- Polished color palette to match signature Deep Brown (`#160C08`), Cocoa (`#21110B`), Warm Orange (`#C96A2B`), and Cream (`#F3E5D5`) aesthetic with high-contrast accessibility.

---

## [0.1.0] - 2026-09-12

### Added
- Initial project prototype and UI design system for VeraOS dashboard.
- Verification processing visualizer and UI screen scaffolding.
